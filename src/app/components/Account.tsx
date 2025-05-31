"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountsPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [depositStatus, setDepositStatus] = useState<
    null | "pending" | "confirmed" | "rejected"
  >(null);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [canStartTask, setCanStartTask] = useState(true);
  const [timer, setTimer] = useState(0);

  // Fetch deposit status for the user
  useEffect(() => {
    const fetchDepositStatus = async () => {
      if (!user || !getToken()) {
        setDepositStatus(null);
        return;
      }
      try {
        const res = await fetch(`/api/deposits/history?userId=${user.id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const deposits = data.deposits || [];
          const confirmedDeposit = deposits.find(
            (d) => d.status === "confirmed"
          );
          if (confirmedDeposit) {
            setDepositStatus("confirmed");
          } else if (deposits.some((d) => d.status === "pending")) {
            setDepositStatus("pending");
          } else if (deposits.some((d) => d.status === "rejected")) {
            setDepositStatus("rejected");
          } else {
            setDepositStatus(null);
          }
        } else {
          setDepositStatus(null);
        }
      } catch {
        setDepositStatus(null);
      }
    };
    fetchDepositStatus();
  }, [user, getToken]);

  // Fetch plan progress for timer/button
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
          // Check if user can start a new task (after 12am)
          const lastRoundDate = data.progresses[0].lastRoundDate;
          if (lastRoundDate) {
            const lastRound = new Date(lastRoundDate);
            const now = new Date();
            const nowDate = now.toISOString().slice(0, 10);
            const lastRoundDateStr = lastRound.toISOString().slice(0, 10);
            if (nowDate === lastRoundDateStr) {
              // Calculate ms left until next day
              const nextDay = new Date(now);
              nextDay.setDate(now.getDate() + 1);
              nextDay.setHours(0, 0, 0, 0);
              setCanStartTask(false);
              setTimer(nextDay.getTime() - now.getTime());
            } else {
              setCanStartTask(true);
              setTimer(0);
            }
          } else {
            setCanStartTask(true);
            setTimer(0);
          }
        } else {
          setCanStartTask(true);
          setTimer(0);
        }
      } catch {
        setCanStartTask(true);
        setTimer(0);
      }
    };
    fetchPlanProgress();
  }, [user, getToken]);

  // Timer countdown
  useEffect(() => {
    if (!canStartTask && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 1000 ? prev - 1000 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canStartTask, timer]);

  return (
    <section className="bg-gray-900 min-h-screen py-12 px-6">
      <div className="container mx-auto">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Crypto Wallet Account
        </h1>
        <p className="text-center text-white max-w-3xl mx-auto mb-12">
          Securely manage your cryptocurrency with Binance. Fast, reliable, and
          global.
        </p>

        {/* Binance Container */}
        <div className="flex justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-sm w-full transition hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <Image
                src="/P7.jpg"
                alt="Binance"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-2">
              Binance
            </h2>
            <p className="text-gray-600 text-center text-sm sm:text-base mb-4">
              Binance is the worlds leading cryptocurrency exchange, offering
              secure and fast crypto transactions.
            </p>

            {/* Start Task or Deposit Button */}
            {!depositStatus ? (
              <button
                onClick={() => router.push("/deposit")}
                className="block w-full text-center bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-400 transition"
              >
                Deposit
              </button>
            ) : depositStatus === "pending" ? (
              <button
                disabled
                className="block w-full text-center bg-yellow-400 text-white px-4 py-2 rounded opacity-70 cursor-not-allowed"
              >
                Deposit Pending
              </button>
            ) : depositStatus === "rejected" ? (
              <>
                <button
                  onClick={() => setShowRejectedModal(true)}
                  className="block w-full text-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  ❌ Deposit Rejected
                </button>
                {showRejectedModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center relative">
                      <button
                        onClick={() => setShowRejectedModal(false)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        aria-label="Close"
                      >
                        ×
                      </button>
                      <div className="text-4xl mb-4">❌📧</div>
                      <h3 className="text-xl font-bold text-red-600 mb-2">
                        Deposit Rejected
                      </h3>
                      <p className="text-gray-800 mb-4">
                        We have sent you an email with the reason for your
                        deposit rejection.
                        <br />
                        <span className="text-gray-600">
                          If you have any questions or need help, please contact
                          our support team. We&#39;re here to help! 😊
                        </span>
                      </p>
                      <button
                        onClick={() => setShowRejectedModal(false)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => canStartTask && router.push("/video_route")}
                className={`block w-full text-center px-4 py-2 rounded transition font-semibold ${
                  canStartTask
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                disabled={!canStartTask}
              >
                {canStartTask
                  ? "Start Task"
                  : `Start Task after ${Math.floor(
                      timer / (1000 * 60 * 60)
                    )}h ${Math.floor((timer / (1000 * 60)) % 60)}m ${Math.floor(
                      (timer / 1000) % 60
                    )}s`}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
