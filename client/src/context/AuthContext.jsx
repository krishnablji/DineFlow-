import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/apiServices';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dineflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current user on boot
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('dineflow_token');
      const savedUser = localStorage.getItem('dineflow_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Refresh profile in background
          const res = await authApi.getMe();
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('dineflow_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('[AuthContext Error]:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('dineflow_token', res.data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('dineflow_token', res.data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user, message: res.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // 1-Click Demo Login
  const demoLogin = async (role = 'waiter', tableNumber = 4) => {
    try {
      const res = await authApi.demoLogin(role, tableNumber);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('dineflow_token', res.data.token);
        localStorage.setItem('dineflow_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Demo login failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dineflow_token');
    localStorage.removeItem('dineflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        isAuthenticated: !!user,
        isManager: user?.role === 'manager',
        isWaiter: user?.role === 'waiter',
        isKitchen: user?.role === 'kitchen',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
