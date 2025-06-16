"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowDown,
  History,
  XCircle,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";

type Withdrawal = {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  recipientAddress: string;
  status: string;
};

type WithdrawalStats = {
  total: number;
  pending: number;
  completed: number;
  rejected: number;
  totalAmount: number;
};

export default function WithdrawPageWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawPage />
    </ProtectedRoute>
  );
}

function WithdrawPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getToken } = useAuth();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("USDT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<WithdrawalStats>({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("withdraw"); // withdraw or history
  const [availableBalance, setAvailableBalance] = useState(0);

  // Backend eligibility check for withdrawal
  // Update in withdraw page
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const res = await fetch("/api/plan/all-progress", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.progresses)) {
          const hasAnyRounds = data.progresses.some((p) => p.roundCount > 0);
          const eligible = data.progresses.some(
            (p) => p.canWithdraw && p.profit > 0 && p.roundCount > 0
          );
          if (!eligible && !hasAnyRounds) {
            router.push("/video_route?reason=complete_videos_first");
            // Force refetch to update state after redirect
            await fetch("/api/plan/all-progress", {
              headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
              },
            });
          }
        } else {
          router.push("/video_route?reason=complete_videos_first");
          await fetch("/api/plan/all-progress", {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          });
        }
      } catch {
        router.push("/video_route?reason=complete_videos_first");
        await fetch("/api/plan/all-progress", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
      }
    };
    checkEligibility();
  }, [router, getToken]);

  const fetchWithdrawalHistory = useCallback(async () => {
    if (!user?.id) return;

    setHistoryLoading(true);
    try {
      const response = await fetch(
        `/api/withdrawals/history?userId=${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            completed: 0,
            rejected: 0,
            totalAmount: 0,
          }
        );
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id, getToken]);

  // Fetch withdrawal history and stats
  useEffect(() => {
    fetchWithdrawalHistory();
  }, [fetchWithdrawalHistory]);

  // Check if we have a success message from confirmation page
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setMessage("Withdrawal request submitted successfully!");
      // Refresh withdrawal history
      fetchWithdrawalHistory();
    }
  }, [searchParams, fetchWithdrawalHistory]);

  // Fetch available balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/plan/all-progress", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (res.ok && data.totalProfit !== undefined) {
          setAvailableBalance(data.totalProfit);
        }
      } catch {}
    };
    fetchBalance();
  }, [getToken]);

  // After a successful withdrawal, update balance and stats
  useEffect(() => {
    if (message) {
      // Refetch balance and withdrawal history
      const fetchBalance = async () => {
        try {
          const res = await fetch("/api/plan/all-progress", {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const data = await res.json();
          if (res.ok && data.totalProfit !== undefined) {
            setAvailableBalance(data.totalProfit);
          }
        } catch {}
      };
      fetchBalance();
      fetchWithdrawalHistory();
    }
  }, [message, getToken, fetchWithdrawalHistory]);

  // Validate amount on change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError("");
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > availableBalance) {
      setError(
        "Insufficient balance. Your available balance is $" + availableBalance
      );
    }
  };

  const handleWithdraw = () => {
    if (!address.trim()) {
      setError("Please enter a valid recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      setError(
        "Insufficient balance. Your available balance is $" + availableBalance
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    // Redirect to confirmation page with withdrawal details
    router.push(
      `/withdraw/confirm?amount=${amount}&currency=${asset}&address=${encodeURIComponent(
        address
      )}`
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge based on withdrawal status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirm":
        return (
          <span className="flex items-center text-green-400 text-sm">
            <CheckSquare className="w-4 h-4 mr-1" />
            Confirm
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-400 text-sm">
            <Clock className="w-4 h-4 mr-1 animate-pulse" />
            Pending
          </span>
        );
      case "reject":
        return (
          <span className="flex items-center text-red-400 text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Withdraw Funds</h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`py-3 px-6 font-medium ${
              activeTab === "withdraw"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Make Withdrawal
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-medium ${
              activeTab === "history"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            <span className="flex items-center">
              <History className="w-4 h-4 mr-2" />
              Withdrawal History
            </span>
          </button>
        </div>

        {activeTab === "withdraw" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Request Withdrawal</h2>

              <label className="block mb-2 text-sm font-medium">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USDT">Tether (USDT)</option>
              </select>

              <label className="block mb-2 text-sm font-medium">
                Recipient Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter wallet address"
              />

              <label className="block mb-2 font-medium text-sm">
                Amount to Withdraw
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
                className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-400 mb-2">
                Available Balance: ${availableBalance}
              </p>

              {message && (
                <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                  <div className="flex items-center text-green-400 font-medium">
                    <CheckCircle className="mr-2" />
                    {message}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <div className="flex items-center text-red-400 font-medium">
                    <AlertCircle className="mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading}
                className={`w-full ${
                  loading ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
                } text-white py-3 rounded font-semibold flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>Submit Withdrawal Request</>
                )}
              </button>
            </div>

            {/* Withdrawal Stats */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">
                Withdrawal Statistics
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Withdrawals</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {stats.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.completed}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p className="mb-2">⚠️ Important Notes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Withdrawals are processed within 24 hours</li>
                  <li>Minimum withdrawal: 10 {asset}</li>
                  <li>Ensure your wallet address is correct</li>
                  <li>Transaction fees will be deducted from the amount</li>
                </ul>
              </div>

              {withdrawals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">
                    Recent Withdrawals
                  </h3>
                  <div className="space-y-2">
                    {withdrawals.slice(0, 3).map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            {formatDate(withdrawal.createdAt)}
                          </span>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-medium">
                            {withdrawal.amount} {withdrawal.currency}
                          </span>
                          <button
                            onClick={() => setActiveTab("history")}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View All
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Withdrawal History
            </h2>

            {historyLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Currency</th>
                      <th className="pb-3">Address</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr
                        key={withdrawal.id}
                        className="border-b border-gray-700"
                      >
                        <td className="py-4">
                          {formatDate(withdrawal.createdAt)}
                        </td>
                        <td className="py-4">{withdrawal.amount}</td>
                        <td className="py-4">{withdrawal.currency}</td>
                        <td className="py-4 truncate max-w-[150px]">
                          {withdrawal.recipientAddress}
                        </td>
                        <td className="py-4">
                          {getStatusBadge(withdrawal.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <ArrowDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No withdrawal history found</p>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Make your first withdrawal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
