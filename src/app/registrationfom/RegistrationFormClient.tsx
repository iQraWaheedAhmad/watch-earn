'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const RegistrationFormClient = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  const searchParams = useSearchParams();
  
  // Use authentication context
  const { register, loading } = useAuth();

  // Get referral code from URL on component mount and fetch referrer details
  useEffect(() => {
    const refCode = searchParams?.get('ref');
    if (refCode) {
      // Only set if it's a valid 8-character alphanumeric code
      if (/^[A-Z0-9]{8}$/i.test(refCode)) {
        setReferralCode(refCode);
        
        // Fetch referrer details
        const fetchReferrer = async () => {
          try {
            const response = await fetch(`/api/get-referrer?code=${refCode}`);
            const data = await response.json();
            
            if (data.success && data.data) {
              setReferrerName(data.data.name);
            }
          } catch (error) {
            console.error('Error fetching referrer details:', error);
          }
        };
        
        fetchReferrer();
      }
    }
  }, [searchParams]);

  // Password Validation Function
  const validatePassword = (password: string): string => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.';
    if (!/[@!#?$%^&*]/.test(password)) return 'Password must include at least one special character (@,!,#, etc.).';
    return '';
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setPasswordError('');

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      // Prepare registration data including referral code if present
      const registrationData = { name, email, password };
      
      // Add referral code to registration data if present
      if (referralCode) {
        // @ts-expect-error - Adding referralCode to the registration data
        registrationData.referralCode = referralCode;
      }

      // Use the register function from auth context
      await register(registrationData);
      
      setMessage("Registration successful! Click below to go to login.");
      setRegistered(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-gray-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-white">Register</h2>
        {referralCode && (
          <div className="bg-blue-900 text-white p-3 rounded-md mb-4 text-sm">
            {referrerName ? (
              <span>
                You&apos;re joining with <span className="text-yellow-400 font-bold text-base">{referrerName}</span>&apos;s referral code!
              </span>
            ) : (
              <span>You&apos;re joining with a referral code!</span>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {referralCode && (
            <input 
              type="hidden" 
              name="referralCode" 
              value={referralCode} 
            />
          )}
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            aria-label="Name"
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            aria-label="Email"
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" 
              aria-label="Password"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          {message && (
            <p className={`text-sm text-center ${registered ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationFormClient;
