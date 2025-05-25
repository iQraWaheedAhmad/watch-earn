'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function DepositConfirmWrapper() {
  return (
    <ProtectedRoute>
      <DepositConfirmPage />
    </ProtectedRoute>
  );
}

function DepositConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get deposit details from URL params
  const amount = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'USDT';
  const txHash = searchParams.get('txHash') || '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const watched = localStorage.getItem('videoWatched');
      if (!watched) {
        router.push('/video_route');
      }
    }
  }, [router]);

  const handleBackToDeposit = () => {
    router.push('/deposit');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <button 
          onClick={handleBackToDeposit}
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deposit
        </button>
        
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Deposit Submitted!</h1>
            <p className="text-gray-400">Your deposit request has been received</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-xl font-bold">{amount} {currency}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Transaction Hash</p>
              <p className="text-sm font-medium break-all">{txHash}</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Estimated Processing Time</p>
              <p className="text-md font-medium">24 hours</p>
            </div>
          </div>

          <div className="text-sm text-yellow-400 mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg">
            <p className="mb-2 font-medium">⚠️ Important Information</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>Your deposit is being processed</li>
              <li>You will receive a notification once confirmed</li>
              <li>Please allow up to 24 hours for processing</li>
              <li>Check deposit history for status updates</li>
            </ul>
          </div>

          <button
            onClick={handleBackToDeposit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium"
          >
            Return to Deposit Page
          </button>
        </div>
      </div>
    </div>
  );
} 