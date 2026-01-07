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
    report_html_display: null, // Add this to track display content
    policy_type: '',
    analysis_level: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('display'); // 'display' (Chiaro) | 'masked' (Mascherato)
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const iframeRef = useRef(null);

  const { addToast } = useNotification();

  // Polling status - stops when completed to prevent overwriting user edits
  const pollingActiveRef = useRef(true);

  useEffect(() => {
    let interval;

    // Don't start polling if already completed or in error state
    if (status.status === 'completed' || status.status === 'error') {
      pollingActiveRef.current = false;
      return;
    }

    pollingActiveRef.current = true;

    const fetchStatus = async () => {
      // Double-check we should still be polling
      if (!pollingActiveRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        // Determine endpoint based on current analysis_level
        // First call uses /analysis, then we switch based on the response
        const isCompare = status.analysis_level === 'confronto';
        // Add timestamp to prevent caching
        const endpoint = isCompare
          ? `/compare/${analysisId}?_t=${Date.now()}`
          : `/analysis/${analysisId}?_t=${Date.now()}`;

        const { data } = await api.get(endpoint);
        console.log('Analysis API Response:', data); // DEBUG
        // Populate report_html from display if available (for Compare)
        if (data.report_html_display && !data.report_html) {
          data.report_html = data.report_html_display;
        }
        setStatus(data);

        // Initial load for IFrame not in edit mode
        if (iframeRef.current && !isEditing) {
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
          const content = viewMode === 'masked' ? data.report_html_masked : (data.report_html_display || data.report_html);
          if (content) {
            doc.open();
            doc.write(content);
            doc.close();
          }
        }

        if (data.status === 'completed' || data.status === 'error') {
          pollingActiveRef.current = false;
          clearInterval(interval);
          if (data.status === 'completed' && status.status !== 'completed') {
            addToast('Analisi completata!', 'success');
          }
        }
      } catch (err) {
        console.error(err);
        // If /compare fails, fallback to /analysis (for backwards compatibility)
        if (err.response?.status === 400 || err.response?.status === 404) {
          try {
            const { data } = await api.get(`/analysis/${analysisId}`);
            setStatus(data);
            // Also check for completion in fallback
            if (data.status === 'completed' || data.status === 'error') {
              pollingActiveRef.current = false;
              clearInterval(interval);
            }
          } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
          }
        }
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => {
      pollingActiveRef.current = false;
      clearInterval(interval);
    };
  }, [analysisId, addToast]);

  // Load iframe content when status changes and report is ready
  useEffect(() => {
    if (status.status === 'completed' && iframeRef.current && !isEditing) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const content = viewMode === 'masked'
        ? status.report_html_masked
        : (status.report_html_display || status.report_html);

      if (content) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [status.status, status.report_html, status.report_html_masked, status.report_html_display, viewMode, isEditing]);

  const handleDownloadClear = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/analysis/${analysisId}/download-html?type=clear`, '_blank');
  };

  const handleDownloadMasked = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    window.open(`${baseUrl}/analysis/${analysisId}/download-html?type=masked`, '_blank');
  };

  const handleDownloadPdfClear = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const link = document.createElement('a');
    link.href = `${baseUrl}/analysis/${analysisId}/pdf?type=clear`;
    link.download = `report_${analysisId}_chiaro.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdfMasked = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const link = document.createElement('a');
    link.href = `${baseUrl}/analysis/${analysisId}/pdf?type=masked`;
    link.download = `report_${analysisId}_mascherato.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle View Mode (Chiaro/Mascherato)
  const toggleViewMode = () => {
    const newMode = viewMode === 'display' ? 'masked' : 'display';
    setViewMode(newMode);

    // Update iframe content when not in edit mode
    if (!isEditing && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const content = newMode === 'masked' ? status.report_html_masked : (status.report_html_display || status.report_html);
      if (content) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  };

  // Toggle Edit Mode - improved pattern from ProspectPage
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Logic handled in useEffect or separate trigger, but key is how we load content
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Delay to allow render, then inject content for editing
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const content = viewMode === 'masked' ? status.report_html_masked : status.report_html;
        doc.open();
        doc.write(content);
        doc.close();
        doc.designMode = "on";
        doc.body.style.border = "4px solid #b4963c";
      }
    }, 100);
  };

  // Revert to view mode
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveContent = async () => {
    setLoadingAction(true);
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) {
        throw new Error("Editor non pronto");
      }

      // Extract full HTML including head/styles
      const newContent = iframe.contentDocument.documentElement.outerHTML;

      // Use correct endpoint based on analysis type
      const isCompare = status.analysis_level === 'confronto';
      const endpoint = isCompare ? `/compare/${analysisId}/content` : `/analysis/${analysisId}/content`;

      await api.post(endpoint, {
        html_content: newContent
      });

      setStatus(prev => ({
        ...prev,
        report_html_display: newContent,  // Update display field (what backend saves)
        report_html: newContent  // Keep both in sync
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
      // Use correct endpoint based on analysis type
      const isCompare = status.analysis_level === 'confronto';
      const endpoint = isCompare ? `/compare/${analysisId}/save` : `/analysis/${analysisId}/save`;

      await api.post(endpoint, { title: name });
      addToast('Report archiviato con successo', 'success');
    } catch (err) {
      console.error(err);
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
            <p>Richiede solitamente da 1 a 20 minuti in base alla dimensione del documento.</p>
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
                    <Button onClick={handleArchive} title="Salva nei report">
                      <FaFolderOpen /> Archivia
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>HTML:</span>
                      <Button onClick={handleDownloadClear} title="Scarica HTML Chiaro" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <FaDownload /> Chiaro
                      </Button>
                      <Button onClick={handleDownloadMasked} title="Scarica HTML Mascherato" variant="secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <FaDownload /> Mascherato
                      </Button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666', marginRight: '5px' }}>PDF:</span>
                      <Button onClick={handleDownloadPdfClear} title="Scarica PDF Chiaro" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <FaDownload /> Chiaro
                      </Button>
                      <Button onClick={handleDownloadPdfMasked} title="Scarica PDF Mascherato" variant="secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <FaDownload /> Mascherato
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Viewer / Editor (Unified) */}
            <div className="report-container card">
              {currentHtml ? (
                <iframe
                  ref={iframeRef}
                  // Remove srcDoc to manually manage content for editing stability
                  title="Report"
                  className="report-iframe"
                  style={{ width: '100%', height: '800px', border: 'none' }}
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