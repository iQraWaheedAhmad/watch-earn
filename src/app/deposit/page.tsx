"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  History,
  Loader2,
  XCircle,
  CheckSquare,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Image from "next/image";

// Define types for deposit and stats

type Deposit = {
  id: string;
  createdAt: string;
  amount: number;
  currency: string;
  transactionHash: string;
  paymentProofUrl?: string;
  status: string;
};

type DepositStats = {
  total: number;
  pending: number;
  completed: number;
  rejected: number;
  totalAmount: number;
};

export default function DepositPageWrapper() {
  return (
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  );
}

function DepositPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();

  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [depositHistory, setDepositHistory] = useState<Deposit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposit");
  const [stats, setStats] = useState<DepositStats>({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [hasDeposited, setHasDeposited] = useState(false);

  const walletAddresses = {
    USDT: "TJuZCvYANND2emRa4ssrWqpZswPFUaJVWQ",
  };

  // Fetch deposit history
  const fetchDepositHistory = async () => {
    if (!user?.id) return;

    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/deposits/history?userId=${user?.id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDepositHistory(data.deposits || []);
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
      console.error("Failed to fetch deposit history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDepositHistory();
    }
  }, [user]);

  // Check if user has already deposited
  useEffect(() => {
    const fetchPlanProgress = async () => {
      if (!user || !getToken()) return;
      try {
        const res = await fetch(`/api/plan/all-progress`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (
          res.ok &&
          data.success &&
          data.progresses &&
          data.progresses.length > 0
        ) {
          setHasDeposited(true);
        } else {
          setHasDeposited(false);
        }
      } catch {
        setHasDeposited(false);
      }
    };
    fetchPlanProgress();
  }, [user, getToken]);

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!transactionHash) {
      setError("Please enter the transaction hash");
      return;
    }

    if (!paymentProof) {
      setError("Please upload payment screenshot");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // First upload the payment proof
      const formData = new FormData();
      formData.append("file", paymentProof);

      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload payment proof");
      }

      const { fileUrl } = await uploadRes.json();

      // Then submit the deposit confirmation
      const res = await fetch("/api/deposits/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          transactionHash,
          amount,
          currency: selectedCoin,
          paymentProofUrl: fileUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Deposit confirmation failed");

      setMessage(
        data.message || "Deposit confirmation submitted successfully!"
      );
      setTransactionHash("");
      setAmount("");
      setPaymentProof(null);
      // Debug log for deposit API response
      console.log("Deposit API response:", data);
      // Wait 500ms before reload to ensure backend updates
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setPaymentProof(file);
      setError("");
    }
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

  // Get status badge based on deposit status
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

  // Add this new component for the modal
  const ImageModal = ({
    imageUrl,
    onClose,
  }: {
    imageUrl: string;
    onClose: () => void;
  }) => {
    if (!imageUrl) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl w-full bg-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Payment Proof"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        </div>
      </div>
    );
  };

  if (hasDeposited) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Deposit Complete
          </h2>
          <p className="text-white mb-2">
            You have already made a deposit. Only one deposit is allowed per
            user.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {selectedProof && (
        <ImageModal
          imageUrl={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Deposit</h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`py-3 px-6 font-medium ${
              activeTab === "deposit"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400"
            }`}
          >
            Make Deposit
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
              Deposit History
            </span>
          </button>
        </div>

        {activeTab === "deposit" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Deposit Details</h2>
              <form onSubmit={handleSubmitDeposit}>
                <label className="block mb-2 font-medium text-sm">
                  Select Coin
                </label>
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDT">Tether (USDT)</option>
                </select>

                <label className="block mb-2 font-medium text-sm">
                  Deposit Amount
                </label>
                <select
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select amount</option>
                  <option value="50">$50</option>
                  <option value="100">$100</option>
                  <option value="150">$150</option>
                  <option value="250">$250</option>
                  <option value="500">$500</option>
                  <option value="1000">$1000</option>
                  <option value="1500">$1500</option>
                  <option value="2500">$2500</option>
                </select>

                <label className="block mb-2 font-medium text-sm">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  placeholder="Enter transaction hash/ID"
                  className="w-full p-3 rounded bg-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  The transaction hash/ID from your wallet or exchange
                </p>

                <label className="block mb-2 font-medium text-sm">
                  Payment Screenshot
                </label>
                <div className="relative mb-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="payment-proof"
                  />
                  <label
                    htmlFor="payment-proof"
                    className={`w-full p-3 rounded flex items-center justify-center border-2 border-dashed cursor-pointer
                      ${
                        paymentProof
                          ? "border-green-500 bg-green-900/20"
                          : "border-gray-600 hover:border-blue-500 bg-gray-700"
                      }`}
                  >
                    <Upload
                      className={`w-5 h-5 mr-2 ${
                        paymentProof ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={
                        paymentProof ? "text-green-500" : "text-gray-400"
                      }
                    >
                      {paymentProof
                        ? paymentProof.name
                        : "Upload payment screenshot"}
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload a screenshot of your transaction (Max size: 5MB)
                  </p>
                </div>

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
                  type="submit"
                  disabled={loading || hasDeposited}
                  className={`w-full ${
                    loading || hasDeposited
                      ? "bg-blue-800 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-3 rounded font-semibold flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : hasDeposited ? (
                    "Deposit Complete"
                  ) : (
                    "Submit Deposit"
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>

              <label className="block mb-2 font-medium text-sm">
                Deposit Address ({selectedCoin})
              </label>
              <div className="bg-gray-700 p-3 rounded mb-4 break-words text-sm">
                {walletAddresses[selectedCoin]}
              </div>

              <div className="text-center mb-4">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${walletAddresses[selectedCoin]}&size=150x150`}
                  alt="QR Code"
                  width={150}
                  height={150}
                  className="mx-auto rounded"
                  unoptimized
                />
              </div>

              {/* Deposit Stats */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Deposit Statistics</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Deposits</p>
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
              </div>

              <div className="text-sm text-gray-400">
                <p className="mb-2">⚠️ Important:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Only send {selectedCoin} to this address</li>
                  <li>{`Minimum deposit: 50 ${selectedCoin}`}</li>
                  <li>Enter transaction hash after sending</li>
                  <li>Deposits are processed within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Deposit History</h2>

            {historyLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              </div>
            ) : depositHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Currency</th>
                      <th className="pb-3">Transaction Hash</th>
                      <th className="pb-3">Proof</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositHistory.map((deposit) => (
                      <tr key={deposit.id} className="border-b border-gray-700">
                        <td className="py-4">
                          {formatDate(deposit.createdAt)}
                        </td>
                        <td className="py-4">{deposit.amount}</td>
                        <td className="py-4">{deposit.currency}</td>
                        <td className="py-4 truncate max-w-[150px]">
                          {deposit.transactionHash}
                        </td>
                        <td className="py-4">
                          {deposit.paymentProofUrl && (
                            <button
                              onClick={() =>
                                setSelectedProof(deposit.paymentProofUrl)
                              }
                              className="flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              View
                            </button>
                          )}
                        </td>
                        <td className="py-4">
                          {getStatusBadge(deposit.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No deposit history found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
