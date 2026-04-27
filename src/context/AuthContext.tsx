import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'client' | 'artisan' | 'admin' | 'seller' | 'company';
  verified: boolean;
  avatar_url?: string;
  preferred_language?: string;
  points?: number;
  city?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  verifyOtp: (userId: string, code: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string; city?: string; address?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('m3allem_user');
    const savedToken = localStorage.getItem('m3allem_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        // If the backend returns that OTP or Verification is required, don't throw. 
        // Pass the response to the caller so they can switch to the channel selection screen.
        if (err.requiresOtp || err.requiresVerification) {
          return err;
        }
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      if (data.token && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('m3allem_user', JSON.stringify(data.user));
        localStorage.setItem('m3allem_token', data.token);
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Verification failed');
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('m3allem_user', JSON.stringify(data.user));
      localStorage.setItem('m3allem_token', data.token);
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
        body: JSON.stringify(data),
      });
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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('m3allem_user');
    localStorage.removeItem('m3allem_token');
  };

  const updateLanguage = async (lang: string) => {
    if (!user || !token) return;
    const res = await fetch(`/api/auth/users/${user.id}/language`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ language: lang }),
    });
    if (res.ok) {
      const updatedUser = { ...user, preferred_language: lang };
      setUser(updatedUser);
      localStorage.setItem('m3allem_user', JSON.stringify(updatedUser));
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update language');
    }
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string; city?: string; address?: string }) => {
    if (!user || !token) return;
    const res = await fetch(`/api/auth/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updatedUser = { 
        ...user, 
        name: data.name || user.name, 
        avatar_url: data.avatarUrl || user.avatar_url,
        city: data.city || user.city,
        address: data.address || user.address
      };
      setUser(updatedUser);
      localStorage.setItem('m3allem_user', JSON.stringify(updatedUser));
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verifyOtp, register, updateLanguage, updateProfile, logout, isLoading }}>
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
