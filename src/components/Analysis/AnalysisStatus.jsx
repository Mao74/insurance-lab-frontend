import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaSave, FaCheck, FaTimes, FaExchangeAlt, FaDownload, FaFolderOpen, FaLightbulb } from 'react-icons/fa';
import api from '../../services/api';
import Button from '../Common/Button';
import Loader from '../Common/Loader';
import CorrectionChat from './CorrectionChat';
import { useNotification } from '../../context/NotificationContext';
import './AnalysisStatus.css';

const AnalysisStatus = () => {
  const { analysisId } = useParams();
  const [status, setStatus] = useState({
    status: 'processing',
    report_html: null,
    report_html_masked: null,
    policy_type: '',
    analysis_level: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('display'); // 'display' (Chiaro) | 'masked' (Mascherato)
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const iframeRef = useRef(null);

  const { addToast } = useNotification();

  // Polling status
  useEffect(() => {
    let interval;
    const fetchStatus = async () => {
      try {
        const { data } = await api.get(`/analysis/${analysisId}`);
        console.log('Analysis API Response:', data); // DEBUG
        setStatus(data);

        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
          if (data.status === 'completed' && status.status !== 'completed') {
            addToast('Analisi completata!', 'success');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, [analysisId, addToast, status.status]);



  const handleDownloadClear = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/analysis/${analysisId}/download-html?type=clear`, '_blank');
  };

  const handleDownloadMasked = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/analysis/${analysisId}/download-html?type=masked`, '_blank');
  };

  const toggleViewMode = () => {
    if (isEditing) {
      addToast("Termina la modifica prima di cambiare vista.", "warning");
      return;
    }
    setViewMode(prev => prev === 'display' ? 'masked' : 'display');
  };

  const handleEdit = () => {
    const content = viewMode === 'masked' ? status.report_html_masked : status.report_html;
    if (!content) {
      addToast("Nessun contenuto da modificare", "warning");
      return;
    }
    setIsEditing(true);
  };

  // Toggle designMode on the iframe when isEditing changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument) {
      iframe.contentDocument.designMode = isEditing ? 'on' : 'off';

      // Visual feedback inside iframe (optional)
      if (isEditing) {
        iframe.contentDocument.body.style.border = "4px solid #b4963c";
      } else {
        iframe.contentDocument.body.style.border = "none";
      }
    }
  }, [isEditing]);

  const handleSaveContent = async () => {
    setLoadingAction(true);
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) {
        throw new Error("Editor non pronto");
      }

      // Extract full HTML including head/styles
      const newContent = iframe.contentDocument.documentElement.outerHTML;

      await api.post(`/analysis/${analysisId}/content`, {
        html_content: newContent
      });

      setStatus(prev => ({
        ...prev,
        report_html: newContent
      }));

      setIsEditing(false);
      addToast('Modifiche salvate con successo', 'success');
    } catch (err) {
      console.error(err);
      addToast('Errore durante il salvataggio', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleArchive = async () => {
    const name = prompt("Inserisci un nome per salvare/archiviare questo report:", `Analisi #${analysisId}`);
    if (!name) return;

    setLoadingAction(true);
    try {
      await api.post(`/analysis/${analysisId}/save`, { title: name });
      addToast('Report archiviato con successo', 'success');
    } catch (err) {
      addToast('Errore durante l\'archiviazione', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const currentHtml = viewMode === 'masked' ? status.report_html_masked : status.report_html;

  return (
    <div className="analysis-page fade-in">
      <div className="status-header card">
        <div className="header-info">
          <h2>Analisi #{analysisId}</h2>
          <p className="meta-text">Polizza: {status.policy_type} | Livello: {status.analysis_level}</p>
        </div>
        <div className="header-actions">
          <div className={`status-badge ${status.status}`}>
            {status.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="analysis-content">
        {status.status === 'processing' && (
          <div className="processing-state">
            <Loader size="large" />
            <h3>Generazione report con AI in corso...</h3>
            <p>Richiede solitamente 30-60 secondi in base alla dimensione del documento.</p>
          </div>
        )}

        {status.status === 'error' && (
          <div className="error-state">
            <h3>Analisi Fallita</h3>
            <p>{status.error || "Si è verificato un errore imprevisto."}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>Riprova</Button>
          </div>
        )}

        {status.status === 'completed' && (
          <div className="report-workspace">
            {/* Toolbar */}
            <div className="report-toolbar card">
              <div className="toolbar-group">
                <Button onClick={toggleViewMode} title="Cambia Vista" disabled={isEditing}>
                  <FaExchangeAlt /> {viewMode === 'display' ? 'Vedi Mascherato' : 'Vedi Chiaro'}
                </Button>
                {!isEditing && (
                  <>
                    <Button onClick={handleEdit}>
                      <FaEdit /> Modifica Testo
                    </Button>
                    <Button onClick={() => setShowCorrection(true)} title="Segnala errore">
                      <FaLightbulb /> Suggerisci Correzione
                    </Button>
                  </>
                )}
              </div>

              <div className="toolbar-group">
                {isEditing ? (
                  <>
                    <span className="editor-hint" style={{ marginRight: '10px', fontSize: '13px', color: '#b4963c' }}>
                      Modalità Modifica Attiva
                    </span>
                    <Button variant="success" onClick={handleSaveContent} isLoading={loadingAction}>
                      <FaSave /> Salva
                    </Button>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                      <FaTimes /> Annulla
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleArchive} title="Salva nei report">
                      <FaFolderOpen /> Archivia
                    </Button>
                    <Button onClick={handleDownloadClear} title="Scarica HTML Chiaro">
                      <FaDownload /> HTML Chiaro
                    </Button>
                    <Button onClick={handleDownloadMasked} title="Scarica HTML Mascherato" variant="secondary">
                      <FaDownload /> HTML Mascherato
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Viewer / Editor (Unified) */}
            <div className="report-container card">
              {currentHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={currentHtml}
                  title="Report"
                  className="report-iframe"
                  onLoad={(e) => {
                    // Re-apply designMode if reloaded while editing
                    if (isEditing && e.target.contentDocument) {
                      e.target.contentDocument.designMode = 'on';
                      e.target.contentDocument.body.style.border = "4px solid #b4963c";
                    }
                  }}
                />
              ) : (
                <div className="empty-state-message" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <p>Contenuto non disponibile per questa vista.</p>
                  {viewMode === 'masked' && <p>Il report mascherato potrebbe non essere stato generato.</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Correction Chat */}
      {showCorrection && (
        <CorrectionChat
          analysisId={analysisId}
          onClose={() => setShowCorrection(false)}
          onCorrectionApplied={(updatedHtml) => {
            setStatus(prev => ({
              ...prev,
              report_html: updatedHtml
            }));
            addToast('Report aggiornato con le correzioni!', 'success');
          }}
        />
      )}
    </div>
  );
};

export default AnalysisStatus;