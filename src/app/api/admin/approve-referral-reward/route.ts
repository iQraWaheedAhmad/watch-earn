import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "@/app/api/auth/middleware";

// Admin endpoint to approve and pay out a referral reward
async function approveReferralReward(request: AuthRequest) {
  try {
    // Only admins can approve rewards
    if (request.user?.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { message: "Reward ID is required" },
        { status: 400 }
      );
    }

    // Process the reward in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the pending reward
      const reward = await tx.referralReward.findUnique({
        where: { id: rewardId, status: 'pending' },
        include: {
          referrer: {
            select: { id: true, email: true }
          },
          referredUser: {
            select: { id: true, email: true }
          }
        }
      });

      if (!reward) {
        throw new Error("Pending reward not found or already processed");
      }

      // Update the reward status to paid
      const updatedReward = await tx.referralReward.update({
        where: { id: rewardId },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });

      // Update the referrer's balance
      await tx.user.update({
        where: { id: reward.referrerId },
        data: {
          balance: { increment: reward.amount },
          totalEarned: { increment: reward.amount }
        }
      });

      return updatedReward;
    });

    return NextResponse.json({
      message: "Referral reward approved and paid successfully",
      reward: result
    });

  } catch (error) {
    console.error("Error approving referral reward:", error);
    const errorMessage = error instanceof Error ? error.message : "Error approving referral reward";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const POST = requireAuth(approveReferralReward);
