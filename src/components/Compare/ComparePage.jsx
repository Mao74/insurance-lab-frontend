import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaTimes, FaBalanceScale, FaArrowRight, FaPlus } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import './Compare.css';

const ComparePage = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();
    const [isUploading, setIsUploading] = useState(false);
    const [policyType, setPolicyType] = useState('rc_generale');

    // Array dinamico di documenti
    const [documents, setDocuments] = useState([
        { id: 1, file: null, isDragging: false },
        { id: 2, file: null, isDragging: false }
    ]);

    const handleDrop = useCallback((e, docId) => {
        e.preventDefault();

        const files = e.dataTransfer?.files || e.target.files;
        if (files && files[0]) {
            const file = files[0];
            // Allowed MIME types and extensions
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-outlook',
                'message/rfc822',
                'image/jpeg',
                'image/png',
                'text/plain'
            ];
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.msg', '.eml', '.jpg', '.jpeg', '.png', '.txt'];
            const ext = '.' + file.name.split('.').pop().toLowerCase();

            if (allowedTypes.includes(file.type) || allowedExtensions.includes(ext)) {
                setDocuments(prev => prev.map(doc =>
                    doc.id === docId
                        ? { ...doc, file: { file, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' }, isDragging: false }
                        : doc
                ));
            } else {
                addToast('Formato non supportato. Usa PDF, DOC, XLSX, TXT o immagini.', 'error');
            }
        }
    }, [addToast]);

    const handleDragOver = (e, docId) => {
        e.preventDefault();
        setDocuments(prev => prev.map(doc =>
            doc.id === docId ? { ...doc, isDragging: true } : doc
        ));
    };

    const handleDragLeave = (docId) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === docId ? { ...doc, isDragging: false } : doc
        ));
    };

    const removeFile = (docId) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === docId ? { ...doc, file: null } : doc
        ));
    };

    const removeDocument = (docId) => {
        if (documents.length <= 2) {
            addToast('Servono almeno 2 documenti per il confronto', 'warning');
            return;
        }
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
    };

    const addDocument = () => {
        if (documents.length >= 5) {
            addToast('Massimo 5 documenti per confronto', 'warning');
            return;
        }
        const newId = Math.max(...documents.map(d => d.id)) + 1;
        setDocuments(prev => [...prev, { id: newId, file: null, isDragging: false }]);
    };

    const handleCompare = async () => {
        const uploadedDocs = documents.filter(d => d.file !== null);
        if (uploadedDocs.length < 2) {
            addToast('Carica almeno 2 documenti per confrontare', 'warning');
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData with all files
            const formData = new FormData();
            uploadedDocs.forEach(doc => {
                formData.append('files', doc.file.file);
            });
            formData.append('ramo', policyType);

            // Upload files using existing endpoint
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addToast(`${data.count} documenti caricati`, 'success');

            // Navigate to masking page with comparison mode
            navigate('/masking', {
                state: {
                    document_ids: data.document_ids,
                    policyType: policyType,
                    analysisLevel: 'confronto',
                    isCompare: true
                }
            });
        } catch (err) {
            console.error('Upload error:', err);
            addToast('Errore durante il caricamento', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const uploadedCount = documents.filter(d => d.file !== null).length;

    const UploadBox = ({ doc, index, canRemove }) => (
        <div className="upload-box-container">
            <div className="upload-box-header">
                <div className="upload-box-title">
                    <span className="upload-box-number">{index + 1}</span>
                    <span className="upload-box-label">Polizza/Preventivo {index + 1}</span>
                </div>
                {canRemove && (
                    <button className="remove-doc-btn" onClick={() => removeDocument(doc.id)} title="Rimuovi">
                        <FaTimes />
                    </button>
                )}
            </div>

            {!doc.file ? (
                <div
                    className={`upload-dropzone ${doc.isDragging ? 'dragging' : ''}`}
                    onDrop={(e) => handleDrop(e, doc.id)}
                    onDragOver={(e) => handleDragOver(e, doc.id)}
                    onDragLeave={() => handleDragLeave(doc.id)}
                    onClick={() => document.getElementById(`file-${doc.id}`).click()}
                >
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.msg,.eml,.jpg,.jpeg,.png,.txt"
                        onChange={(e) => handleDrop(e, doc.id)}
                        id={`file-${doc.id}`}
                        hidden
                    />
                    <div className="dropzone-content">
                        <FaCloudUploadAlt className="upload-icon" />
                        <p className="upload-text">
                            Trascina qui il file oppure <span>sfoglia</span>
                        </p>
                        <p className="upload-hint">Supportati: PDF, DOC, XLSX, TXT, immagini</p>
                    </div>
                </div>
            ) : (
                <div className="file-preview">
                    <div className="file-info">
                        <FaFilePdf className="file-icon" />
                        <div className="file-details">
                            <span className="file-name">{doc.file.name}</span>
                            <span className="file-size">{doc.file.size}</span>
                        </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeFile(doc.id)}>
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div
            className="compare-page"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
        >
            <div className="compare-header">
                <div className="compare-icon">
                    <FaBalanceScale />
                </div>
                <div>
                    <h1>Confronta Polizze/Preventivi</h1>
                    <p>Carica i documenti da confrontare per analizzare differenze e similitudini</p>
                </div>
            </div>

            <div className="compare-documents-grid">
                {documents.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                        <UploadBox
                            doc={doc}
                            index={index}
                            canRemove={documents.length > 2}
                        />
                        {index < documents.length - 1 && (
                            <div className="compare-divider-small">
                                <span>VS</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="compare-actions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Ramo Assicurativo</label>
                    <select
                        value={policyType}
                        onChange={(e) => setPolicyType(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', minWidth: '180px' }}
                    >
                        <option value="rc_generale">RC Generale</option>
                        <option value="incendio">Incendio</option>
                        <option value="trasporti">Trasporti</option>
                        <option value="cyber">Cyber Risk</option>
                        <option value="infortuni">Infortuni</option>
                        <option value="rca">RCA Auto</option>
                    </select>
                </div>

                <button
                    className="add-document-btn"
                    onClick={addDocument}
                    disabled={documents.length >= 5 || isUploading}
                >
                    <FaPlus />
                    <span>Aggiungi Documento</span>
                </button>

                <button
                    className={`compare-btn ${uploadedCount >= 2 && !isUploading ? 'active' : 'disabled'}`}
                    onClick={handleCompare}
                    disabled={uploadedCount < 2 || isUploading}
                >
                    <span>{isUploading ? 'Caricamento in corso...' : `Avvia Confronto (${uploadedCount} documenti)`}</span>
                    <FaArrowRight />
                </button>
            </div>

            <div className="compare-info">
                <h3>Cosa otterrai dal confronto:</h3>
                <ul>
                    <li>📋 Tabella comparativa delle garanzie</li>
                    <li>💰 Confronto massimali e franchigie</li>
                    <li>⚠️ Differenze nelle esclusioni</li>
                    <li>📊 Analisi costi/benefici</li>
                    <li>✅ Raccomandazioni per la scelta</li>
                </ul>
            </div>
        </div>
    );
};

export default ComparePage;
