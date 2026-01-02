import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaFileUpload, FaHistory, FaCog, FaSignOutAlt, FaFolderOpen, FaHome } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <NavLink to="/home">
          {/* Caricamento logo orizzontale da public/ */}
          <img
            src="/logo-horizontal.png"
            alt="Insurance Lab"
            style={{ height: '40px', objectFit: 'contain' }}
          />
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/home" className="nav-item">
          <FaHome /> Home
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaChartPie /> Dashboard
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaFileUpload /> Nuova Analisi
        </NavLink>
        <NavLink to="/archive" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaFolderOpen /> Archivio
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaCog /> Impostazioni
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <FaSignOutAlt /> Esci
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;