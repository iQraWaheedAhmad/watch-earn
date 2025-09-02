"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { useRouter } from "next/navigation";

const navbarLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, getToken } = useAuth();
  const [profit, setProfit] = useState<number | null>(null); // now used for balance display
  const [profitLoading, setProfitLoading] = useState(false);
  const [depositStatus, setDepositStatus] = useState<
    null | "pending" | "confirmed" | "rejected"
  >(null);
  const [canStartTask, setCanStartTask] = useState(true);
  const [timer, setTimer] = useState(0);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  // Fetch user balance (prefer balance for display; fallback to totalProfit)
  const fetchProfit = async () => {
    if (!isAuthenticated || !getToken()) return;

    setProfitLoading(true);
    try {
      // Fetch all plan progresses for the user with authentication
      const res = await fetch(`/api/plan/all-progress`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Fetched profit data:", data); // Debug line
      if (res.ok && data.success) {
        const value = (data.balance !== undefined) ? Number(data.balance) : (data.totalProfit !== undefined ? Number(data.totalProfit) : 0);
        setProfit(value);
      } else {
        console.error("Failed to fetch profit:", data.error);
        setProfit(0);
      }
    } catch (error) {
      console.error("Error fetching profit:", error);
      setProfit(0);
    } finally {
      setProfitLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfit();
    } else {
      setProfit(null);
    }
  }, [isAuthenticated]);

  // Listen for profitUpdated event to refresh balance
  useEffect(() => {
    const handleProfitUpdate = (e: CustomEvent) => {
      if (isAuthenticated) {
        // Prefer balance for display; fallback to totalProfit
        if (e.detail?.balance !== undefined) {
          setProfit(Number(e.detail.balance));
        } else if (e.detail?.totalProfit !== undefined) {
          setProfit(Number(e.detail.totalProfit));
        } else {
          // Otherwise fetch fresh data
          fetchProfit();
        }
      }
    };
    window.addEventListener(
      "profitUpdated",
      handleProfitUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "profitUpdated",
        handleProfitUpdate as EventListener
      );
    };
  }, [isAuthenticated]);

  // Proactively refresh on window focus/visibility change and with light polling
  useEffect(() => {
    if (!isAuthenticated) return;

    const onFocus = () => {
      fetchProfit();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchProfit();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    // Light polling every 30s to catch admin-side updates
    const interval = setInterval(() => {
      fetchProfit();
    }, 30000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Fetch plan progress for timer/button
  useEffect(() => {
    const fetchPlanProgress = async () => {
      if (!isAuthenticated || !getToken()) return;
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
          setDepositStatus(null);
          // Check if user can start a new task (after 12am)
          const lastRoundDate = data.progresses[0].lastRoundDate;
          if (lastRoundDate) {
            const lastRound = new Date(lastRoundDate);
            const now = new Date();
            const nowDate = now.toLocaleDateString('en-CA');
            const lastRoundDateStr = lastRound.toLocaleDateString('en-CA');
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
          setDepositStatus(null);
        }
      } catch {
        setDepositStatus(null);
      }
    };
    fetchPlanProgress();
  }, [isAuthenticated, getToken]);

  // Fetch deposit status for the user
  useEffect(() => {
    const fetchDepositStatus = async () => {
      if (!isAuthenticated || !getToken() || !user?.id) {
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
    // Listen for storage changes (login/logout in other tabs)
    const handleStorage = () => {
      fetchDepositStatus();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [isAuthenticated, getToken, user]);

  // Timer countdown
  useEffect(() => {
    if (!canStartTask && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 1000 ? prev - 1000 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canStartTask, timer]);

  // Close profile dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      setIsProfileOpen(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-black p-4 fixed w-full top-0 left-0 z-10 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-md"
            />
            <span className="font-bold text-xl text-white">WatchEarn</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navbarLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-white hover:text-gray-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Balance Display */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-2 mr-4">
            <span className="text-yellow-400 font-bold text-lg">
              {profitLoading ? "Balance: ..." : `Balance: $${profit ?? 0}`}
            </span>
          </div>
        )}

        {/* Auth Buttons or User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Start Task or Deposit Button (Desktop) */}
              {!depositStatus ? (
                <button
                  onClick={() => router.push("/deposit")}
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-500 text-white hover:bg-yellow-400"
                >
                  Deposit
                </button>
              ) : depositStatus === "pending" ? (
                <button
                  disabled
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-400 text-white cursor-not-allowed opacity-70"
                >
                  Deposit Pending
                </button>
              ) : depositStatus === "rejected" ? (
                <>
                  <button
                    onClick={() => setShowRejectedModal(true)}
                    className="px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
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
                            If you have any questions or need help, please
                            contact our support team. We&#39;re here to help! 😊
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
                  className={`px-4 py-2 rounded font-semibold transition ${
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
                      )}h ${Math.floor(
                        (timer / (1000 * 60)) % 60
                      )}m ${Math.floor((timer / 1000) % 60)}s`}
                </button>
              )}
              <Link
                href="/withdraw"
                className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-400"
              >
                Withdraw
              </Link>
              <div className="relative profile-menu">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/referral-dashboard"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      💰 Refer a Friend
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/registrationfom"
                className="text-white bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400"
              >
                Register
              </Link>
              <Link
                href="/login_route"
                className="text-white bg-gray-500 px-4 py-2 rounded hover:bg-gray-400"
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="text-white bg-red-600 px-4 py-2 rounded hover:bg-red-500"
              >
                Admin
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black mt-4 p-4">
          {navbarLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-white hover:text-gray-400 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2 mb-2 mt-2">
                <span className="text-yellow-400 font-bold text-lg">
                  {profitLoading ? "Balance: ..." : `Balance: $${profit ?? 0}`}
                </span>
              </div>
              {/* Start Task or Deposit Button */}
              {!depositStatus ? (
                <button
                  onClick={() => router.push("/deposit")}
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-500 text-white hover:bg-yellow-400"
                >
                  Deposit
                </button>
              ) : depositStatus === "pending" ? (
                <button
                  disabled
                  className="px-4 py-2 rounded font-semibold transition bg-yellow-400 text-white cursor-not-allowed opacity-70"
                >
                  Deposit Pending
                </button>
              ) : depositStatus === "rejected" ? (
                <>
                  <button
                    onClick={() => setShowRejectedModal(true)}
                    className="px-4 py-2 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
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
                            If you have any questions or need help, please
                            contact our support team. We&#39;re here to help! 😊
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
                  className={`px-4 py-2 rounded font-semibold transition ${
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
                      )}h ${Math.floor(
                        (timer / (1000 * 60)) % 60
                      )}m ${Math.floor((timer / 1000) % 60)}s`}
                </button>
              )}
              <Link
                href="/withdraw"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Withdraw
              </Link>
              <div className="py-2 border-t border-gray-700">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <Link
                  href="/referral-dashboard"
                  className="block w-full text-left px-2 py-2 text-sm text-white hover:bg-gray-700 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💰 Refer a Friend
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/registrationfom"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link
                href="/login_route"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/admin/login"
                className="block text-white hover:text-gray-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
