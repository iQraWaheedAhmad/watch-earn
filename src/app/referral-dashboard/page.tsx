"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Dynamically import the ReferralDashboard component with no SSR
const ReferralDashboard = dynamic(
  () => import('../components/ReferralDashboard'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const ReferralDashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and loading is complete
    if (!loading && !isAuthenticated) {
      router.push('/login_route');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    router.push('/login_route');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Referral Dashboard</h1>
          <ReferralDashboard />
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboardPage;
