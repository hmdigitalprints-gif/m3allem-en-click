import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthScreens } from '../components/auth/AuthScreens';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is already logged in, redirect to home or their role dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'client') navigate('/profile');
      else if (user.role === 'artisan') navigate('/artisan-dashboard');
      else if (user.role === 'seller') navigate('/seller-dashboard');
      else if (user.role === 'company') navigate('/company-dashboard');
      else navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <AuthScreens 
        onSuccess={() => {
          navigate('/');
        }} 
        onBack={() => navigate('/')} 
      />
    </div>
  );
}
