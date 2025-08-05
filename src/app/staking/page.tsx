'use client';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function StakingPageWrapper() {
  return (
    <ProtectedRoute>
      <BinanceStaking />
    </ProtectedRoute>
  );
}

function BinanceStaking() {
  const router = useRouter();
  const walletAddress = "TJuZCvYANND2emRa4ssrWqpZswPFUaJVWQ";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Step = ({ title, children, color }) => (
    <div className={`bg-white shadow rounded-lg p-4 border-l-4 mt-6 ${color}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700 text-sm space-y-2">{children}</div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Binance Staking - How to Join</title>
        <meta name="description" content="Step-by-step guide to stake USDT (TRC20) using Binance Wallet and start earning daily." />
      </Head>

      <main className="max-w-xl mx-auto px-4 py-8 text-gray-900">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">🚀 Join USDT (TRC20) Staking</h1>
        <p className="text-center text-sm sm:text-base mb-8">Simple steps to start earning daily rewards.</p>

        <Step title="📥 Step 1: Copy Wallet Address" color="border-blue-500">
          <p>Send your USDT (TRC20) to:</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono break-all">{walletAddress}</code>
            <button onClick={handleCopy} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </Step>

        <Step title="📱 Step 2: Open Wallet" color="border-green-500">
          <ul className="list-disc ml-5">
            <li>Use Binance, Trust Wallet, or TronLink.</li>
            <li>Ensure USDT is on <strong>TRC-20</strong> network.</li>
          </ul>
        </Step>

        <Step title="💸 Step 3: Send USDT" color="border-purple-500">
          <ul className="list-decimal ml-5">
            <li>Tap &quot;Withdraw&quot; or &quot;Send&quot;.</li>
            <li>Paste address: <code className="bg-gray-100 px-1 rounded text-blue-600 font-mono">{walletAddress}</code></li>
            <li>Enter amount (e.g., 100 USDT).</li>
            <li>Choose <strong>TRC20</strong> network.</li>
            <li>Confirm transaction.</li>
          </ul>
        </Step>

        <Step title="🔁 Step 4: Send TXID" color="border-yellow-500">
          <ul className="list-decimal ml-5">
            <li>Copy transaction hash (TXID).</li>
            <li>Send TXID via form or email.</li>
          </ul>
          <p className="text-xs text-gray-500">Every deposit is manually verified.</p>
        </Step>

        <Step title="🎉 Step 5: Start Earning" color="border-red-500">
          <p>Daily reward example: $2 per 100 USDT. Withdraw after 12h. Deposit locked for 30 days.</p>
        </Step>

        <Step title="⚠️ Important Notes" color="border-yellow-400">
          <ul className="list-disc ml-5 text-sm">
            <li>Only send USDT via <strong>TRC20</strong>.</li>
            <li>Never share your wallet&apos;s seed phrase.</li>
            <li>Withdraw only after 30 days.</li>
            <li>Keep TXID safe for records.</li>
          </ul>
        </Step>

        <div className="mt-8 text-sm text-gray-700">
          <h3 className="text-lg font-medium">📧 Manual Submission</h3>
          <p>
            Send TXID and screenshot to:
            <a href="mailto:imran@gmail.com" className="text-blue-600 underline ml-1">imran@gmail.com</a>
          </p>
          <p className="mt-1 text-xs">Include wallet address and TXID.</p>
        </div>
        
        {/* Deposit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/deposit')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center transition-all duration-300 transform hover:scale-105"
          >
            Make a Deposit Now
            <ArrowRight className="ml-2" />
          </button>
        </div>
      </main>
    </>
  );
}
