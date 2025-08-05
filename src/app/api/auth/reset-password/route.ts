import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Verify the OTP first
    const { verifyOTP } = await import('@/lib/otp');
    const otpVerification = await verifyOTP(email, otp);

    if (!otpVerification.valid) {
      return NextResponse.json(
        { error: otpVerification.message || 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Get user with current password hashes
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        password: true, 
        lastPasswords: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if new password is the same as current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return NextResponse.json(
        { error: 'New password cannot be the same as the current password' },
        { status: 400 }
      );
    }

    // Check if new password was used before (last 3 passwords)
    const wasUsedBefore = await Promise.all(
      user.lastPasswords.map(async (hash) => 
        await bcrypt.compare(newPassword, hash)
      )
    );

    if (wasUsedBefore.some(Boolean)) {
      return NextResponse.json(
        { error: 'You cannot use a password that was used recently' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and reset token fields
    // Also update password history (keep last 3 passwords)
    const updatedLastPasswords = [
      user.password,
      ...user.lastPasswords.slice(0, 1) // Keep only the most recent old password
    ];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastPasswords: updatedLastPasswords,
        passwordLastChanged: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting the password' },
      { status: 500 }
    );
  }
}
