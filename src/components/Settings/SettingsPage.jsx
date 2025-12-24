import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import './Settings.css';

const SettingsPage = () => {
    const { user, isAdmin } = useAuth();
    const { addToast } = useNotification();

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Admin user management state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        is_admin: false,
        access_expires_at: ''
    });
    const [editingUser, setEditingUser] = useState(null);

    // Fetch users if admin
    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.users || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            addToast('Errore nel caricamento utenti', 'error');
        } finally {
            setLoadingUsers(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            addToast('Le password non coincidono', 'error');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            addToast('La password deve avere almeno 8 caratteri', 'error');
            return;
        }

        setChangingPassword(true);
        try {
            await api.post('/auth/change-password', {
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword
            });
            addToast('Password aggiornata con successo!', 'success');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore nel cambio password', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', {
                email: newUser.email,
                password: newUser.password,
                is_admin: newUser.is_admin,
                access_expires_at: newUser.access_expires_at || null
            });
            addToast('Utente creato con successo!', 'success');
            setNewUser({ email: '', password: '', is_admin: false, access_expires_at: '' });
            setShowAddUser(false);
            fetchUsers();
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore nella creazione utente', 'error');
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            await api.put(`/admin/users/${userId}`, updates);
            addToast('Utente aggiornato!', 'success');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore nell\'aggiornamento', 'error');
        }
    };

    const handleDeleteUser = async (userId, email) => {
        if (!window.confirm(`Sei sicuro di voler eliminare ${email}?`)) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            addToast('Utente eliminato', 'success');
            fetchUsers();
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore nell\'eliminazione', 'error');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Mai';
        const d = new Date(dateStr);
        return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTokens = (tokens) => {
        if (!tokens) return '0';
        if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M';
        if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K';
        return tokens.toString();
    };

    // Calculate cost based on Gemini 3 Flash pricing
    // Input: $0.50/M tokens, Output: $3.00/M tokens
    const calculateCost = (inputTokens, outputTokens) => {
        const inputCost = ((inputTokens || 0) / 1000000) * 0.50;
        const outputCost = ((outputTokens || 0) / 1000000) * 3.00;
        const totalCost = inputCost + outputCost;

        if (totalCost === 0) return '$0.00';
        if (totalCost < 0.01) return '<$0.01';
        return '$' + totalCost.toFixed(2);
    };

    return (
        <div className="settings-page">
            <h1>Impostazioni</h1>
            <p className="settings-subtitle">Gestisci il tuo account e le preferenze</p>

            {/* Profilo Utente */}
            <div className="settings-section">
                <h2>👤 Profilo Utente</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-label">Email</div>
                        <div className="settings-value">{user?.email || 'N/A'}</div>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Ruolo</div>
                        <div className="settings-value">
                            <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-secondary'}`}>
                                {isAdmin ? 'Amministratore' : 'Utente'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cambio Password */}
            <div className="settings-section">
                <h2>🔒 Cambia Password</h2>
                <div className="settings-card">
                    <form onSubmit={handlePasswordChange} className="password-form">
                        <div className="form-group">
                            <label>Password attuale</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nuova password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Conferma nuova password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="settings-btn primary"
                            disabled={changingPassword}
                        >
                            {changingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Admin User Management */}
            {isAdmin && (
                <div className="settings-section">
                    <h2>👥 Gestione Utenti</h2>
                    <div className="settings-card">
                        <div className="admin-header">
                            <span>{users.length} utenti registrati</span>
                            <button
                                className="settings-btn primary"
                                onClick={() => setShowAddUser(!showAddUser)}
                            >
                                {showAddUser ? 'Annulla' : '+ Aggiungi Utente'}
                            </button>
                        </div>

                        {/* Add User Form */}
                        {showAddUser && (
                            <form onSubmit={handleAddUser} className="add-user-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            minLength={8}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Scadenza accesso</label>
                                        <input
                                            type="date"
                                            value={newUser.access_expires_at}
                                            onChange={(e) => setNewUser({ ...newUser, access_expires_at: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newUser.is_admin}
                                                onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                                            />
                                            Amministratore
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="settings-btn success">Crea Utente</button>
                            </form>
                        )}

                        {/* Users Table */}
                        {loadingUsers ? (
                            <p>Caricamento...</p>
                        ) : (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Ruolo</th>
                                        <th>Stato</th>
                                        <th>Scadenza</th>
                                        <th>Token Usati</th>
                                        <th>Costo Stimato</th>
                                        <th>Ultimo Accesso</th>
                                        <th>Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`badge ${u.is_admin ? 'badge-primary' : 'badge-secondary'}`}>
                                                    {u.is_admin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                    {u.is_active ? 'Attivo' : 'Disattivato'}
                                                </span>
                                            </td>
                                            <td>{formatDate(u.access_expires_at)}</td>
                                            <td title={`Input: ${formatTokens(u.total_input_tokens)} | Output: ${formatTokens(u.total_output_tokens)}`}>
                                                {formatTokens(u.total_tokens_used)}
                                            </td>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--success)' }}>
                                                {calculateCost(u.total_input_tokens, u.total_output_tokens)}
                                            </td>
                                            <td>{formatDate(u.last_login)}</td>
                                            <td className="actions">
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                                    title={u.is_active ? 'Disattiva' : 'Attiva'}
                                                >
                                                    {u.is_active ? '🚫' : '✅'}
                                                </button>
                                                <button
                                                    className="icon-btn danger"
                                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                                    title="Elimina"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
