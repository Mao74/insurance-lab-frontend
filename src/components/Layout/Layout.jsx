import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Get display name (email or username)
  const displayName = user?.email || user?.username || 'Utente';
  // Get first letter for avatar
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          {/* Breadcrumbs or User Info here */}
          <div className="user-profile">
            <span style={{ marginRight: '10px', fontSize: '14px' }}>{displayName}</span>
            <div style={{ width: '32px', height: '32px', background: 'var(--color-navy-secondary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {initial}
            </div>
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default Layout;