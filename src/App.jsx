import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './components/Auth/LoginPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import ArchivePage from './components/Dashboard/ArchivePage';
import UploadPage from './components/Upload/UploadPage';
import MaskingPage from './components/Masking/MaskingPage';
import AnalysisStatus from './components/Analysis/AnalysisStatus';
import ClaimsPage from './components/Claims/ClaimsPage';
import HomePage from './components/Home/HomePage';
import SettingsPage from './components/Settings/SettingsPage';
import ComparePage from './components/Compare/ComparePage';
import Layout from './components/Layout/Layout';
import { useAuth } from './context/AuthContext';

// Simple wrapper to protect routes without the full sidebar layout
const LayoutWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route path="/home" element={
              <LayoutWrapper>
                <HomePage />
              </LayoutWrapper>
            } />

            {/* Main App Routes (with Sidebar) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="archive" element={<ArchivePage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="claims" element={<ClaimsPage />} />
              <Route path="masking" element={<MaskingPage />} />
              <Route path="analysis/:analysisId" element={<AnalysisStatus />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="compare" element={<ComparePage />} />
            </Route>

            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;