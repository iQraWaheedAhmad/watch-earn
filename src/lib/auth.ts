import axios from 'axios';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('authToken') !== null;
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get auth token
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Set auth headers for API requests
export const setAuthHeader = (token: string | null = getToken()): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Login user
export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await axios.post('/api/auth/login', { email, password });
  
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setAuthHeader(response.data.token);
  }
  
  return { user: response.data.user, token: response.data.token };
};

// Register user
export const register = async (name: string, email: string, password: string): Promise<User> => {
  const response = await axios.post('/api/auth/register', { name, email, password });
  return response.data.user;
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  setAuthHeader(null);
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  setAuthHeader(); // Ensure auth header is set
  const response = await axios.get('/api/auth/profile');
  return response.data.user;
};

// Initialize auth state
export const initAuth = (): void => {
  setAuthHeader();
};
