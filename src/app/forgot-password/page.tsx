'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'otp' | 'newPassword';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: 'If an account with that email exists, you will receive a password reset OTP.',
          type: 'success',
        });
        setStep('otp');
      } else {
        setMessage({
          text: data.error || 'Failed to send OTP. Please try again.',
          type: 'error',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage({
        text: `An error occurred: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('newPassword');
      } else {
        setMessage({
          text: data.error || 'Invalid or expired OTP. Please try again.',
          type: 'error',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage({
        text: `An error occurred: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    // Add more password validation if needed
    if (newPassword.length < 8) {
      setMessage({
        text: 'Password must be at least 8 characters long',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: 'Password has been reset successfully! Redirecting to login...',
          type: 'success',
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login_route');
        }, 3000);
      } else {
        setMessage({
          text: data.error || 'Failed to reset password. Please try again.',
          type: 'error',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage({
        text: `An error occurred: ${errorMessage}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'email' ? 'bg-indigo-600' : 'bg-gray-700'
          } text-white`}
        >
          1
        </div>
        <div className={`h-1 w-16 ${step !== 'email' ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'otp' ? 'bg-indigo-600' : step === 'newPassword' ? 'bg-indigo-600' : 'bg-gray-700'
          } text-white`}
        >
          2
        </div>
        <div className={`h-1 w-16 ${step === 'newPassword' ? 'bg-indigo-600' : 'bg-gray-700'}`}></div>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'newPassword' ? 'bg-indigo-600' : 'bg-gray-700'
          } text-white`}
        >
          3
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex justify-center items-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {step === 'email' && 'Reset Your Password'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'newPassword' && 'Create New Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {step === 'email' && 'Enter your email to receive a password reset OTP'}
            {step === 'otp' && `We've sent a 4-digit OTP to ${email}`}
            {step === 'newPassword' && 'Create a new password for your account'}
          </p>
        </div>

        {renderStepIndicator()}

        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'error' ? 'bg-red-900/30 border border-red-500' : 'bg-green-900/30 border border-green-500'
            }`}
          >
            <p className="text-sm text-center text-white">{message.text}</p>
          </div>
        )}

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-white">
                Enter 4-digit OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-white text-center text-2xl tracking-widest"
                placeholder="- - - -"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setMessage({ text: '', type: '' });
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Back to Email
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'newPassword' && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-white">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-white"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-400">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setMessage({ text: '', type: '' });
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Back to OTP
              </button>
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <Link
            href="/login_route"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
