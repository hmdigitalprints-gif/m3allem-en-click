import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthScreens } from '../components/auth/AuthScreens';
import { useAuth } from '../context/AuthContext';

export default function PhoneAuth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'artisan') navigate('/');
      else if (user.role === 'seller') navigate('/');
      else if (user.role === 'company') navigate('/');
      else navigate('/profile');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full relative">
        <AuthScreens onSuccess={() => navigate('/profile')} onBack={() => navigate('/')} />
      </div>
    </div>
  );
}