'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registered, setRegistered] = useState(false);
  const router = useRouter();
  
  // Use authentication context
  const { register, loading, error } = useAuth();

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
      // Use the register function from auth context
      await register(name, email, password);
      
      setMessage("Registration successful! Click below to go to login.");
      setRegistered(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };
  

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Geist+Mono:wght@100..900&display=swap"
        />
      </Head>
      <div className="min-h-screen flex justify-center items-center bg-black py-12 px-4">
        <div className="max-w-md w-full space-y-6 bg-gray-900 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-extrabold text-center text-white">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                aria-label="Password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 px-3 text-gray-400"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full bg-indigo-600 text-white py-2 rounded-md font-semibold transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          {message && <p className="text-center text-white mt-2">{message}</p>}

          {registered && (
            <Link 
              href="/login_route" 
              className="block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Go to Login
            </Link>
          )}

          <p className="text-center text-white">
            Already have an account? 
            <Link href="/login_route" className="text-indigo-500 ml-1">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;
