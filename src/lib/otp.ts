import { prisma } from './prisma';
import { sendPasswordResetEmail } from './email';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

interface OTPResult {
  success: boolean;
  error?: string;
}

interface VerifyOTPResult {
  valid: boolean;
  message: string;
}

export const generateAndSendOTP = async (email: string): Promise<OTPResult> => {
  try {
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Hash the OTP before storing it
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update user with the reset token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedOtp,
        resetTokenExpiry: otpExpiry,
      } as Prisma.UserUpdateInput, // Type assertion to handle custom fields
    });

    // Send the actual OTP via email
    await sendPasswordResetEmail(email, otp);

    return { success: true };
  } catch (error) {
    console.error('Error in generateAndSendOTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate and send OTP';
    return { success: false, error: errorMessage };
  }
};

export const verifyOTP = async (email: string, otp: string): Promise<VerifyOTPResult> => {
  try {
    // First, get the user with the reset token and expiry using Prisma's query builder
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        resetToken: true,
        resetTokenExpiry: true
      }
    });
    
    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Check if OTP is expired
    if (new Date() > user.resetTokenExpiry) {
      return { valid: false, message: 'OTP has expired' };
    }

    // Verify the OTP
    const isValid = await bcrypt.compare(otp, user.resetToken);
    
    if (!isValid) {
      return { valid: false, message: 'Invalid OTP' };
    }

    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error verifying OTP';
    return { valid: false, message: errorMessage };
  }
};
