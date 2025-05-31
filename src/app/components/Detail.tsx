'use client';
import Image from 'next/image';

export default function Detail() {
  return (
    <div
      className="bg-black min-h-screen text-white flex items-center justify-center px-6 py-10"
      style={{
        backgroundImage: 'url(/img2.jpg)', // Background image
        backgroundSize: 'cover', // Cover the whole screen
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // No repetition
      }}
    >
      {/* Transparent Overlay for Better Readability */}
      <div className="bg-black bg-opacity-60 p-6 rounded-lg text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-yellow-400">
          Investment & Withdrawal Policy
        </h1>

        <p className="text-lg mt-4">
          📌 <strong>Profit Withdrawal:</strong> You can withdraw your earnings **only once per day**, with a minimum gap of **12 hours** between withdrawals.
        </p>

        

        <p className="text-lg">
          ⚠️ <strong>Policy Notice:</strong> Withdrawals must follow the **12-hour gap rule** to ensure a smooth transaction process.
        </p> 

        <p className="text-lg font-semibold text-yellow-400 mt-4">
          "Your financial growth is our priority! Invest wisely and withdraw with confidence."
        </p>
      </div>
    </div>
  );
}
