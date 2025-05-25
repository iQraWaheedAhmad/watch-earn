'use client';
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

const MoreInfo = () => {
  const { isAuthenticated } = useAuth();
  
  const plans = [
    { priceUSD: 50, profitUSD: 2 },
    { priceUSD: 100, profitUSD: 4 },
    { priceUSD: 150, profitUSD: 6 },
    { priceUSD: 250, profitUSD: 10 },
    { priceUSD: 500, profitUSD: 20 },
    { priceUSD: 1000, profitUSD: 40 },
    { priceUSD: 1500, profitUSD: 60 },
    { priceUSD: 2500, profitUSD: 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-5 flex justify-center items-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-center text-3xl sm:text-6xl font-bold text-white mb-8">
          Daily Profit Plans
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center justify-center bg-gradient-to-r from-indigo-600 to-black rounded-full p-4 md:p-6 shadow-lg transform transition duration-500 hover:scale-105"
            >
              {/* Circle */}
              <div className="w-32 h-32 sm:w-32 sm:h-32 flex items-center justify-center bg-white rounded-full shadow-md">
                <p className="text-sm sm:text-lg text-gray-800 font-bold text-center">
                  ${plan.priceUSD.toLocaleString()}
                </p>
              </div>

              {/* Profit */}
              <p className="text-sm sm:text-lg text-yellow-300 mt-4">
                Profit: ${plan.profitUSD}
              </p>

              {/* Deposit Button */}
              <Link
                href={isAuthenticated ? "/staking" : "/registrationfom"}
                className="mt-4 bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
              >
                {isAuthenticated ? "Deposit" : "Register"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreInfo;
