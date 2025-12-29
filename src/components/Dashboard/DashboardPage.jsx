import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFileAlt, FaClock, FaCheckCircle, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import Button from '../Common/Button';
import Loader from '../Common/Loader';
import './Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_docs: 0, completed_analyses: 0, avg_time: '0s' });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define handleDelete inside the component
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click navigation if any
    if (!window.confirm("Sei sicuro di voler eliminare questa analisi?")) return;

    try {
      await api.delete(`/analysis/${id}`);
      setRecentDocs(prev => prev.filter(doc => doc.id !== id));
      setStats(prev => ({
        ...prev,
        total_docs: Math.max(0, prev.total_docs - 1),
        completed_analyses: Math.max(0, prev.completed_analyses - 1) // Simplified estimate
      }));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Errore durante l'eliminazione");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: analyses } = await api.get('/analysis/');
        // const { data: docs } = await api.get('/documents/'); // Optional if needed separately

        // Calculate stats
        const completed = analyses.filter(a => a.status === 'completed').length;
        const totalDocs = analyses.length; // Simplified: 1 analysis = 1 doc usually

        // Format for table
        const formattedDocs = analyses.map(a => ({
          id: a.analysis_id,
          filename: a.title || `Analisi #${a.analysis_id}`, // Filename might need separate fetch or join
          date: new Date(a.created_at).toLocaleDateString(),
          status: a.status,
          type: a.policy_type
        }));

        setStats({
          total_docs: totalDocs,
          completed_analyses: completed,
          avg_time: '2m' // Hardcoded for now, or calc from timestamps
        });
        setRecentDocs(formattedDocs);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard-loader"><Loader /></div>;

  return (
    <div className="dashboard-container fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bentornato su Insurance Lab AI</p>
        </div>
        <Button onClick={() => navigate('/home')}>
          <FaPlus /> Nuova Analisi
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-wrapper navy"><FaFileAlt /></div>
          <div className="stat-info">
            <h3>{stats.total_docs}</h3>
            <p>Documenti Caricati</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper gold"><FaCheckCircle /></div>
          <div className="stat-info">
            <h3>{stats.completed_analyses}</h3>
            <p>Analisi Completate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-wrapper gray"><FaClock /></div>
          <div className="stat-info">
            <h3>{stats.avg_time}</h3>
            <p>Tempo Medio</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section card">
        <h2>Attività Recenti</h2>
        <div className="table-responsive">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Stato</th>
                <th>Azione</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.length > 0 ? recentDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.filename}</td>
                  <td>{doc.date}</td>
                  <td><span className="badge-type">{doc.type}</span></td>
                  <td>
                    <span className={`status-dot ${doc.status}`}></span>
                    {doc.status}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="text-btn" onClick={() => navigate(doc.status === 'completed' ? `/analysis/${doc.id}` : '#')}>
                        Vedi
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
                <tr><td colSpan="5" className="empty-state">Nessun documento recente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;