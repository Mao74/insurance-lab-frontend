import React from 'react';
import '../../styles/animations.css';

const Loader = ({ size = 'medium' }) => {
  const dims = size === 'large' ? '40px' : size === 'small' ? '16px' : '24px';
  const border = size === 'large' ? '4px' : '2px';

  const style = {
    width: dims,
    height: dims,
    border: `${border} solid #f3f3f3`,
    borderTop: `${border} solid var(--color-gold)`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return <div style={style} className="spin"></div>;
};

export default Loader;