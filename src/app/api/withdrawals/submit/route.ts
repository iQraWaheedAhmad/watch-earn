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

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { message: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Calculate total available profit
    const progresses = await prisma.userPlanProgress.findMany({
      where: { userId: Number(userId) },
      orderBy: { lastRoundDate: "desc" },
    });
    const totalProfit = progresses.reduce((sum, p) => sum + (p.profit || 0), 0);
    if (parsedAmount > totalProfit) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }
    // Subtract the withdrawn amount from the user's progresses (most recent first)
    let remaining = parsedAmount;
    for (const progress of progresses) {
      if (remaining <= 0) break;
      const deduct = Math.min(progress.profit, remaining);
      await prisma.userPlanProgress.update({
        where: { id: progress.id },
        data: { profit: progress.profit - deduct },
      });
      remaining -= deduct;
    }

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: Number(userId),
        amount: parsedAmount,
        currency,
        recipientAddress,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message:
          "Withdrawal request submitted successfully. It will be processed within 24 hours.",
        withdrawal,
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
