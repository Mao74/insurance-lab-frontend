import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { forgotPassword } from '../../services/authService';
import Button from '../Common/Button';
import './LoginPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { addToast } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
            addToast('Controlla la tua email per le istruzioni di reset', 'success');
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore durante la richiesta', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
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
                        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>📧 Email Inviata</h2>
                        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                            Se l'indirizzo email è registrato nel sistema, riceverai un link per reimpostare la password.
                        </p>
                        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Controlla anche la cartella spam se non vedi l'email.
                        </p>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Button style={{ width: '100%' }}>Torna al Login</Button>
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
                    <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Password Dimenticata</h2>
                    <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                        Inserisci il tuo indirizzo email e ti invieremo le istruzioni per reimpostare la password.
                    </p>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@esempio.com"
                            required
                        />
                    </div>
                    <Button type="submit" isLoading={loading} style={{ width: '100%' }}>
                        Invia Istruzioni
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

export default ForgotPasswordPage;
