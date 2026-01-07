import React, { useState, useEffect } from 'react';
import { FaSearch, FaBuilding, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaDownload, FaArchive, FaCreditCard, FaChevronRight, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import './Prospect.css';

const ProspectPage = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'archive'
    const [mode, setMode] = useState('advanced'); // 'advanced' | 'full'
    const [piva, setPiva] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quota, setQuota] = useState(null);
    const [result, setResult] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const iframeRef = React.useRef(null);

    // Archive State
    const [archiveList, setArchiveList] = useState([]);

    useEffect(() => {
        fetchQuota();
        fetchArchive();
    }, []);

    const fetchQuota = async () => {
        try {
            const response = await api.get('/prospect/quota');
            setQuota(response.data);
        } catch (err) {
            console.error("Failed to fetch quota", err);
        }
    };

    const fetchArchive = async () => {
        try {
            const response = await api.get('/prospect/archive');
            setArchiveList(response.data);
        } catch (err) {
            console.error("Failed to fetch archive", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!piva) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.post('/prospect/analyze', { piva, mode });
            setResult(response.data);
            fetchQuota(); // Refresh quota after usage
        } catch (err) {
            setError(err.response?.data?.detail || "Errore durante la ricerca. Riprova più tardi.");
        } finally {
            setLoading(false);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // Wait for render then set designMode
        if (!isEditing) {
            setTimeout(() => {
                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
                    doc.open();
                    doc.write(result.report_html);
                    doc.close();
                    doc.designMode = "on";
                }
            }, 100);
        }
    };

    const handleSaveContent = async () => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        const newHtml = "<html>" + doc.documentElement.innerHTML + "</html>";

        try {
            await api.put(`/prospect/${result.id}/content`, { html_content: newHtml });
            setResult({ ...result, report_html: newHtml });
            setIsEditing(false);
            alert("Modifiche salvate con successo!");
        } catch (err) {
            console.error("Save error", err);
            alert("Errore durante il salvataggio");
        }
    };

    const handleBuyQuota = async () => {
        if (!window.confirm("Acquistare Prospect Pack (10 Advanced + 5 Full) per €12.50?")) return;
        try {
            await api.post('/prospect/buy-quota', { package_type: 'prospect_pack' });
            alert("Pacchetto acquistato con successo!");
            fetchQuota();
        } catch (err) {
            alert("Errore acquisto: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleArchive = async () => {
        if (!result || result.is_archived) return;

        // Prompt for name
        const customName = prompt("Inserisci un nome per salvare questa analisi:", result.company_name || "Nuova Analisi");
        if (customName === null) return; // Cancelled

        try {
            // Pass title as query param
            await api.put(`/prospect/archive/${result.id}?title=${encodeURIComponent(customName)}`);
            setResult({ ...result, is_archived: true, company_name: customName });
            fetchArchive(); // Refresh list
            alert("Analisi archiviata con successo.");
        } catch (err) {
            console.error("Archive error", err);
            alert("Errore archiviazione");
        }
    };

    // --- RENDERS ---

    const renderQuotaBox = () => {
        if (!quota) return null;
        return (
            <div className="quota-box">
                <div className="quota-header">
                    <h3>Il tuo Piano</h3>
                    <button className="buy-btn" onClick={handleBuyQuota}><FaCreditCard size={14} /> Acquista Crediti</button>
                </div>
                <div className="quota-stats">
                    <div className="quota-item">
                        <span className="quota-label">Advanced</span>
                        <div className="quota-bar-container">
                            <div className="quota-bar" style={{ width: `${(quota.advanced_used / quota.advanced_limit) * 100}%` }}></div>
                        </div>
                        <span className="quota-text">{quota.advanced_used} / {quota.advanced_limit}</span>
                    </div>
                    <div className="quota-item">
                        <span className="quota-label">Full</span>
                        <div className="quota-bar-container">
                            <div className="quota-bar" style={{ width: `${(quota.full_used / quota.full_limit) * 100}%` }}></div>
                        </div>
                        <span className="quota-text">{quota.full_used} / {quota.full_limit}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="prospect-page">
            <div className="prospect-header-main">
                <div>
                    <h1>Analisi Prospect</h1>
                    <p>Verifica i dati aziendali dei tuoi potenziali clienti prima della quotazione</p>
                </div>
                {renderQuotaBox()}
            </div>

            <div className="prospect-tabs">
                <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>Nuova Ricerca</button>
                <button className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => setActiveTab('archive')}>Archivio Prospect</button>
            </div>

            {activeTab === 'new' ? (
                <div className="new-search-container">
                    {!result ? (
                        <>
                            <div className="service-selection">
                                <div className={`service-card ${mode === 'advanced' ? 'selected' : ''}`} onClick={() => setMode('advanced')}>
                                    <div className="card-header">
                                        <h3>Advanced</h3>
                                    </div>
                                    <div className="price">10 <small>richieste/mese</small></div>
                                    <ul className="features-list">
                                        <li><FaCheckCircle size={14} /> Anagrafica e Sede</li>
                                        <li><FaCheckCircle size={14} /> Codice ATECO</li>
                                        <li><FaCheckCircle size={14} /> Fatturato (7 anni)</li>
                                        <li><FaCheckCircle size={14} /> Soci Principali</li>
                                    </ul>
                                </div>
                                <div className={`service-card ${mode === 'full' ? 'selected' : ''}`} onClick={() => setMode('full')}>
                                    <div className="card-header">
                                        <h3>Full</h3>
                                    </div>
                                    <div className="price">5 <small>richieste/mese</small></div>
                                    <ul className="features-list">
                                        <li><FaCheckCircle size={14} /> <strong>Tutto di Advanced +</strong></li>
                                        <li><FaCheckCircle size={14} /> Amministratori</li>
                                        <li><FaCheckCircle size={14} /> Bilancio Dettagliato</li>
                                        <li><FaCheckCircle size={14} /> Indici Finanziari</li>
                                        <li><FaCheckCircle size={14} /> Contatti completi</li>
                                    </ul>
                                </div>
                            </div>

                            <form onSubmit={handleSearch} className="search-form">
                                <label>Partita IVA o Codice Fiscale</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Es: 12345678901"
                                        value={piva}
                                        onChange={(e) => setPiva(e.target.value)}
                                        maxLength={16}
                                    />
                                    <button type="submit" disabled={loading || !piva}>
                                        {loading ? 'Ricerca...' : 'Cerca Azienda'}
                                    </button>
                                </div>
                                {error && <div className="error-msg"><FaExclamationTriangle size={16} /> {error}</div>}
                            </form>
                        </>
                    ) : (
                        <div className="result-view">
                            <div className="result-actions">
                                <button className="back-btn" onClick={() => setResult(null)}>← Nuova Ricerca</button>
                                <div className="action-buttons">
                                    {isEditing ? (
                                        <>
                                            <button className="action-btn secondary" onClick={() => setIsEditing(false)}>
                                                <FaTimes size={16} /> Annulla
                                            </button>
                                            <button className="action-btn success" onClick={handleSaveContent}>
                                                <FaSave size={16} /> Salva
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="action-btn" onClick={toggleEdit}>
                                                <FaEdit size={16} /> Modifica
                                            </button>
                                            {!result.is_archived && (
                                                <button className="action-btn" onClick={handleArchive}>
                                                    <FaArchive size={16} /> Archivia
                                                </button>
                                            )}
                                            <button className="action-btn primary" onClick={() => window.print()}>
                                                <FaDownload size={16} /> Esporta PDF
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="editor-container">
                                    <iframe
                                        ref={iframeRef}
                                        title="Report Editor"
                                        style={{ width: '100%', height: '800px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                </div>
                            ) : (
                                <div className="report-preview" dangerouslySetInnerHTML={{ __html: result.report_html }} />
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="archive-view">
                    <table className="archive-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Ragione Sociale</th>
                                <th>P.IVA</th>
                                <th>Tipo</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {archiveList.map(item => (
                                <tr key={item.id}>
                                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td>{item.company_name}</td>
                                    <td>{item.piva}</td>
                                    <td><span className={`badge-type ${item.service_type}`}>{item.service_type}</span></td>
                                    <td>
                                        <button className="icon-btn" onClick={() => { setResult(item); setActiveTab('new'); setIsEditing(false); }}>👁️</button>
                                    </td>
                                </tr>
                            ))}
                            {archiveList.length === 0 && <tr><td colspan="5" style={{ textAlign: 'center', padding: '20px' }}>Nessun report in archivio</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProspectPage;
