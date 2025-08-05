'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Copy, Check, Users, DollarSign, Award, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReferredUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  status: 'pending' | 'active' | 'rejected';
}

interface ReferralReward {
  id: number;
  referrerId: number;
  referredUserId: number;
  amount: number;
  planAmount: number;
  planType: string;
  status: 'pending' | 'paid' | 'rejected';
  createdAt: string;
  referrer?: {
    name: string | null;
    email: string | null;
  };
  referredUser?: {
    name: string | null;
    email: string | null;
  };
}

interface ReferralStats {
  totalEarnings: number;
  totalReferrals: number;
  rewards: ReferralReward[];
}

interface ReferralStatProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

const ReferralStat: React.FC<ReferralStatProps> = ({ icon, title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-indigo-600 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const ReferralDashboard = () => {
  const { user, loading } = useAuth();
  
  // Using stats.referralCode directly from the API response
  
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'rewards'>('history');
  const [stats, setStats] = useState<ReferralStats & { referralCode?: string }>({
    totalEarnings: 0,
    totalReferrals: 0,
    rewards: [],
    referralCode: '',
  });

  const fetchReferralData = useCallback(async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      console.log('Auth token from localStorage:', token ? 'Token exists' : 'No token found');
      
      console.log('Fetching referral stats from API...');
      const response = await fetch('/api/referrals/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('API Response:', { status: response.status, statusText: response.statusText, data });
      
      if (response.ok) {
        console.log('Setting stats with referral code:', data.referralCode || 'No referral code in response');
        const updatedStats = {
          totalEarnings: data.totalEarnings || 0,
          totalReferrals: data.totalReferrals || 0,

          referralCode: data.referralCode || '',
        };
        console.log('Updated stats:', updatedStats);
        setStats({
          ...updatedStats,
          rewards: data.rewards || []
        });
        setReferredUsers(data.referredUsers || []);
        setRewards(data.rewards || []);

      } else {
        throw new Error(data.message || `Failed to fetch referral data: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      fetchReferralData();
    }
  }, [fetchReferralData, loading]);

  // Generate referral link
  console.log('Current stats.referralCode:', stats.referralCode);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const referralLink = stats.referralCode 
    ? `${baseUrl}/registrationfom?ref=${stats.referralCode}`
    : 'Loading...';
  console.log('Generated referralLink:', referralLink);

  // Copy referral link to clipboard
  const copyToClipboard = useCallback(() => {
    if (!stats.referralCode) return;
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const link = `${baseUrl}/registrationfom?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }, [stats.referralCode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Referral Dashboard</h1>
        
        {/* Referral Link Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-gray-700 p-3 rounded-md overflow-x-auto">
              <code className="text-sm sm:text-base">{referralLink}</code>
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors relative"
              disabled={!stats.referralCode}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Share this link with friends and earn rewards when they sign up and make a purchase!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ReferralStat
            icon={<Users size={24} className="text-white" />}
            title="Total Referrals"
            value={stats.totalReferrals}
          />
          <ReferralStat
            icon={<DollarSign size={24} className="text-white" />}
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
          />

        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('history')}
              className={`${activeTab === 'history' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Invitation History
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`${activeTab === 'rewards' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Reward History
            </button>
          </nav>
        </div>

        {activeTab === 'history' ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Invitation History</h3>
            {referredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {referredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">You haven&apos;t referred anyone yet. Share your link to start earning!</p>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Reward History</h3>
            {rewards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {rewards.map((reward) => {
                      const isReferrer = reward.referrerId === user?.id;
                      const type = isReferrer ? 'Referral Bonus' : 'Signup Bonus';
                      
                      return (
                        <tr key={reward.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-2 text-yellow-400" />
                              {type}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                            ${reward.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {reward.planType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(reward.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {reward.status === 'paid' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Paid
                              </span>
                            ) : reward.status === 'pending' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                <Clock className="h-4 w-4 mr-1" />
                                Pending
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No reward history found. Start referring friends to earn rewards!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;
