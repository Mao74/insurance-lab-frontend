import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { resetPassword } from '../../services/authService';
import Button from '../Common/Button';
import './LoginPage.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState('');
    const { addToast } = useNotification();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            addToast('Token di reset non valido', 'error');
            navigate('/login');
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams, navigate, addToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            addToast('Le password non coincidono', 'error');
            return;
        }

        if (password.length < 8) {
            addToast('La password deve avere almeno 8 caratteri', 'error');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            addToast('Password reimpostata con successo!', 'success');
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore durante il reset della password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-brand">
                    <img
                        src="/logo-vertical.png"
                        alt="Insurance Lab AI"
                        style={{ width: '360px', marginBottom: '20px', objectFit: 'contain' }}
                    />
                </div>
                <div className="login-form-wrapper">
                    <div className="login-form card">
                        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>✅ Password Reimpostata</h2>
                        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                            La tua password è stata reimpostata con successo. Ora puoi effettuare il login con la nuova password.
                        </p>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Button style={{ width: '100%' }}>Vai al Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-brand">
                <img
                    src="/logo-vertical.png"
                    alt="Insurance Lab AI"
                    style={{ width: '360px', marginBottom: '20px', objectFit: 'contain' }}
                />
            </div>
            <div className="login-form-wrapper">
                <form onSubmit={handleSubmit} className="login-form card">
                    <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Reimposta Password</h2>
                    <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                        Inserisci la tua nuova password.
                    </p>
                    <div className="form-group">
                        <label>Nuova Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimo 8 caratteri"
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="form-group">
                        <label>Conferma Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ripeti la password"
                            required
                            minLength={8}
                        />
                    </div>
                    <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
                        Reimposta Password
                    </Button>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                            ← Torna al Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
