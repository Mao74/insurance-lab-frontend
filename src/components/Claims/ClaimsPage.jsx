import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheck, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import FileDropZone from '../Upload/FileDropZone';
import Button from '../Common/Button';
import { useNotification } from '../../context/NotificationContext';
import '../Upload/Upload.css'; // Reuse upload styles for now

const ClaimsPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    // policyType is to be selected in MaskingPage
    const navigate = useNavigate();
    const { addToast } = useNotification();

    const handleFilesSelected = (newFiles) => {
        // Allow PDF, Images, Word, Excel, Email
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'msg', 'eml', 'txt'];

        const validFiles = newFiles.filter(f => {
            const ext = f.name.split('.').pop().toLowerCase();
            return allowedExtensions.includes(ext);
        });

        if (validFiles.length !== newFiles.length) {
            addToast('Alcuni file non sono supportati. (PDF, Word, Excel, Email, Immagini)', 'warning');
        }
        setFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            // Use the new Claims specific endpoint
            const { data } = await api.post('/claims/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addToast('Caricamento e elaborazione completati', 'success');

            // Navigate to masking page with the processed document IDs
            // Pass sinistro analysis level. policyType isn't set yet, defaults to rc_generale or user choice.
            navigate('/masking', {
                state: {
                    document_ids: data.document_ids,
                    policyType: 'rc_generale', // Default, can be changed in Masking
                    analysisLevel: 'sinistro'
                }
            });
        } catch (err) {
            console.error(err);
            addToast('Errore durante il caricamento o l\'elaborazione', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container fade-in">
            <div className="upload-header">
                <h1>Analisi Sinistro</h1>
                <p>Carica i documenti necessari all'analisi del sinistro.</p>
            </div>

            <div className="upload-content">
                <FileDropZone
                    onFilesSelected={handleFilesSelected}
                    title="Trascina qui i file"
                    helperText="Supportati: PDF, Office, Email, Immagini"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.msg,.eml,.jpg,.jpeg,.png,.txt"
                />

                {files.length > 0 && (
                    <div className="file-list card">
                        <h3>File Selezionati ({files.length})</h3>
                        <ul>
                            {files.map((file, idx) => (
                                <li key={idx} className="file-item">
                                    <div className="file-info">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    <button className="delete-btn" onClick={() => removeFile(idx)} disabled={uploading}>
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="upload-actions">
                            <Button onClick={handleUpload} isLoading={uploading} style={{ width: '100%' }}>
                                {uploading ? 'Elaborazione in corso...' : 'Genera txt'}
                            </Button>
                        </div>
                        {uploading && (
                            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                                L'elaborazione di email e allegati potrebbe richiedere qualche secondo...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaimsPage;
