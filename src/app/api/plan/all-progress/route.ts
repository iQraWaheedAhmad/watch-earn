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
    const [progresses, referralRewards] = await Promise.all([
      prisma.userPlanProgress.findMany({
        where: { userId: userId },
        orderBy: { lastRoundDate: "desc" },
      }),
      // Get all referral rewards where user is either referrer or referred
      prisma.referralReward.findMany({
        where: {
          OR: [
            { referrerId: userId },
            { referredUserId: userId }
          ],
          status: 'paid'
        },
        select: {
          id: true,
          amount: true,
          planAmount: true,
          planType: true,
          status: true,
          referrerId: true,
          referredUserId: true,
          createdAt: true
        }
      })
    ]);

    // Calculate total profit from plan progresses
    const planProfit = progresses.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    // Calculate total profit from referral rewards
    const referralProfit = referralRewards.reduce((sum, reward) => {
      // Only count rewards where user is the recipient (either as referrer or referred)
      if (reward.status === 'paid') {
        return sum + Number(reward.amount);
      }
      return sum;
    }, 0);

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
