import React, { useCallback } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import './Upload.css';

const FileDropZone = ({ onFilesSelected, accept = ".pdf", helperText = "Supportati: PDF (Max 50MB)", title = "Trascina qui i file" }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      className="drop-zone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        multiple
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <FaCloudUploadAlt className="upload-icon" />
      <h3>{title}</h3>
      <p>oppure</p>
      <label htmlFor="fileInput" className="browse-btn">
        Sfoglia File
      </label>
      <p className="limit-text">{helperText}</p>
    </div>
  );
};

export default FileDropZone;