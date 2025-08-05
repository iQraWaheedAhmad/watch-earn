import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify the OTP
    const result = await verifyOTP(email, otp);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message || 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // If we get here, the OTP is valid
    return NextResponse.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying the OTP' },
      { status: 500 }
    );
  }
}
