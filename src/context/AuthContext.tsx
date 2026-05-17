import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'client' | 'artisan' | 'admin' | 'seller' | 'company';
  verified: boolean;
  avatar_url?: string;
  preferred_language?: string;
  points?: number;
  wallet_balance?: number;
  city?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  verifyOtp: (userId: string, code: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string; city?: string; address?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/users/me', { 
          credentials: 'include'
        });
        if (res.ok) {
          const userData = await res.json();
          setUser({ ...userData, avatar_url: userData.avatarUrl || userData.avatar_url, preferred_language: userData.preferredLanguage || userData.preferred_language });
        } else {
          setUser(null);
        }
      } catch (err: any) {
        if (err?.name === 'TypeError' && err?.message === 'Failed to fetch') {
          console.warn("Network error verifying session. Server might be starting up.");
        } else {
          console.error("Session verification failed", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })});
      if (!res.ok) {
        const err = await res.json();
        if (err.requiresOtp || err.requiresVerification) {
          return err;
        }
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      if (data.user) {
        localStorage.clear();
        sessionStorage.clear();
        setUser(data.user);
        window.location.reload();
      }
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw err;
    }
  };

  const verifyOtp = async (userId: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', { credentials: 'include', 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })});
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed');
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw err;
    }
  };

  const register = async (data: any) => {
    let endpoint = '/api/auth/register/client';
    if (data.role === 'artisan') endpoint = '/api/auth/register/artisan';
    else if (data.role === 'seller') endpoint = '/api/auth/register/seller';
    else if (data.role === 'company') endpoint = '/api/auth/register/company';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)});
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      return await res.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { credentials: 'include',  method: 'POST' });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const updateLanguage = async (lang: string) => {
    if (!user) return;
    const res = await fetch(`/api/auth/users/${user.id}/language`, { 
      credentials: 'include', 
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language: lang })});
    if (res.ok) {
      const updatedUser = { ...user, preferred_language: lang };
      setUser(updatedUser);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update language');
    }
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string; city?: string; address?: string; phone?: string }) => {
    if (!user) return;
    const res = await fetch(`/api/auth/users/${user.id}`, { 
      credentials: 'include', 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)});
    if (res.ok) {
      const updatedUser = { 
        ...user, 
        name: data.name || user.name, 
        avatar_url: data.avatarUrl || user.avatar_url,
        city: data.city || user.city,
        address: data.address || user.address,
        phone: data.phone || user.phone
      };
      setUser(updatedUser);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, register, updateLanguage, updateProfile, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
