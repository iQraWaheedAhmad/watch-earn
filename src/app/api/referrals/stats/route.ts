import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to generate a random referral code
function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charsLength = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
}

// Helper to verify JWT token
const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return null;
    }
    
    // Decode token without verification to inspect its structure
    const decoded = jwt.decode(token);
    console.log('Decoded token (before verification):', decoded);
    
    // Now verify the token
    const verified = jwt.verify(token, secret);
    console.log('Verified token:', verified);
    
    // Handle different token payload structures
    if (typeof verified === 'string') {
      console.error('Unexpected token payload type (string):', verified);
      return null;
    }
    
    // The token might have 'id' instead of 'userId'
    const payload = verified as { id?: number; userId?: number; email?: string; name?: string };
    
    // Check for both 'id' and 'userId' in the token
    const userId = payload.id ?? payload.userId;
    
    if (userId === undefined) {
      console.error('No user ID found in token payload');
      return null;
    }
    
    return { 
      userId,
      email: payload.email,
      name: payload.name
    };
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('=== Request Headers ===');
    console.log('Authorization Header:', request.headers.get('authorization'));
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth Header:', authHeader);
    
    if (!authHeader) {
      console.error('No Authorization header found');
      return NextResponse.json(
        { message: 'No authorization header provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted Token:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('No token found in Authorization header');
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    console.log('Verifying token...');
    const decoded = verifyToken(token);
    console.log('Decoded Token:', decoded);
    
    if (!decoded) {
      console.error('Token verification failed');
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user ID from the token
    const userId = decoded.userId;
    console.log('Using userId from token:', userId);
    
    if (!userId) {
      console.error('No user ID found in token');
      return NextResponse.json(
        { message: 'Invalid user ID in token' },
        { status: 400 }
      );
    }

    // Get referral stats
    const [rewards, referredUsers] = await Promise.all([
      // Only get rewards where the user is the referrer (not the referred user)
      prisma.referralReward.findMany({
        where: {
          referrerId: userId // Only include rewards where user is the referrer
        },
        orderBy: { createdAt: 'desc' },
        include: {
          referrer: {
            select: { name: true, email: true }
          },
          referredUser: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Get all users referred by this user
      prisma.user.findMany({
        where: { referredById: userId },
        select: { 
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate total earnings (only from paid rewards)
    const totalEarnings = rewards
      .filter(reward => reward.status === 'paid')
      .reduce((sum, reward) => sum + Number(reward.amount), 0);

    // Calculate pending rewards
    const pendingRewards = rewards.filter(
      reward => reward.status === 'pending'
    ).length;

    // Get the user's referral code or generate one if it doesn't exist
    console.log('Fetching user data for userId:', userId);
    
    // First, get the user with their current referral code
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });
    
    // If no referral code exists, generate one and update the user
    if (!user?.referralCode) {
      console.log('No referral code found, generating a new one...');
      const referralCode = generateReferralCode();
      
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode },
        select: { referralCode: true }
      });
      
      console.log('Generated new referral code:', referralCode);
    }
    
    console.log('User data from database:', user);
    console.log('User referral code:', user?.referralCode || 'No referral code found');

    return NextResponse.json({
      totalEarnings,
      totalReferrals: referredUsers.length,
      pendingRewards,
      referralCode: user?.referralCode || '',
      rewards: rewards.map(reward => ({
        ...reward,
        amount: Number(reward.amount),
        planAmount: Number(reward.planAmount)
      })),
      referredUsers: referredUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch referral statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
