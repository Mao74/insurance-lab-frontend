import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../Common/Button';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      addToast('Welcome back!', 'success');
      navigate('/home');
    } catch (err) {
      addToast('Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        {/* Immagine logo verticale centrata */}
        <img
          src="/logo-vertical.png"
          alt="Insurance Lab AI"
          style={{ width: '360px', marginBottom: '20px', objectFit: 'contain' }}
        />
      </div>
      <div className="login-form-wrapper">
        <form onSubmit={handleSubmit} className="login-form card">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Sign In</h2>
          <div className="form-group">
            <label>Username / Email</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;