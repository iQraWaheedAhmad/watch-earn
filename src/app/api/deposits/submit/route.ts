import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";
import { PLAN_REWARDS } from "@/lib/referral";
import { Prisma } from "@prisma/client";

// Submit a deposit: creates a pending deposit record only
async function submitDeposit(request: AuthRequest) {
  try {
    const userId = request.user?.id;
    const data = await request.json();
    const { transactionHash, amount, currency, paymentProofUrl = "" } = data;

    if (!transactionHash || !amount || !currency) {
      return NextResponse.json(
        { message: "Transaction hash, amount, and currency are required" },
        { status: 400 }
      );
    }

    const allowedPlans = [50, 100, 150, 250, 500, 1000, 1500, 2500];
    const depositAmount = parseFloat(amount);
    if (!allowedPlans.includes(depositAmount)) {
      return NextResponse.json(
        { message: "Deposit amount must match a valid plan." },
        { status: 400 }
      );
    }

    // Prevent multiple pending deposits for same user (optional safeguard)
    const existingPending = await prisma.deposit.findFirst({
      where: { userId: Number(userId), status: "pending" },
    });
    if (existingPending) {
      return NextResponse.json(
        { message: "You already have a pending deposit awaiting confirmation." },
        { status: 400 }
      );
    }

    // Create deposit and (if applicable) pending referral reward in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create pending deposit
      const deposit = await tx.deposit.create({
        data: {
          userId: Number(userId),
          amount: depositAmount,
          currency,
          transactionHash,
          paymentProofUrl,
          status: "pending",
        },
      });

      // If user was referred, and no reward exists yet for this referrer+referredUser, create a pending reward now
      const user = await tx.user.findUnique({
        where: { id: Number(userId) },
        select: { referredById: true },
      });

      if (user?.referredById) {
        const existingReward = await tx.referralReward.findFirst({
          where: {
            referrerId: user.referredById,
            referredUserId: Number(userId),
          },
        });

        if (!existingReward) {
          const rewardAmount = PLAN_REWARDS[String(Math.trunc(depositAmount))] || 0;
          if (rewardAmount > 0) {
            await tx.referralReward.create({
              data: {
                referrerId: user.referredById,
                referredUserId: Number(userId),
                amount: new Prisma.Decimal(rewardAmount),
                planAmount: new Prisma.Decimal(Math.trunc(depositAmount)),
                planType: `Referral Bonus ($${Math.trunc(depositAmount)} Plan)`,
                status: "pending",
                paidAt: null,
              },
            });
          }
        }
      }

      return { deposit };
    });

    return NextResponse.json(
      { message: "Deposit submitted and pending confirmation", deposit: result.deposit },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposit submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(submitDeposit);
