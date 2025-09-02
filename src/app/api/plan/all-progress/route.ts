import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "@/app/api/auth/middleware";

export const GET = requireAuth(async (req: AuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 1) Reconcile: credit any paid referral rewards that haven't been credited to balance yet
    // We mark credited rewards by appending " [credited]" to planType to avoid double-crediting, no schema change required
    await prisma.$transaction(async (tx) => {
      const uncreditedPaid = await tx.referralReward.findMany({
        where: {
          referrerId: userId,
          status: 'paid',
          OR: [
            { planType: null },
            { planType: { not: { endsWith: ' [credited]' } } },
          ],
        },
        select: { id: true, amount: true, planType: true },
      });
      if (uncreditedPaid.length > 0) {
        const totalToCredit = uncreditedPaid.reduce((sum, r) => sum + Number(r.amount), 0);
        if (totalToCredit > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: totalToCredit }, totalEarned: { increment: totalToCredit } },
          });
        }
        // mark each as credited to avoid double-credit
        for (const r of uncreditedPaid) {
          await tx.referralReward.update({
            where: { id: r.id },
            data: { planType: `${r.planType ?? 'Referral Bonus'} [credited]` },
          });
        }
      }
    });

    // Fetch user's current balance (after any reconciliation) and plan progresses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });
    
    // Get all user's plan progresses
    let progresses = await prisma.userPlanProgress.findMany({
      where: { userId: userId },
      orderBy: { lastRoundDate: "desc" },
    });
    // Get referral rewards where user is the referrer only (paid only)
    const referralRewards = await prisma.referralReward.findMany({
      where: {
        status: 'paid',
        referrerId: userId,
      },
      select: {
        id: true,
        amount: true,
        planAmount: true,
        planType: true,
        status: true,
        referrerId: true,
        referredUserId: true,
        createdAt: true,
        paidAt: true,
      },
    });

    // If no progress exists yet, but user has a confirmed deposit, create the plan progress now
    if (!progresses || progresses.length === 0) {
      const latestConfirmedDeposit = await prisma.deposit.findFirst({
        where: { userId: userId, status: 'confirmed' },
        orderBy: { createdAt: 'desc' },
      });

      if (latestConfirmedDeposit) {
        await prisma.userPlanProgress.upsert({
          where: {
            userId_planAmount: {
              userId,
              planAmount: Math.trunc(latestConfirmedDeposit.amount),
            },
          },
          update: {},
          create: {
            userId,
            planAmount: Math.trunc(latestConfirmedDeposit.amount),
            profit: 0,
            roundCount: 0,
            canWithdraw: false,
          },
        });

        // Re-fetch progresses after creating
        progresses = await prisma.userPlanProgress.findMany({
          where: { userId: userId },
          orderBy: { lastRoundDate: 'desc' },
        });
      }
    }

    // Calculate total profit from plan progresses
    const planProfit = progresses.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    // Calculate total from referral rewards (paid). For display/debugging only.
    const referralProfit = referralRewards.reduce((sum, r) => sum + Number(r.amount), 0);

    // Total profit available to user should be balance + plan profits (referral rewards are already credited into balance via reconciliation)
    const totalProfit = Number(user?.balance ?? 0) + planProfit;
    
    // Check withdrawal eligibility (only based on plan progress, not referral rewards)
    const canWithdraw = progresses.some(
      (p) => p.canWithdraw && p.profit > 0 && p.roundCount > 0
    );

    return NextResponse.json({
      success: true,
      progresses: progresses.map((p) => ({
        id: p.id,
        planAmount: p.planAmount,
        profit: p.profit || 0,
        roundCount: p.roundCount || 0,
        canWithdraw: p.canWithdraw || false,
        lastRoundDate: p.lastRoundDate,
      })),
      totalProfit,
      balance: Number(user?.balance ?? 0),
      canWithdraw,
      // Include referral rewards for debugging
      _meta: {
        planProfit,
        referralProfit,
        totalReferralRewards: referralRewards.length
      }
    });
  } catch (error) {
    console.error("Error in all-progress API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
