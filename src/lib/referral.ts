import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const generateReferralCode = (length = 8): string => {
  // Generate a random string of exactly 8 alphanumeric characters
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const randomValues = new Uint8Array(length);

  // Get cryptographically strong random values
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to alphanumeric
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
};

export const getOrCreateUserReferralCode = async (
  userId: number
): Promise<string> => {
  try {
    // First, check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referralCode: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // If user already has a referral code, validate it
    if (user.referralCode) {
      // If it's a valid 8-character code, return it
      if (/^[A-Z0-9]{8}$/.test(user.referralCode)) {
        return user.referralCode;
      }
      // If it's a UUID, we'll generate a new code and update it
      console.log(
        `Migrating UUID referral code to 8-char format for user ${userId}`
      );
    }

    // Generate a new unique referral code
    let code: string = "";
    let attempts = 0;
    const maxAttempts = 10; // Increased max attempts

    while (attempts < maxAttempts) {
      code = generateReferralCode();

      try {
        // Use upsert to handle race conditions
        const updatedUser = await prisma.$transaction(
          async (tx) => {
            // Check if code is already taken
            const existingUser = await tx.user.findFirst({
              where: { referralCode: code },
              select: { id: true },
            });

            if (existingUser) {
              return null; // Code already taken
            }

            // Update user with new code
            return await tx.user.update({
              where: { id: userId },
              data: { referralCode: code },
              select: { referralCode: true },
            });
          },
          {
            maxWait: 5000, // Max time to wait for the transaction to complete
            timeout: 10000, // Max time to wait for the transaction to start
          }
        );

        if (updatedUser?.referralCode) {
          return updatedUser.referralCode;
        }
      } catch (error) {
        console.error("Error in referral code generation transaction:", error);
        // Continue to next attempt
      }

      attempts++;

      // Small delay between attempts to reduce contention
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    throw new Error(
      "Failed to generate a unique referral code after multiple attempts"
    );
  } catch (error) {
    console.error("Error in getOrCreateUserReferralCode:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const processReferral = async (
  userId: number,
  referralCode?: string
) => {
  if (!referralCode) return null;

  // Find the referrer by their referral code
  const referrer = await prisma.user.findFirst({
    where: {
      referralCode: referralCode.toUpperCase(),
      id: { not: userId }, // Prevent self-referral
    },
    select: { id: true },
  });

  if (!referrer) return null;

  // Update the referred user's record
  await prisma.user.update({
    where: { id: userId },
    data: {
      referredByCode: referralCode.toUpperCase(),
      referredById: referrer.id,
    },
  });

  // Increment referrer's referral count
  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      referralCount: { increment: 1 },
    },
  });

  return referrer.id;
};

// Plan-specific reward amounts (should match MoreInfo component)
const PLAN_REWARDS: Record<string, number> = {
  "50": 2,    // $2 for $50 plan
  "100": 4,   // $4 for $100 plan
  "150": 6,   // $6 for $150 plan
  "250": 10,  // $10 for $250 plan
  "500": 20,  // $20 for $500 plan
  "1000": 40, // $40 for $1000 plan
  "1500": 60, // $60 for $1500 plan
  "2500": 100 // $100 for $2500 plan
};


// Instantly pay out referral rewards for both users

