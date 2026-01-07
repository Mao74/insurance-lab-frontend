import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartPie,
  FaFileAlt,
  FaBalanceScale,
  FaCarCrash,
  FaChartLine,
  FaFileContract,
  FaUserTie,
  FaFolderOpen,
  FaCog,
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ justifyContent: 'center' }}>
        <NavLink to="/home">
          <img
            src="/logo-horizontal.png"
            alt="Insurance Lab"
            style={{ height: '40px', objectFit: 'contain' }}
          />
        </NavLink>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaHome /> Home
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaChartPie /> Dashboard
        </NavLink>
        <div className="nav-divider" style={{ margin: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
        <NavLink to="/upload" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaFileAlt /> Genera Report
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaBalanceScale /> Confronta
        </NavLink>
        <NavLink to="/claims" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaCarCrash /> Sinistri
        </NavLink>
        <NavLink to="/prospect" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaUserTie /> Analisi Prospect
        </NavLink>
        <NavLink to="/economic-analysis" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaChartLine /> Economica
        </NavLink>
        <NavLink to="/tender" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaFileContract /> Analisi Capitolati
        </NavLink>
        <div className="nav-divider" style={{ margin: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
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