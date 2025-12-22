import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaTimes, FaBalanceScale, FaArrowRight, FaPlus } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import './Compare.css';

const ComparePage = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();

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
            if (file.type === 'application/pdf') {
                setDocuments(prev => prev.map(doc =>
                    doc.id === docId
                        ? { ...doc, file: { file, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' }, isDragging: false }
                        : doc
                ));
            } else {
                addToast('Seleziona un file PDF', 'error');
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

    const handleCompare = () => {
        const uploadedDocs = documents.filter(d => d.file !== null);
        if (uploadedDocs.length < 2) {
            addToast('Carica almeno 2 documenti per confrontare', 'warning');
            return;
        }

        addToast('Funzionalità in sviluppo. Il confronto sarà disponibile a breve!', 'info');
        // TODO: Implementare la logica di confronto
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
                >
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.msg,.eml,.jpg,.jpeg,.png,.txt"
                        onChange={(e) => handleDrop(e, doc.id)}
                        id={`file-${doc.id}`}
                        hidden
                    />
                    <label htmlFor={`file-${doc.id}`} className="dropzone-content">
                        <FaCloudUploadAlt className="upload-icon" />
                        <p className="upload-text">
                            Trascina qui il file oppure <span>sfoglia</span>
                        </p>
                        <p className="upload-hint">Supportati: PDF, DOC, XLSX, TXT, immagini</p>
                    </label>
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
        <div className="compare-page">
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
                <button
                    className="add-document-btn"
                    onClick={addDocument}
                    disabled={documents.length >= 5}
                >
                    <FaPlus />
                    <span>Aggiungi Documento</span>
                </button>

                <button
                    className={`compare-btn ${uploadedCount >= 2 ? 'active' : 'disabled'}`}
                    onClick={handleCompare}
                >
                    <span>Avvia Confronto ({uploadedCount} documenti)</span>
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
