import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { message: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Find the user with this referral code
    const referrer = await prisma.user.findUnique({
      where: { 
        referralCode: code 
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!referrer) {
      return NextResponse.json(
        { message: 'Referral code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: referrer.id,
        name: referrer.name,
        email: referrer.email
      }
    });

  } catch (error) {
    console.error('Error fetching referrer:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
