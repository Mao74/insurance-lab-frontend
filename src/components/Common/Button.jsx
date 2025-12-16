import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', isLoading, ...props }) => {
  const style = {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    // border: 'none',  <--- RIMUOVI QUESTA RIGA (è un duplicato)
    cursor: props.disabled || isLoading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: props.disabled ? 0.6 : 1,
    
    // Questa parte sotto gestisce già il bordo correttamente
    background: variant === 'primary' ? 'var(--color-navy-primary)' : 
                variant === 'secondary' ? 'transparent' : 'var(--text-danger)',
    color: variant === 'secondary' ? 'var(--color-navy-primary)' : 'white',
    border: variant === 'secondary' ? '1px solid var(--color-navy-primary)' : 'none',
  };

  return (
    <button style={style} {...props}>
      {isLoading ? 'Wait...' : children}
    </button>
  );
};
export default Button;