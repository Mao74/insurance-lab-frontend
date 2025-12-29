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
    const [policyType, setPolicyType] = useState('rc_generale');
    const navigate = useNavigate();
    const { addToast } = useNotification();

    const handleFilesSelected = (newFiles) => {
        // Allow PDF, Images, Word, Excel, Email
        // Note: FileDropZone might filter by accept prop, need to check if we can override or if it accepts all.
        // Assuming we pass valid files or DropZone handles it.
        // We will validate extensions here loosely.
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx', 'msg', 'eml'];

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
            // Pass policyType and sinistro analysis level
            navigate('/masking', {
                state: {
                    document_ids: data.document_ids,
                    policyType: policyType,
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
                <p>Carica documenti (PDF, Email, Excel, Word, Immagini) per l'analisi del sinistro.</p>
                <div style={{ marginTop: '16px', maxWidth: '300px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Ramo Assicurativo</label>
                    <select
                        value={policyType}
                        onChange={(e) => setPolicyType(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                    >
                        <option value="rc_generale">RC Generale</option>
                        <option value="incendio">Incendio</option>
                        <option value="trasporti">Trasporti</option>
                        <option value="cyber">Cyber Risk</option>
                        <option value="infortuni">Infortuni</option>
                        <option value="rca">RCA Auto</option>
                    </select>
                </div>
            </div>

            <div className="upload-content">
                {/* We might need to adjust DropZone to allow these types if it has hardcoded accept */}
                <FileDropZone
                    onFilesSelected={handleFilesSelected}
                    title="Trascina qui i file del Sinistro"
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
