import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rewards = await prisma.referralReward.findMany({
      take: 50, // Limit to 50 most recent
      orderBy: { createdAt: "desc" },
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        referredUser: { 
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Also get all users with their referral codes for reference
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
        referredById: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      rewards,
      users,
      _meta: {
        totalRewards: rewards.length,
        totalUsers: users.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in debug/referral-rewards:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch referral rewards",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
