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
    const progresses = await prisma.userPlanProgress.findMany({
      where: { userId: userId },
      orderBy: { lastRoundDate: "desc" },
    });
    // Calculate total profit and check withdrawal eligibility
    const totalProfit = progresses.reduce((sum, p) => sum + (p.profit || 0), 0);
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
    });
  } catch (error) {
    console.error("Error in all-progress API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
