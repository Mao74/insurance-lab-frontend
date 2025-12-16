import React from 'react';

const Toast = ({ message, type, onClose }) => {
  const styles = {
    background: 'white',
    color: '#333',
    padding: '12px 20px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    marginBottom: '10px',
    borderLeft: `4px solid ${type === 'success' ? '#2E7D32' : type === 'error' ? '#D32F2F' : '#0F1F3F'}`,
    minWidth: '250px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideIn 0.3s ease',
    fontSize: '14px',
  };

  return (
    <div style={styles}>
      <span>{message}</span>
      <button onClick={onClose} style={{border:'none', background:'transparent', cursor:'pointer', marginLeft:'10px', fontSize:'16px'}}>&times;</button>
    </div>
  );
};

export default Toast;