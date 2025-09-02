import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";

// Handler for POST requests (protected by auth)
async function submitWithdrawal(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get request body
    const data = await request.json();
    const { amount, currency, recipientAddress } = data;

    // Validate input
    if (!amount || !currency || !recipientAddress) {
      return NextResponse.json(
        { message: "Amount, currency, and recipient address are required" },
        { status: 400 }
      );
    }

    // Validate amount is a positive number (support decimals)
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { message: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Fetch user's withdrawable balance
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const available = Number(user.balance);

    // Compute totalProfit = plan profits + paid referral rewards (same as all-progress)
    const [progresses, referralPaidAgg] = await Promise.all([
      prisma.userPlanProgress.findMany({
        where: { userId: Number(userId) },
        select: { profit: true },
      }),
      prisma.referralReward.aggregate({
        where: { referrerId: Number(userId), status: "paid" },
        _sum: { amount: true },
      }),
    ]);

    const planProfit = progresses.reduce((sum, p) => sum + (p.profit || 0), 0);
    const referralProfit = Number(referralPaidAgg._sum.amount || 0);
    const totalProfit = planProfit + referralProfit;

    if (parsedAmount > totalProfit) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Only top-up what's needed to cover this withdrawal beyond current balance
    const neededTopUp = Math.max(0, parsedAmount - available);

    // Deduct from balance and create withdrawal atomically
    const result = await prisma.$transaction(async (tx) => {
      if (neededTopUp > 0) {
        // Pull neededTopUp from plan profits: decrement userPlanProgress.profit across records
        const progressesForUpdate = await tx.userPlanProgress.findMany({
          where: { userId: Number(userId), profit: { gt: 0 } },
          select: { id: true, profit: true },
          orderBy: { id: 'asc' },
        });

        let remaining = neededTopUp;
        for (const p of progressesForUpdate) {
          if (remaining <= 0) break;
          const take = Math.min(Number(p.profit || 0), remaining);
          if (take > 0) {
            await tx.userPlanProgress.update({
              where: { id: p.id },
              data: { profit: { decrement: take } },
            });
            remaining -= take;
          }
        }

        // Credit the user's balance by the exact top-up amount sourced from plan profits
        await tx.user.update({
          where: { id: Number(userId) },
          data: { balance: { increment: neededTopUp } },
        });
      }

      await tx.user.update({
        where: { id: Number(userId) },
        data: { balance: { decrement: parsedAmount } },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: Number(userId),
          amount: parsedAmount,
          currency,
          recipientAddress,
          status: "pending",
        },
      });

      return { withdrawal };
    });

    return NextResponse.json(
      {
        message:
          "Withdrawal request submitted successfully. It will be processed within 24 hours.",
        withdrawal: result.withdrawal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Withdrawal submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const POST = requireAuth(submitWithdrawal);
