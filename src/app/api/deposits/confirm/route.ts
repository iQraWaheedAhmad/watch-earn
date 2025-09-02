import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";
import type { ReferralReward } from "@prisma/client";
import { processReferralReward, approveReferralReward } from "@/lib/referral";

export const runtime = 'nodejs';

// Process deposit confirmation and handle balance updates and referral rewards
async function confirmDeposit(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;

    // In a real implementation, we'd use FormData to handle file uploads
    // Since we don't have actual file storage, we'll simulate it
    const data = await request.json();
    const { transactionHash, amount, currency, paymentProofUrl = "" } = data;

    // Validate input
    if (!transactionHash || !amount || !currency) {
      return NextResponse.json(
        { message: "Transaction hash, amount, and currency are required" },
        { status: 400 }
      );
    }

    // Prevent deposit if user already has a plan (only one deposit allowed)
    const existingPlan = await prisma.userPlanProgress.findFirst({
      where: { userId: Number(userId) },
    });
    if (existingPlan) {
      return NextResponse.json(
        {
          message:
            "You have already made a deposit. Only one deposit is allowed per user.",
        },
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

    // First, confirm the existing pending deposit and update user data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the pending deposit for this user and transaction
      const pending = await tx.deposit.findFirst({
        where: {
          userId: Number(userId),
          status: 'pending',
          transactionHash,
        },
      });

      if (!pending) {
        throw new Error('Pending deposit not found for this transaction');
      }

      // Validate amount and currency match the submitted values
      if (pending.amount !== depositAmount || pending.currency !== currency) {
        throw new Error('Submitted amount/currency does not match the pending deposit');
      }

      // 2. Update the deposit record to confirmed
      const deposit = await tx.deposit.update({
        where: { id: pending.id },
        data: {
          status: 'confirmed',
          confirmedAt: new Date(),
          // in case we want to overwrite/ensure proof exists
          paymentProofUrl: paymentProofUrl || pending.paymentProofUrl || '',
        },
      });

      // 3. Update user's balance
      await tx.user.update({
        where: { id: Number(userId) },
        data: {
          balance: { increment: depositAmount },
          totalEarned: { increment: depositAmount },
        },
      });

      // 4. Create or update UserPlanProgress for the user's plan
      await tx.userPlanProgress.upsert({
        where: {
          userId_planAmount: {
            userId: Number(userId),
            planAmount: depositAmount,
          },
        },
        update: {},
        create: {
          userId: Number(userId),
          planAmount: depositAmount,
        },
      });

      return { deposit, userId: Number(userId) };
    });

    // After the transaction: simple flow — create and auto-pay referrer reward
    let reward: ReferralReward | null = null;
    if (result) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { referredById: true }
      });

      if (user?.referredById) {
        try {
          const rewardRes = await processReferralReward(result.userId);
          if (rewardRes && 'rewardId' in rewardRes && rewardRes.rewardId) {
            reward = await approveReferralReward(rewardRes.rewardId as number);
          }
        } catch (err) {
          console.error('[DepositConfirm] Referral payout failed:', err);
          // Do not fail confirmation if referral payout fails
        }
      }
    }

    // Trigger a profit update event to refresh the UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profitUpdated'));
    }

    return NextResponse.json(
      {
        message: "Deposit confirmed and processed successfully",
        deposit: result.deposit,
        reward
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposit confirmation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const POST = requireAuth(confirmDeposit);
