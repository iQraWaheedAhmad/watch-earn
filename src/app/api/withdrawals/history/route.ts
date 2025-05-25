import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthRequest } from '../../auth/middleware';

// Handler for GET requests (protected by auth)
async function getWithdrawalHistory(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;
    
    // Get URL params
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId');
    
    // Ensure the user is only accessing their own withdrawals
    // or is an admin (for future admin functionality)
    if (queryUserId && Number(queryUserId) !== userId && request.user?.email !== 'admin@gmail.com') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Use the query user ID if provided, otherwise use the authenticated user's ID
    const targetUserId = queryUserId ? Number(queryUserId) : userId;
    
    // Get user withdrawals from database
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: targetUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total withdrawal stats
    const stats = await prisma.withdrawal.groupBy({
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
      
      switch (stat.status.toLowerCase()) {
        case 'pending':
          formattedStats.pending = count;
          break;
         case 'confirm':
          formattedStats.completed = count;
          break;
        case 'reject':
          formattedStats.rejected = count;
          break;
      }
    });

    return NextResponse.json({
      withdrawals,
      stats: formattedStats
    }, { status: 200 });
  } catch (error) {
    console.error('Withdrawal history fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const GET = requireAuth(getWithdrawalHistory);
