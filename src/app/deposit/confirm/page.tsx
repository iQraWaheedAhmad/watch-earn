"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

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
  const amount = searchParams.get("amount") || "";
  const currency = searchParams.get("currency") || "USDT";
  const txHash = searchParams.get("txHash") || "";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-900/30 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Deposit Submitted!</h1>
            <p className="text-gray-400">
              Your deposit request has been received and is pending admin
              confirmation.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Amount</p>
              <p className="text-xl font-bold">
                {amount} {currency}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Transaction Hash</p>
              <p className="text-sm font-medium break-all">{txHash}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Estimated Processing Time</p>
              <p className="text-md font-medium">Up to 24 hours</p>
            </div>
          </div>

          <div className="text-sm text-yellow-400 mb-6 p-4 bg-yellow-900/30 border border-yellow-800 rounded-lg text-center">
            <p className="mb-2 font-medium">
              ⏳ Please wait while your deposit is being confirmed by the admin.
            </p>
            <p className="text-gray-300">
              You will be notified once your deposit is confirmed. You can check
              your deposit status in the deposit history.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium mt-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
