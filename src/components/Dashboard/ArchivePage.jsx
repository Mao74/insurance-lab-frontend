import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaFileAlt, FaSearch, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import Button from '../Common/Button';
import Loader from '../Common/Loader';
import '../Dashboard/Dashboard.css'; // Reuse dashboard styles

const ArchivePage = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                const { data } = await api.get('/analysis/?saved_only=true');

                const formatted = data.map(a => ({
                    id: a.analysis_id,
                    filename: a.title || `Analisi #${a.analysis_id}`,
                    date: new Date(a.created_at).toLocaleDateString(),
                    status: a.status,
                    type: a.policy_type
                }));

                setDocs(formatted);
                setLoading(false);
            } catch (err) {
                console.error("Archive error:", err);
                setLoading(false);
            }
        };

        fetchArchive();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Sei sicuro di voler eliminare definitivamente questo report dall'archivio?")) return;

        try {
            await api.delete(`/analysis/${id}`);
            setDocs(prev => prev.filter(doc => doc.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Errore durante l'eliminazione");
        }
    };

    const filteredDocs = docs.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="dashboard-loader"><Loader /></div>;

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <div>
                    <h1>Archivio Report</h1>
                    <p>Consulta e gestisci i report salvati.</p>
                </div>
            </div>

            <div className="recent-section card" style={{ minHeight: '400px' }}>
                <div className="status-header" style={{ padding: '0 0 20px 0', border: 'none', boxShadow: 'none' }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                        <FaSearch color="#666" />
                        <input
                            type="text"
                            placeholder="Cerca nell'archivio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%' }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>Nome Report</th>
                                <th>Data Creazione</th>
                                <th>Tipo Polizza</th>
                                <th>Stato</th>
                                <th>Azione</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                                <tr key={doc.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaFileAlt color="#B4963C" />
                                            <strong>{doc.filename}</strong>
                                        </div>
                                    </td>
                                    <td>{doc.date}</td>
                                    <td><span className="badge-type">{doc.type}</span></td>
                                    <td>
                                        <span className={`status-dot ${doc.status}`}></span>
                                        {doc.status}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button className="text-btn" onClick={() => navigate(`/analysis/${doc.id}`)}>
                                                Apri
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => handleDelete(doc.id, e)}
                                                title="Elimina"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <FaTrash color="#ef4444" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="empty-state">Nessun report trovato nell'archivio.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;
