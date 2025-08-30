import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";

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

    // 1. First, complete the deposit transaction
    const depositResult = await prisma.$transaction(async (tx) => {
      // Create the deposit record
      const deposit = await tx.deposit.create({
        data: {
          userId: Number(userId),
          amount: depositAmount,
          currency,
          transactionHash,
          paymentProofUrl,
          status: "pending",
          confirmedAt: new Date()
        },
      });

      // Update user's balance
      await tx.user.update({
        where: { id: Number(userId) },
        data: {
          balance: { increment: depositAmount },
          totalEarned: { increment: depositAmount },
        },
      });

      // Create or update UserPlanProgress for the user's plan
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

      return { deposit };
    }, {
      // Increase transaction timeout to 10 seconds
      maxWait: 10000,
      timeout: 10000
    });

    // 2. After deposit is successful, handle referral reward in a separate transaction
    let referralReward = null;
    
    try {
      // Check if this user was referred by someone
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { referredById: true }
      });

      if (user?.referredById) {
        // Check if this is the user's first approved deposit
        const depositCount = await prisma.deposit.count({
          where: {
            userId: Number(userId),
            status: 'approved',
            id: { not: depositResult.deposit.id } // Exclude current deposit from count
          }
        });

        // Only process referral reward for the first deposit
        if (depositCount === 0) {
          console.log(`[DepositConfirm] Processing referral reward for user ${userId} with plan amount ${depositAmount}`);
          
          // Create referral reward in a separate transaction
          referralReward = await prisma.$transaction(async (tx) => {
            // Get the referrer's details
            const referrer = await tx.user.findUnique({
              where: { id: user.referredById },
              select: { id: true, email: true }
            });
            
            if (!referrer) {
              console.log(`[DepositConfirm] Referrer not found for ID: ${user.referredById}`);
              return null;
            }
            
            // Create pending referral reward
            return await tx.referralReward.create({
              data: {
                referrerId: referrer.id,
                referredUserId: Number(userId),
                amount: depositAmount * 0.04, // 4% of the deposit amount
                planAmount: depositAmount,
                planType: `Referral Bonus ($${depositAmount} Plan)`,
                status: "pending",
                paidAt: null
              },
            });
          }, {
            // Set a separate timeout for the referral reward transaction
            maxWait: 10000,
            timeout: 10000
          });
          
          if (referralReward) {
            console.log(`[DepositConfirm] Created pending referral reward of $${referralReward.amount} for referrer ${referralReward.referrerId}`);
          } else {
            console.log('[DepositConfirm] No referral reward created');
          }
        } else {
          console.log(`[DepositConfirm] Not user's first deposit, skipping referral reward`);
        }
      } else {
        console.log(`[DepositConfirm] No referrer found for user ${userId}, skipping referral reward`);
      }
    } catch (error) {
      console.error('[DepositConfirm] Error processing referral reward:', error);
      // Don't fail the deposit if referral reward processing fails
    }
    
    const result = {
      deposit: depositResult.deposit,
      userId: Number(userId),
      referralReward: referralReward ? {
        id: referralReward.id,
        amount: referralReward.amount,
        referrerId: referralReward.referrerId,
        status: referralReward.status
      } : null
    };

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
