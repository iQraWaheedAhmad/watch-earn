import * as React from 'react';
import type { ReactElement } from 'react';

interface ResetPasswordEmailProps {
  otp: string;
}

export const ResetPasswordEmail = ({
  otp,
}: Readonly<ResetPasswordEmailProps>): ReactElement => (
  <div style={{
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    textSizeAdjust: '100%',
    WebkitTextSizeAdjust: '100%',
    borderCollapse: 'collapse',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  }}>
    <div style={{
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '32px',
      margin: '20px 0',
      border: '1px solid #e5e7eb',
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 24px 0',
        color: '#111827',
        lineHeight: '1.3',
      }}>Password Reset Request</h1>
      
      <p style={{
        fontSize: '16px',
        lineHeight: '24px',
        margin: '16px 0',
        color: '#374151',
      }}>Hello,</p>
      
      <p style={{
        fontSize: '16px',
        lineHeight: '24px',
        margin: '16px 0',
        color: '#374151',
      }}>
        We received a request to reset your password. Please use the following
        One-Time Password (OTP) to proceed:
      </p>
      
      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        padding: '16px',
        textAlign: 'center',
        margin: '24px 0',
        border: '1px solid #e5e7eb',
      }}>
        <span style={{
          fontSize: '32px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: '#4f46e5',
          lineHeight: '1.2',
          display: 'inline-block',
          padding: '0 4px',
        }}>{otp}</span>
      </div>
      
      <p style={{
        fontSize: '16px',
        lineHeight: '24px',
        margin: '16px 0',
        color: '#374151',
      }}>
        This OTP is valid for 10 minutes. If you didn&apos;t request this, please
        ignore this email.
      </p>
      
      <p style={{
        fontSize: '16px',
        lineHeight: '24px',
        margin: '16px 0 0 0',
        color: '#374151',
      }}>
        Best regards,<br />
        <span style={{ color: '#4f46e5', fontWeight: '600' }}>The Watch & Earn Team</span>
      </p>
    </div>
  </div>
);
