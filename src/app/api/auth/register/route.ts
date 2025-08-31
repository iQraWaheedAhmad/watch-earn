import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { processReferral, getOrCreateUserReferralCode } from '@/lib/referral';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, referralCode } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // First, create the user in a simple transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    // Process referral if code is provided (synchronously to avoid race conditions)
    if (referralCode) {
      try {
        await processReferral(user.id, referralCode);
      } catch (referralError) {
        console.error('Referral processing error during registration:', referralError);
        // Continue with registration even if referral processing fails
      }
    }

    // Generate a referral code for the new user (outside of the main transaction)
    try {
      // Generate referral code in the background without blocking the response
      getOrCreateUserReferralCode(user.id).catch(error => {
        console.error('Background referral code generation error:', error);
      });
    } catch (codeError) {
      console.error('Error queuing referral code generation:', codeError);
      // Continue with registration even if referral code generation fails
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
