import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, getCurrentAdmin, logoutAdmin } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);
  const [admin,       setAdmin]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Rehydrate from storage on mount
  useEffect(() => {
    const savedUser  = getCurrentUser();
    const savedAdmin = getCurrentAdmin();
    if (savedUser)  setUser(savedUser);
    if (savedAdmin) setAdmin(savedAdmin);
    setAuthLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleAdminLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleAdminRegister = (adminData) => {
    setAdmin(adminData);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      authLoading,
      isLoggedIn:   !!user,
      isAdmin:      !!admin,
      handleLogin,
      handleRegister,
      handleLogout,
      handleAdminLogin,
      handleAdminRegister,
      handleAdminLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
