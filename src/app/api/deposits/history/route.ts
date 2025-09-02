import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthRequest } from '../../auth/middleware';

export const runtime = 'nodejs';

// Handler for GET requests (protected by auth)
async function getDepositHistory(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;
    
    // Get URL params
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId');
    
    // Ensure the user is only accessing their own deposits
    // or is an admin (for future admin functionality)
    if (queryUserId && Number(queryUserId) !== userId && request.user?.email !== 'admin@gmail.com') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Use the query user ID if provided, otherwise use the authenticated user's ID
    const targetUserId = queryUserId ? Number(queryUserId) : userId;
    
    // Get user deposits from database
    const deposits = await prisma.deposit.findMany({
      where: {
        userId: targetUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total deposit stats using groupBy
    const stats = await prisma.deposit.groupBy({
      by: ['status'],
      where: {
        userId: targetUserId
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    // Format stats for easier consumption
    const formattedStats = {
      total: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
      totalAmount: 0
    };

    stats.forEach(stat => {
      const count = stat._count.id;
      const amount = stat._sum.amount || 0;
      
      formattedStats.total += count;
      formattedStats.totalAmount += amount;
      
      if (stat.status === 'pending') formattedStats.pending = count;
      if (stat.status === 'confirmed') formattedStats.completed = count;
      if (stat.status === 'rejected') formattedStats.rejected = count;
    });

    return NextResponse.json({
      deposits,
      stats: formattedStats
    }, { status: 200 });
  } catch (error) {
    console.error('Deposit history fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const GET = requireAuth(getDepositHistory);
