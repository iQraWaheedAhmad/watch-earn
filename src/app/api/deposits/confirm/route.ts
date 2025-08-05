import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";
import { processReferralReward } from "@/lib/referral";

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

    // First, create the deposit and update user data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the deposit record
      const deposit = await tx.deposit.create({
        data: {
          userId: Number(userId),
          amount: depositAmount,
          currency,
          transactionHash,
          paymentProofUrl,
          status: "approved",
          confirmedAt: new Date()
        },
      });

      // 2. Update user's balance
      await tx.user.update({
        where: { id: Number(userId) },
        data: {
          balance: { increment: depositAmount },
          totalEarned: { increment: depositAmount },
        },
      });

      // 3. Create or update UserPlanProgress for the user's plan
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

    // After the transaction is complete, create a pending referral reward if needed
    if (result) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { referredById: true }
      });

      if (user?.referredById) {
        // Check if this is the user's first deposit
        const depositCount = await prisma.deposit.count({
          where: {
            userId: result.userId,
            id: { not: result.deposit.id },
            status: 'approved'
          }
        });

        if (depositCount === 0) {
          try {
            // Create a pending referral reward
            await processReferralReward(result.userId);
          } catch (error) {
            console.error("Error creating pending referral reward:", error);
            // Don't fail the deposit if referral reward creation fails
          }
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
