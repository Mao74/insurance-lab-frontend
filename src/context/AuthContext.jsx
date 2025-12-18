import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuth, login as apiLogin, logout as apiLogout } from '../services/authService';
import Loader from '../components/Common/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
        setAuthError(null);
      } catch (err) {
        setUser(null);
        // Check for subscription expired error
        if (err.response?.status === 403) {
          setAuthError(err.response?.data?.detail || "Accesso negato");
        }
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (creds) => {
    try {
      const data = await apiLogin(creds);
      const userData = {
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        is_admin: data.is_admin
      };
      setUser(userData);
      setAuthError(null);
      return data;
    } catch (err) {
      // Handle subscription expired or disabled account
      if (err.response?.status === 403) {
        setAuthError(err.response?.data?.detail || "Accesso negato");
      }
      throw err;
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setAuthError(null);
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin || false,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);