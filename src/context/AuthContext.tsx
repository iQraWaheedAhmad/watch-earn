"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  register,
  getUserProfile,
  initAuth,
  getToken,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; referralCode?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AxiosErrorWithMessage = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        initAuth();
        if (isAuthenticated()) {
          // Get user from localStorage first for immediate UI update
          const localUser = getCurrentUser();
          if (localUser) {
            setUser(localUser);
          }

          // Then try to fetch fresh data from API
          try {
            const profile = await getUserProfile();
            setUser(profile);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // If API call fails, we still have the localStorage data
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError("Authentication error");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await login(email, password);
      setUser(user);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as AxiosErrorWithMessage).response?.data?.message
      ) {
        setError((error as AxiosErrorWithMessage).response!.data!.message!);
      } else {
        setError("Login failed");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (data: { name: string; email: string; password: string; referralCode?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const { name, email, password, referralCode } = data;
      const { user } = await register(name, email, password, referralCode);
      setUser(user);
      // setAuthHeader(token); // This line is commented out because setAuthHeader is not defined in the provided code
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as AxiosErrorWithMessage).response?.data?.message
      ) {
        setError((error as AxiosErrorWithMessage).response!.data!.message!);
      } else {
        setError("Registration failed");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    setUser(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error refreshing user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
