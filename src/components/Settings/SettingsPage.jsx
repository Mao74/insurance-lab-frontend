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

    // LLM Settings state (admin only)
    const [llmSettings, setLlmSettings] = useState({
        llm_model_name: 'gemini-2.5-flash-preview-05-20',
        input_cost_per_million: '0.50',
        output_cost_per_million: '3.00'
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // Subscription state (non-admin users)
    const [subscription, setSubscription] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(false);

    // Fetch users and settings if admin, subscription for all
    useEffect(() => {
        fetchSubscription();
        if (isAdmin) {
            fetchUsers();
            fetchSettings();
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

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            setLlmSettings(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const { data } = await api.put('/admin/settings', llmSettings);
            setLlmSettings(data);
            addToast('Impostazioni salvate!', 'success');
        } catch (err) {
            addToast(err.response?.data?.detail || 'Errore nel salvataggio', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchSubscription = async () => {
        setLoadingSubscription(true);
        try {
            const { data } = await api.get('/stripe/subscription-status');
            setSubscription(data);
        } catch (err) {
            console.error('Error fetching subscription:', err);
        } finally {
            setLoadingSubscription(false);
        }
    };

    const handleSubscribe = async (priceType) => {
        try {
            const { data } = await api.post('/stripe/create-checkout', { price_type: priceType });
            if (data.success && data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                addToast(data.error || 'Errore durante il checkout', 'error');
            }
        } catch (err) {
            addToast('Errore durante il checkout', 'error');
        }
    };

    const handleManageSubscription = async () => {
        try {
            const { data } = await api.post('/stripe/customer-portal');
            if (data.success && data.portal_url) {
                window.location.href = data.portal_url;
            } else {
                addToast(data.error || 'Errore apertura portale', 'error');
            }
        } catch (err) {
            addToast('Errore apertura portale', 'error');
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

    // Calculate cost based on configurable pricing
    const calculateCost = (inputTokens, outputTokens) => {
        const inputCost = ((inputTokens || 0) / 1000000) * parseFloat(llmSettings.input_cost_per_million || 0.50);
        const outputCost = ((outputTokens || 0) / 1000000) * parseFloat(llmSettings.output_cost_per_million || 3.00);
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

            {/* Subscription Section (for non-admin or all users) */}
            {!isAdmin && (
                <div className="settings-section">
                    <h2>💳 Abbonamento</h2>
                    <div className="settings-card">
                        {loadingSubscription ? (
                            <p>Caricamento...</p>
                        ) : subscription?.has_subscription && subscription?.status === 'active' ? (
                            <>
                                <div className="settings-row">
                                    <div className="settings-label">Piano attivo</div>
                                    <div className="settings-value">
                                        <span className="badge badge-success">Attivo</span>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <div className="settings-label">Scadenza</div>
                                    <div className="settings-value">
                                        {subscription.expires_at
                                            ? new Date(subscription.expires_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'N/A'
                                        }
                                    </div>
                                </div>
                                <button
                                    className="settings-btn secondary"
                                    onClick={handleManageSubscription}
                                    style={{ marginTop: '16px' }}
                                >
                                    Gestisci Abbonamento
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ marginBottom: '16px', color: '#666' }}>
                                    Scegli il piano più adatto alle tue esigenze:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <h3 style={{ margin: '0 0 8px 0' }}>Mensile</h3>
                                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>€49<span style={{ fontSize: '14px', fontWeight: 'normal' }}>/mese</span></p>
                                        <button
                                            className="settings-btn primary"
                                            onClick={() => handleSubscribe('monthly')}
                                            style={{ width: '100%' }}
                                        >
                                            Abbonati
                                        </button>
                                    </div>
                                    <div style={{
                                        border: '2px solid var(--color-gradient-end)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)'
                                    }}>
                                        <h3 style={{ margin: '0 0 8px 0' }}>Annuale <span style={{ fontWeight: 'normal', color: '#333', fontSize: '14px' }}>(Risparmia 20%)</span></h3>
                                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>€470<span style={{ fontSize: '14px', fontWeight: 'normal' }}>/anno</span></p>
                                        <button
                                            className="settings-btn primary"
                                            onClick={() => handleSubscribe('annual')}
                                            style={{ width: '100%' }}
                                        >
                                            Abbonati
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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

            {/* Admin LLM Configuration */}
            {isAdmin && (
                <div className="settings-section">
                    <h2>🤖 Configurazione LLM</h2>
                    <div className="settings-card">
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>Modello LLM</label>
                                <input
                                    type="text"
                                    value={llmSettings.llm_model_name}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, llm_model_name: e.target.value })}
                                    placeholder="es. gemini-2.5-flash-preview-05-20"
                                />
                            </div>
                            <div className="form-group">
                                <label>Costo Input ($/milione)</label>
                                <input
                                    type="text"
                                    value={llmSettings.input_cost_per_million}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, input_cost_per_million: e.target.value })}
                                    placeholder="0.50"
                                />
                            </div>
                            <div className="form-group">
                                <label>Costo Output ($/milione)</label>
                                <input
                                    type="text"
                                    value={llmSettings.output_cost_per_million}
                                    onChange={(e) => setLlmSettings({ ...llmSettings, output_cost_per_million: e.target.value })}
                                    placeholder="3.00"
                                />
                            </div>
                        </div>
                        <button
                            className="settings-btn primary"
                            onClick={handleSaveSettings}
                            disabled={savingSettings}
                        >
                            {savingSettings ? 'Salvataggio...' : '💾 Salva Configurazione'}
                        </button>
                    </div>
                </div>
            )}

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
                                                    onClick={() => {
                                                        const newExpiry = prompt('Nuova scadenza (YYYY-MM-DD):', u.access_expires_at ? u.access_expires_at.split('T')[0] : '');
                                                        if (newExpiry) {
                                                            handleUpdateUser(u.id, { access_expires_at: newExpiry });
                                                        }
                                                    }}
                                                    title="Modifica scadenza"
                                                >
                                                    📅
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={() => handleUpdateUser(u.id, { is_active: !u.is_active })}
                                                    title={u.is_active ? 'Disattiva' : 'Attiva'}
                                                >
                                                    {u.is_active ? '🚫' : '✅'}
                                                </button>
                                                {u.email !== user?.email && (
                                                    <button
                                                        className="icon-btn danger"
                                                        onClick={() => handleDeleteUser(u.id, u.email)}
                                                        title="Elimina"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
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
