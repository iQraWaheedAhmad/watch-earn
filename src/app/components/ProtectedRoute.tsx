'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication check is complete (not loading) and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login_route');
    }

    // If admin-only route and user is not admin
    if (
      adminOnly && 
      !loading && 
      isAuthenticated && 
      user?.email !== 'admin@gmail.com'
    ) {
      router.push('/'); // Redirect non-admin users to home page
    }
  }, [loading, isAuthenticated, user, router, adminOnly]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // If admin-only route and user is not admin, don't render children
  if (adminOnly && user?.email !== 'admin@gmail.com') {
    return null;
  }

  // If authenticated (and admin if required), render children
  return <>{children}</>;
};

export default ProtectedRoute;
