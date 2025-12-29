import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MaskingForm from './MaskingForm';
import TextPreview from './TextPreview';
import { useNotification } from '../../context/NotificationContext';
import './Masking.css';

const MaskingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  // State
  const [documents, setDocuments] = useState([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [maskingData, setMaskingData] = useState({
    policyNumber: '', contractor: '', vat: '', fiscalCode: '', insured: '',
    address: '', city: '', cap: '', other: ''
  });
  const [options, setOptions] = useState({
    policyType: 'rc_generale',
    analysisLevel: 'cliente',
    model: 'gemini-3-flash-preview'
  });

  // Load docs from previous step (Upload)
  const [loading, setLoading] = useState(true);

  // Load docs from previous step (Upload)
  useEffect(() => {
    let mounted = true;

    const fetchDocuments = async () => {
      // Only fetch if we have IDs and haven't loaded yet
      if (location.state?.document_ids) {
        try {
          const ids = location.state.document_ids;
          const docs = [];

          for (const id of ids) {
            if (!mounted) break;

            let retries = 0;
            let docData = null;

            // Poll for text availability (max 40 seconds)
            while (retries < 20 && mounted) {
              try {
                const { data } = await api.get(`/documents/${id}/text`);
                docData = data;
                break; // Success
              } catch (e) {
                if (e.response && e.response.status === 404) {
                  // Text not ready yet, wait and retry
                  await new Promise(r => setTimeout(r, 2000));
                  retries++;
                } else {
                  // Ignore other errors for retry logic or throw? 
                  // Let's retry on network errors too just in case
                  await new Promise(r => setTimeout(r, 2000));
                  retries++;
                }
              }
            }

            if (docData) {
              docs.push({
                id: docData.id,
                filename: docData.filename,
                text_preview: docData.text,
                token_count: docData.token_count
              });
            } else {
              addToast(`Timeout waiting for OCR on document ${id}`, 'warning');
            }
          }

          if (mounted) {
            if (docs.length > 0) {
              setDocuments(docs);
            } else {
              // Only redirect if absolutely no docs loaded after retry
              // navigate('/upload');
              addToast("No documents could be loaded.", "error");
            }
            setLoading(false);
          }

        } catch (err) {
          console.error("Fetch docs error", err);
          if (mounted) {
            addToast('Error loading documents', 'error');
            setLoading(false);
          }
        }
      } else if (location.state?.documents) {
        if (mounted) {
          setDocuments(location.state.documents);
          setLoading(false);
        }
      } else {
        // No state passed, likely direct access
        if (mounted) {
          setLoading(false);
          navigate('/upload');
        }
      }
    };

    fetchDocuments();

    return () => { mounted = false; };
  }, [location.state, navigate, addToast]); // Removed 'loading' from deps

  // Read policyType and analysisLevel from navigation state (from ClaimsPage or similar)
  useEffect(() => {
    if (location.state?.policyType) {
      setOptions(prev => ({ ...prev, policyType: location.state.policyType }));
    }
    if (location.state?.analysisLevel) {
      setOptions(prev => ({ ...prev, analysisLevel: location.state.analysisLevel }));
    }
  }, [location.state]);

  const handleStartAnalysis = async () => {
    try {
      const isCompare = location.state?.isCompare;

      const payload = {
        document_ids: documents.map(d => d.id),
        policy_type: options.policyType,
        analysis_level: options.analysisLevel,
        llm_model: options.model,
        masking_data: maskingData
      };

      // Use compare endpoint if in comparison mode
      const endpoint = isCompare ? '/compare/start' : '/analysis/start';
      const { data } = await api.post(endpoint, payload);

      addToast(isCompare ? 'Confronto avviato' : 'Analysis started successfully', 'success');
      navigate(`/analysis/${data.analysis_id}`);
    } catch (err) {
      addToast('Failed to start analysis', 'error');
    }
  };

  if (loading || !documents.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Caricamento documenti in corso...</h3>
          <p>Attendere prego.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="masking-layout fade-in">
      <div className="masking-controls">
        <h2>Mascheramento e Configurazione</h2>

        {/* File Tabs */}
        <div className="file-tabs">
          {documents.map((doc, idx) => (
            <button
              key={doc.id}
              className={`tab-btn ${idx === activeDocIndex ? 'active' : ''}`}
              onClick={() => setActiveDocIndex(idx)}
            >
              {doc.filename}
            </button>
          ))}
        </div>

        <MaskingForm
          data={maskingData}
          onChange={setMaskingData}
          options={options}
          onOptionsChange={setOptions}
          onSubmit={handleStartAnalysis}
        />
      </div>

      <div className="masking-preview">
        <TextPreview
          text={documents[activeDocIndex]?.text_preview || ''}
          maskingData={maskingData}
        />
      </div>
    </div>
  );
};

export default MaskingPage;