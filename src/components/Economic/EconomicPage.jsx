import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaChartLine } from 'react-icons/fa';
import api from '../../services/api';
import FileDropZone from '../Upload/FileDropZone';
import Button from '../Common/Button';
import { useNotification } from '../../context/NotificationContext';
import './Economic.css';

const EconomicPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useNotification();

    const handleFilesSelected = (newFiles) => {
        // Allows wider range of files for economic analysis (PDF, Excel, HTML, etc.)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/html'
        ];
        // Also check extensions
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.html', '.htm'];

        const validFiles = newFiles.filter(f => {
            const ext = '.' + f.name.split('.').pop().toLowerCase();
            // Simple check, can be improved
            return allowedTypes.includes(f.type) || allowedExtensions.includes(ext);
        });

        if (validFiles.length !== newFiles.length) {
            addToast('Alcuni file non sono supportati. Carica PDF, Excel o HTML.', 'warning');
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
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000
            });

            addToast('Documenti caricati con successo', 'success');

            // Navigate to masking/config page with specific policy type
            navigate('/masking', {
                state: {
                    document_ids: data.document_ids,
                    policyType: 'analisi_economica',
                    analysisLevel: 'standard' // Default level
                }
            });

        } catch (err) {
            console.error(err);
            addToast('Caricamento fallito', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="economic-container fade-in">
            <div className="economic-header">
                <div className="icon-wrapper">
                    <FaChartLine />
                </div>
                <h1>Analisi Economica</h1>
                <p>Carica bilanci o documenti finanziari per generare un report economico.</p>
            </div>

            <div className="upload-section">
                <FileDropZone
                    onFilesSelected={handleFilesSelected}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.html,.htm"
                    helperText="Supportati: PDF, Excel, Word, HTML"
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
                        <div className="action-area">
                            <Button onClick={handleUpload} isLoading={uploading} className="primary-btn">
                                {uploading ? 'Elaborazione in corso...' : 'Avvia Analisi Economica'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EconomicPage;
