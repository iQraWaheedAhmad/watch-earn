import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "@/app/api/auth/middleware";

export const GET = requireAuth(async (req: AuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all user's plan progresses
    let progresses = await prisma.userPlanProgress.findMany({
      where: { userId: userId },
      orderBy: { lastRoundDate: "desc" },
    });
    // Get all referral rewards where user is the referrer only (exclude referred user)
    const referralRewards = await prisma.referralReward.findMany({
      where: {
        referrerId: userId,
        status: { in: ['pending', 'paid'] },
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
    
    // Calculate totals from referral rewards (referrer only)
    const referralPaid = referralRewards
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const referralPending = referralRewards
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const referralProfit = referralPaid + referralPending;

    // Total profit is the sum of plan profit and referral profit
    const totalProfit = planProfit + referralProfit;
    
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
