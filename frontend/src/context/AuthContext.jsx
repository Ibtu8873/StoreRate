import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ratehub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ratehub_token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to determine destination route based on role
  const getRoleDashboard = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'user':
      default:
        return '/user/dashboard';
    }
  };

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('ratehub_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success && data.token && data.user) {
      localStorage.setItem('ratehub_token', data.token);
      localStorage.setItem('ratehub_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      const target = getRoleDashboard(data.user.role);
      navigate(target, { replace: true });
      return data;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const signup = async (formData) => {
    const data = await authService.signup(formData);
    if (data.success && data.token && data.user) {
      localStorage.setItem('ratehub_token', data.token);
      localStorage.setItem('ratehub_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      navigate('/user/dashboard', { replace: true });
      return data;
    }
    throw new Error(data.message || 'Signup failed.');
  };

  const logout = () => {
    localStorage.removeItem('ratehub_token');
    localStorage.removeItem('ratehub_user');
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const updatePassword = async (currentPassword, newPassword) => {
    return authService.updatePassword(currentPassword, newPassword);
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('ratehub_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    signup,
    logout,
    updatePassword,
    refreshUser,
    getRoleDashboard
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
