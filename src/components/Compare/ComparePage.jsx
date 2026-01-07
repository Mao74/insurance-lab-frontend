import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaTimes, FaBalanceScale, FaArrowRight, FaPlus, FaLayerGroup } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import './Compare.css';

const ComparePage = () => {
    const navigate = useNavigate();
    const { addToast } = useNotification();
    const [isUploading, setIsUploading] = useState(false);
    const [policyType, setPolicyType] = useState('rc_generale');

    // Array dinamico di slot documenti (ora ogni slot può avere più file)
    const [documentSlots, setDocumentSlots] = useState([
        { id: 1, files: [], isDragging: false },
        { id: 2, files: [], isDragging: false }
    ]);

    const processFiles = (newFiles, slotId) => {
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

        const validFiles = Array.from(newFiles).filter(file => {
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            if (allowedTypes.includes(file.type) || allowedExtensions.includes(ext)) {
                return true;
            }
            return false;
        });

        if (validFiles.length !== newFiles.length) {
            addToast('Alcuni file non erano supportati e sono stati ignorati.', 'warning');
        }

        if (validFiles.length > 0) {
            setDocumentSlots(prev => prev.map(slot => {
                if (slot.id === slotId) {
                    const existingFiles = slot.files || [];
                    const newFileObjects = validFiles.map(f => ({
                        file: f,
                        name: f.name,
                        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
                        localId: Math.random().toString(36).substr(2, 9) // Temp ID for UI removal
                    }));
                    return { ...slot, files: [...existingFiles, ...newFileObjects], isDragging: false };
                }
                return slot;
            }));
        }
    };

    const handleFileDrop = useCallback((e, slotId) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            processFiles(files, slotId);
        }

        setDocumentSlots(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, isDragging: false } : slot
        ));
    }, [addToast]);

    const handleFileSelect = useCallback((e, slotId) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files, slotId);
        }
        e.target.value = '';
    }, [addToast]);

    const handleDragEnter = (e, slotId) => {
        e.preventDefault();
        e.stopPropagation();
        setDocumentSlots(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, isDragging: true } : slot
        ));
    };

    const handleDragOver = (e, slotId) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDragLeave = (e, slotId) => {
        e.preventDefault();
        e.stopPropagation();
        setDocumentSlots(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, isDragging: false } : slot
        ));
    };

    const removeFileFromSlot = (slotId, fileLocalId) => {
        setDocumentSlots(prev => prev.map(slot => {
            if (slot.id === slotId) {
                return { ...slot, files: slot.files.filter(f => f.localId !== fileLocalId) };
            }
            return slot;
        }));
    };

    const removeSlot = (slotId) => {
        if (documentSlots.length <= 2) {
            addToast('Servono almeno 2 gruppi per il confronto', 'warning');
            return;
        }
        setDocumentSlots(prev => prev.filter(slot => slot.id !== slotId));
    };

    const addSlot = () => {
        if (documentSlots.length >= 6) {
            addToast('Massimo 6 gruppi per confronto', 'warning');
            return;
        }
        const newId = Math.max(...documentSlots.map(d => d.id)) + 1;
        setDocumentSlots(prev => [...prev, { id: newId, files: [], isDragging: false }]);
    };

    const handleCompare = async () => {
        // Count slots with at least one file
        const activeSlots = documentSlots.filter(s => s.files.length > 0);

        if (activeSlots.length < 2) {
            addToast('Carica documenti in almeno 2 riquadri per confrontare', 'warning');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            const groupMap = []; // To track which file belongs to which slot group

            // Flatten files and build tracking map
            activeSlots.forEach(slot => {
                const fileCount = slot.files.length;
                slot.files.forEach(fObj => {
                    formData.append('files', fObj.file);
                });
                groupMap.push({ slotId: slot.id, count: fileCount });
            });

            formData.append('ramo', policyType);

            // Upload all files in one go
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reconstruct groups from returned IDs
            // The API returns IDs in the same order as files were appended
            const allDocIds = data.document_ids;
            const groupedDocumentIds = [];
            let currentIndex = 0;

            groupMap.forEach(group => {
                const groupIds = allDocIds.slice(currentIndex, currentIndex + group.count);
                groupedDocumentIds.push(groupIds);
                currentIndex += group.count;
            });

            addToast(`${allDocIds.length} documenti caricati ready per confronto`, 'success');

            // Navigate to masking page with grouped IDs
            navigate('/masking', {
                state: {
                    grouped_document_ids: groupedDocumentIds, // NEW: List of lists
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

    // Count how many SLOTS have content
    const filledSlotsCount = documentSlots.filter(s => s.files.length > 0).length;

    const UploadBox = ({ slot, index, canRemove }) => (
        <div className="upload-box-container">
            <div className="upload-box-header">
                <div className="upload-box-title">
                    <span className="upload-box-number">{index + 1}</span>
                    <span className="upload-box-label">Gruppo {index + 1} (Polizza + Appendici)</span>
                </div>
                {canRemove && (
                    <button className="remove-doc-btn" onClick={() => removeSlot(slot.id)} title="Rimuovi Gruppo">
                        <FaTimes />
                    </button>
                )}
            </div>

            <div
                className={`upload-dropzone ${slot.isDragging ? 'dragging' : ''} ${slot.files.length > 0 ? 'has-files' : ''}`}
                onDrop={(e) => handleFileDrop(e, slot.id)}
                onDragEnter={(e) => handleDragEnter(e, slot.id)}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={(e) => handleDragLeave(e, slot.id)}
                onClick={() => document.getElementById(`file-${slot.id}`).click()}
            >
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.msg,.eml,.jpg,.jpeg,.png,.txt"
                    onChange={(e) => handleFileSelect(e, slot.id)}
                    id={`file-${slot.id}`}
                    hidden
                    multiple // Allow multiple files
                />

                {slot.files.length === 0 ? (
                    <div className="dropzone-content">
                        <FaCloudUploadAlt className="upload-icon" />
                        <p className="upload-text">
                            <span style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'underline' }}>Clicca per selezionare i file</span>
                        </p>
                        <p className="upload-hint">Supportati: PDF, DOC, XLSX, TXT, IMG</p>
                    </div>
                ) : (

                    <div className="files-list">
                        <div className="add-more-hint">
                            <FaPlus /> Aggiungi altri file
                        </div>
                        {slot.files.map((fileObj) => (
                            <div key={fileObj.localId} className="file-preview-item" onClick={(e) => e.stopPropagation()}>
                                <FaFilePdf className="file-icon-small" />
                                <div className="file-details-small">
                                    <span className="file-name-small">{fileObj.name}</span>
                                    <span className="file-size-small">{fileObj.size}</span>
                                </div>
                                <button className="remove-btn-small" onClick={() => removeFileFromSlot(slot.id, fileObj.localId)}>
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
                    <FaLayerGroup />
                </div>
                <div>
                    <h1>Confronta Polizze/Preventivi</h1>
                    <p>Carica i documenti da confrontare. Puoi inserire più file per ogni gruppo (es. CGA + Polizza).</p>
                </div>
            </div>

            <div className="compare-documents-grid">
                {documentSlots.map((slot, index) => (
                    <React.Fragment key={slot.id}>
                        <UploadBox
                            slot={slot}
                            index={index}
                            canRemove={documentSlots.length > 2}
                        />
                        {index < documentSlots.length - 1 && (
                            <div className="compare-divider-small">
                                <span>VS</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="compare-actions">
                <div style={{ display: 'none' }}>
                    {/* Policy Type selector removed as it is handled in MaskingPage */}
                </div>

                <button
                    className="add-document-btn"
                    onClick={addSlot}
                    disabled={documentSlots.length >= 6 || isUploading}
                >
                    <FaPlus />
                    <span>Aggiungi Gruppo</span>
                </button>

                <button
                    className={`compare-btn ${filledSlotsCount >= 2 && !isUploading ? 'active' : 'disabled'}`}
                    onClick={handleCompare}
                    disabled={filledSlotsCount < 2 || isUploading}
                >
                    <span>{isUploading ? 'Caricamento in corso...' : `Avvia Confronto (${filledSlotsCount} gruppi)`}</span>
                    <FaArrowRight />
                </button>
            </div>

            {/* Info section removed as per user request */}
        </div>
    );
};

export default ComparePage;
