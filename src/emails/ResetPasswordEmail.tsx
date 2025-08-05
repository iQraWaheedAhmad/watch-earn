import * as React from 'react';
import type { ReactElement, CSSProperties } from 'react';

interface ResetPasswordEmailProps {
  otp: string;
}

export const ResetPasswordEmail = ({
  otp,
}: Readonly<ResetPasswordEmailProps>): ReactElement => (
  <div style={container}>
    <div style={content}>
      <h1 style={heading}>Password Reset Request</h1>
      <p style={text}>Hello,</p>
      <p style={text}>
        We received a request to reset your password. Please use the following
        One-Time Password (OTP) to proceed:
      </p>
      <div style={otpContainer}>
        <span style={otpText}>{otp}</span>
      </div>
      <p style={text}>
        This OTP is valid for 10 minutes. If you didn&apos;t request this, please
        ignore this email.
      </p>
      <p style={text}>
        Best regards,
        <br />
        The Watch & Earn Team
      </p>
    </div>
  </div>
);

// Email styling
const container: CSSProperties = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto',
};

const content: CSSProperties = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '32px',
  margin: '20px 0',
};

const heading: CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
  color: '#ffffff',
};

const text: CSSProperties = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const otpContainer: CSSProperties = {
  backgroundColor: '#2a2a2a',
  borderRadius: '4px',
  padding: '16px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const otpText: CSSProperties = {
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  color: '#4f46e5',
};