export const processReferralReward = async (
  referredUserId: number
) => {
  try {
    // Get the referred user with their referrer info and plan details
    const referredUser = await prisma.user.findUnique({
      where: { id: referredUserId },
      select: {
        referredById: true,
        referredBy: {
          select: {
            id: true,
            email: true,
          }
        }
      },
    });

    // Check if user exists and has a referrer
    if (!referredUser?.referredById || !referredUser.referredBy) {
      console.log(`[ReferralReward] User ${referredUserId} has no referrer`);
      return null;
    }

    const referrer = referredUser.referredBy;

    // Check if this specific referred user has already received a reward from this referrer
    const existingReward = await prisma.referralReward.findFirst({
      where: {
        referredUserId: referredUserId,
        referrerId: referrer.id,
        status: 'paid'
      },
    });
    
    if (existingReward) {
      console.log(
        `[ReferralReward] User ${referredUserId} has already been rewarded by referrer ${referrer.id}`
      );
      return null;
    }

    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      console.log(`[ReferralReward] Starting transaction for user ${referredUserId} referred by ${referrer.id}`);
      
      // 1. Get the latest deposit and plan for the referred user
      const deposit = await tx.deposit.findFirst({
        where: { 
          userId: referredUserId,
          status: 'approved'
        },
        orderBy: { id: 'desc' },
        take: 1
      });
      
      if (!deposit) {
        throw new Error(`[ReferralReward] No approved deposit found for user ${referredUserId}`);
      }
      
      // Get the referred user's plan amount
      const referredUserPlan = await tx.userPlanProgress.findFirst({
        where: { userId: referredUserId },
        orderBy: { id: 'desc' },
        take: 1
      });

      if (!referredUserPlan) {
        throw new Error(`[ReferralReward] No plan found for referred user ${referredUserId}`);
      }

      const referredUserPlanAmount = referredUserPlan.planAmount;
      const rewardAmount = new Prisma.Decimal(PLAN_REWARDS[referredUserPlanAmount.toString()] || 0);
      
      if (rewardAmount.lte(0)) {
        throw new Error(`[ReferralReward] Invalid reward amount for plan ${referredUserPlanAmount}`);
      }
      
      // 2. Create reward record for the referrer only
      const referrerRewardRecord = await tx.referralReward.create({
        data: {
          referrerId: referrer.id,
          referredUserId: referredUserId,
          amount: rewardAmount,
          planAmount: new Prisma.Decimal(referredUserPlanAmount),
          planType: `Referral Bonus ($${referredUserPlanAmount} Plan)`,
          status: "pending", // Set to pending first, will be paid after admin approval
          paidAt: null
        },
      });
      
      // Don't update balance yet, will be done after admin approval
      console.log(`[ReferralReward] Created pending reward of $${rewardAmount} for referrer ${referrer.id} (referred user's plan: $${referredUserPlanAmount})`);
      
      console.log(
        `[ReferralReward] Success! Created pending reward of $${rewardAmount} for referrer ${referrer.id}`
      );
      
      return { 
        success: true, 
        rewardAmount,
        rewardId: referrerRewardRecord.id,
        referrerId: referrer.id,
        referredUserId: referredUserId,
        planAmount: referredUserPlanAmount
      };
    });
  } catch (error) {
    console.error("[ReferralReward] Error processing referral reward:", error);
    throw error;
  }
};

export const getReferralStats = async (userId: number) => {
  // Get user's referral code
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      referredById: true,
    },
  });

  // Get all referral rewards where the user is the referrer (earnings from referrals)
  const [referralEarnings, referralRewards, referredUsers] = await Promise.all([
    prisma.referralReward.aggregate({
      where: {
        referrerId: userId,
        status: "paid",
        // Only count rewards where the planType is not 'Referred User Bonus'
        // to avoid counting the bonus given to referred users
        NOT: {
          planType: "Referred User Bonus",
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.referralReward.findMany({
      where: {
        OR: [{ referrerId: userId }, { referredUserId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        referrer: {
          select: { name: true, email: true },
        },
        referredUser: {
          select: { name: true, email: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        balance: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate total earnings from referrals (only count successful referrals)
  const totalEarnings = referralEarnings._sum.amount || 0;

  // Get the user who referred this user (if any)
  let referrer = null;
  if (user?.referredById) {
    referrer = await prisma.user.findUnique({
      where: { id: user.referredById },
      select: { name: true, email: true, id: true },
    });
  }

  return {
    totalEarnings,
    totalReferrals: referredUsers.length,
    referralCode: user?.referralCode || "",
    rewards: referralRewards,
    referredUsers,
    referrer,
  };
};

// Approve a referral reward and update the correct user's balance
export const approveReferralReward = async (rewardId: number) => {
  return prisma.$transaction(async (tx) => {
    // Get the reward with locking to prevent race conditions
    const reward = await tx.referralReward.findUnique({
      where: { id: rewardId },
      include: { referrer: true, referredUser: true },
    });

    if (!reward || reward.status === "paid") {
      throw new Error("Invalid or already processed reward");
    }

    // Determine which user to credit based on planType
    let userIdToCredit: number | null = null;
    if (reward.planType === "Referred User Bonus") {
      userIdToCredit = reward.referredUserId;
    } else {
      userIdToCredit = reward.referrerId;
    }

    // Update user balance
    await tx.user.update({
      where: { id: userIdToCredit },
      data: {
        balance: { increment: reward.amount },
        totalEarned: { increment: reward.amount },
      },
    });

    // Mark reward as paid
    return tx.referralReward.update({
      where: { id: rewardId },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });
  });
};
