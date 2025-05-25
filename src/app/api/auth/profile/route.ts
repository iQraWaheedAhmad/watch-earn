import { NextResponse } from 'next/server';
import { requireAuth, AuthRequest } from '../middleware';
import { prisma } from '@/lib/prisma';

// Handler for GET requests (protected by auth)
async function getProfile(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user
    }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const GET = requireAuth(getProfile);
