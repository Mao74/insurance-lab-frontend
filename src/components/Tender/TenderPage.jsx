import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaFileContract } from 'react-icons/fa';
import api from '../../services/api';
import FileDropZone from '../Upload/FileDropZone';
import Button from '../Common/Button';
import { useNotification } from '../../context/NotificationContext';
import './Tender.css';

const TenderPage = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useNotification();

    const handleFilesSelected = (newFiles) => {
        // Allows PDF, Word, Excel for Tenders
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

        const validFiles = newFiles.filter(f => {
            const ext = '.' + f.name.split('.').pop().toLowerCase();
            return allowedTypes.includes(f.type) || allowedExtensions.includes(ext);
        });

        if (validFiles.length !== newFiles.length) {
            addToast('Alcuni file non sono supportati. Carica PDF, Word o Excel.', 'warning');
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
                    policyType: 'analisi_capitolati', // New Policy Type
                    analysisLevel: 'standard'
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
        <div className="tender-container fade-in">
            <div className="tender-header">
                <div className="icon-wrapper">
                    <FaFileContract />
                </div>
                <h1>Analisi Capitolati</h1>
                <p>Carica il disciplinare o il capitolato tecnico per estrarre i requisiti assicurativi.</p>
            </div>

            <div className="upload-section">
                <FileDropZone
                    onFilesSelected={handleFilesSelected}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    helperText="Supportati: PDF, Word, Excel"
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
                                {uploading ? 'Elaborazione in corso...' : 'Analizza Capitolato'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenderPage;
