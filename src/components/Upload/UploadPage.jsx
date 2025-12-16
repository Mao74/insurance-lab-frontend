import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheck, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import FileDropZone from './FileDropZone';
import Button from '../Common/Button';
import { useNotification } from '../../context/NotificationContext';
import './Upload.css';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const handleFilesSelected = (newFiles) => {
    const validFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (validFiles.length !== newFiles.length) {
      addToast('Only PDF files are allowed', 'error');
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      addToast('Upload successful', 'success');

      // Map API response to what Masking page expects
      // Backend returns: { status: "success", document_ids: [1], ... }
      // But we might need more details. For now let's pass IDs and fetch there or assume standard.
      // Actually refactor/upload_routes.py returns: { document_ids: [...], message: "..." }

      // We need to pass the documents to the next page. 
      // Since the API only returns IDs, we might need to fetch details or just pass IDs.
      // Let's assume for MVP we pass IDs and the next page fetches, OR we just trust IDs.

      // Let's pass the document IDs
      navigate('/masking', { state: { document_ids: data.document_ids } });
    } catch (err) {
      addToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container fade-in">
      <div className="upload-header">
        <h1>Nuova Analisi</h1>
        <p>Carica documenti assicurativi (PDF) per estrarre e analizzare i dati.</p>
      </div>

      <div className="upload-content">
        <FileDropZone onFilesSelected={handleFilesSelected} />

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
                {uploading ? 'Caricamento...' : 'Genera txt'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;