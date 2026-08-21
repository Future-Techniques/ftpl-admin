import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('futuretek_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('futuretek_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem('futuretek_admin_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/admin/auth/me');
        if (res.data.result === 'success') {
          setUser(res.data.user);
          localStorage.setItem('futuretek_admin_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('futuretek_admin_token');
        localStorage.removeItem('futuretek_admin_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/admin/auth/login', { email, password });
    if (res.data.result === 'success') {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('futuretek_admin_token', newToken);
      localStorage.setItem('futuretek_admin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/admin/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('futuretek_admin_token');
      localStorage.removeItem('futuretek_admin_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
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
