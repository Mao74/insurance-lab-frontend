import React from 'react';
import './Settings.css';

const SettingsPage = () => {
    return (
        <div className="settings-page">
            <h1>Impostazioni</h1>
            <p className="settings-subtitle">Gestisci il tuo account e le preferenze</p>

            {/* Profilo Utente */}
            <div className="settings-section">
                <h2>👤 Profilo Utente</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-label">Nome</div>
                        <div className="settings-value">Maurizio Rossi</div>
                        <button className="settings-btn secondary">Modifica</button>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Email</div>
                        <div className="settings-value">maurizio@insurance-lab.ai</div>
                        <button className="settings-btn secondary">Modifica</button>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Ruolo</div>
                        <div className="settings-value">
                            <span className="badge badge-primary">Amministratore</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sicurezza */}
            <div className="settings-section">
                <h2>🔒 Sicurezza</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-label">Password</div>
                        <div className="settings-value">••••••••••••</div>
                        <button className="settings-btn primary">Cambia Password</button>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Autenticazione a 2 fattori</div>
                        <div className="settings-value">
                            <span className="badge badge-warning">Non attiva</span>
                        </div>
                        <button className="settings-btn secondary">Attiva 2FA</button>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Ultima attività</div>
                        <div className="settings-value">Oggi, 16:25</div>
                    </div>
                </div>
            </div>

            {/* Abbonamento */}
            <div className="settings-section">
                <h2>💳 Abbonamento</h2>
                <div className="settings-card subscription-card">
                    <div className="subscription-header">
                        <div className="subscription-plan">
                            <span className="plan-name">Piano Professional</span>
                            <span className="badge badge-success">Attivo</span>
                        </div>
                        <div className="subscription-price">€ 99/mese</div>
                    </div>
                    <div className="subscription-details">
                        <div className="detail-item">
                            <span className="detail-label">Prossimo rinnovo</span>
                            <span className="detail-value">15 Gennaio 2025</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Metodo di pagamento</span>
                            <span className="detail-value">Visa •••• 4242</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Analisi rimanenti</span>
                            <span className="detail-value">47 / 100</span>
                        </div>
                    </div>
                    <div className="subscription-actions">
                        <button className="settings-btn secondary">Gestisci Abbonamento</button>
                        <button className="settings-btn outline">Scarica Fatture</button>
                    </div>
                </div>
            </div>

            {/* Preferenze */}
            <div className="settings-section">
                <h2>⚙️ Preferenze</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-label">Lingua</div>
                        <div className="settings-value">
                            <select className="settings-select" defaultValue="it">
                                <option value="it">🇮🇹 Italiano</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Notifiche Email</div>
                        <div className="settings-value">
                            <label className="toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div className="settings-label">Modello AI predefinito</div>
                        <div className="settings-value">
                            <select className="settings-select" defaultValue="gemini-2.5-flash">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                <option value="gpt-4o">GPT-4o</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zona Pericolo */}
            <div className="settings-section danger-zone">
                <h2>⚠️ Zona Pericolo</h2>
                <div className="settings-card">
                    <div className="settings-row">
                        <div>
                            <div className="settings-label">Elimina Account</div>
                            <div className="settings-description">
                                Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati.
                            </div>
                        </div>
                        <button className="settings-btn danger">Elimina Account</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
