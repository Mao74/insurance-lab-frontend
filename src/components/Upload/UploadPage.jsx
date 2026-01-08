import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { addToast } = useNotification();

  const handleFilesSelected = (newFiles) => {
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

    const validFiles = newFiles.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return allowedTypes.includes(f.type) || allowedExtensions.includes(ext);
    });

    if (validFiles.length !== newFiles.length) {
      addToast('Alcuni file non sono supportati', 'error');
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
        timeout: 300000 // 5 minutes (OCR is slow)
      });

      addToast('Caricamento completato', 'success');

      // Map API response to what Masking page expects
      // Backend returns: { status: "success", document_ids: [1], ... }
      // But we might need more details. For now let's pass IDs and fetch there or assume standard.
      // Actually refactor/upload_routes.py returns: { document_ids: [...], message: "..." }

      // We need to pass the documents to the next page. 
      // Since the API only returns IDs, we might need to fetch details or just pass IDs.
      // Let's assume for MVP we pass IDs and the next page fetches, OR we just trust IDs.

      // Let's pass the document IDs
      // Let's pass the document IDs
      navigate('/masking', {
        state: {
          ...location.state, // Pass forward any mode (e.g. 'chat')
          document_ids: data.document_ids
        }
      });
    } catch (err) {
      addToast('Caricamento fallito', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container fade-in">
      <div className="upload-header">
        <h1>{location.state?.mode === 'chat' ? 'Allega Documento alla Chat' : 'Genera Report'}</h1>
        <p>
          {location.state?.mode === 'chat'
            ? 'Carica il documento da analizzare con l\'assistente virtuale.'
            : 'Carica i documenti assicurativi per estrarre e analizzare i dati.'}
        </p>
      </div>

      <div className="upload-content">
        <FileDropZone
          onFilesSelected={handleFilesSelected}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.msg,.eml,.jpg,.jpeg,.png,.txt"
          helperText="Supportati: PDF, DOC, DOCX, XLS, XLSX, MSG, EML, JPG, PNG, TXT (Max 50MB)"
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