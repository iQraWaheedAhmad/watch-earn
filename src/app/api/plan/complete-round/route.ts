import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";

// Plans array (should match frontend)
const plans = [
  { priceUSD: 50, profitUSD: 2 },
  { priceUSD: 100, profitUSD: 4 },
  { priceUSD: 150, profitUSD: 6 },
  { priceUSD: 250, profitUSD: 10 },
  { priceUSD: 500, profitUSD: 20 },
  { priceUSD: 1000, profitUSD: 40 },
  { priceUSD: 1500, profitUSD: 60 },
  { priceUSD: 2500, profitUSD: 100 },
];

export const POST = requireAuth(async (req: AuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.log("[COMPLETE ROUND API] No userId in request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { planAmount } = await req.json();
    console.log(
      `[COMPLETE ROUND API] userId: ${userId}, planAmount: ${planAmount}`
    );
    if (!planAmount) {
      return NextResponse.json(
        { error: "planAmount is required" },
        { status: 400 }
      );
    }
    const plan = plans.find((p) => p.priceUSD === planAmount);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    // Check if user has an active deposit for this plan
    const activeDeposit = await prisma.deposit.findFirst({
      where: {
        userId: userId,
        status: { in: ["pending", "confirmed"] },
        amount: {
          gte: planAmount,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("[COMPLETE ROUND API] activeDeposit:", activeDeposit);
    if (!activeDeposit) {
      return NextResponse.json(
        { error: "No active deposit found for this plan" },
        { status: 400 }
      );
    }
    // Find or create user plan progress
    let progress = await prisma.userPlanProgress.findUnique({
      where: {
        userId_planAmount: {
          userId: userId,
          planAmount,
        },
      },
    });
    console.log("[COMPLETE ROUND API] Existing progress:", progress);
    if (!progress) {
      progress = await prisma.userPlanProgress.create({
        data: {
          userId: userId,
          planAmount,
          profit: 0,
          roundCount: 0,
          canWithdraw: false,
        },
      });
      console.log("[COMPLETE ROUND API] Created new progress:", progress);
    }
    // Check if user can start a new round (24h cooldown)
    const now = new Date();
    if (progress.lastRoundDate) {
      const lastRound = new Date(progress.lastRoundDate);
      const diffMs = now.getTime() - lastRound.getTime();
      const hoursSinceLastRound = diffMs / (1000 * 60 * 60);
      if (hoursSinceLastRound < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceLastRound);
        return NextResponse.json(
          {
            error: `Please wait ${hoursLeft} more hours before starting the next round`,
            canTryAgainIn: hoursLeft * 60 * 60 * 1000, // in milliseconds
          },
          { status: 400 }
        );
      }
    }
    // Calculate profit for this round
    const profitForThisRound = plan.profitUSD;
    // Update progress with new round
    const updatedProgress = await prisma.userPlanProgress.update({
      where: {
        userId_planAmount: {
          userId: userId,
          planAmount,
        },
      },
      data: {
        profit: {
          increment: profitForThisRound,
        },
        roundCount: {
          increment: 1,
        },
        lastRoundDate: now,
        canWithdraw: true, // Always set to true after completing a round
      },
    });
    console.log("[COMPLETE ROUND API] Updated progress:", updatedProgress);
    // Calculate total profit for all plans for this user
    const allProgresses = await prisma.userPlanProgress.findMany({
      where: { userId: userId },
    });
    const totalProfit = allProgresses.reduce(
      (sum, p) => sum + (p.profit || 0),
      0
    );
    const responseObj = {
      success: true,
      progress: {
        ...updatedProgress,
        canWithdraw: true,
        profit: updatedProgress.profit,
        roundCount: updatedProgress.roundCount,
      },
      profitEarned: profitForThisRound,
      totalProfit,
      canWithdrawNow: true,
    };
    console.log("[COMPLETE ROUND API] Response:", responseObj);
    return NextResponse.json(responseObj);
  } catch (error) {
    console.error("[COMPLETE ROUND API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
