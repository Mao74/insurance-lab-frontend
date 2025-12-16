import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuth, login as apiLogin, logout as apiLogout } from '../services/authService';
import Loader from '../components/Common/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (creds) => {
    const data = await apiLogin(creds);
    setUser(data.user || data); // Adjust based on API response
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  if (loading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Loader /></div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);