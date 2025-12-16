import React from 'react';
import './Layout.css'; // Assicurati che il CSS esista

const Header = () => {
  return (
    <header className="top-header">
       {/* Opzionale: Mostra il logo mark a sinistra se necessario */}
       <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
          {/* Mostra solo su mobile se la sidebar è nascosta, o sempre se preferisci */}
          <img src="/logo-mark.png" alt="Logo" style={{ height: '32px', marginRight: '16px', display: 'none' }} className="mobile-logo" /> 
       </div>
       
       <div className="user-profile">
          <span style={{marginRight: '10px', fontSize: '14px'}}>Admin User</span>
          {/* Avatar placeholder o immagine profilo */}
          <div style={{ width: '32px', height: '32px', background: 'var(--color-navy-secondary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
       </div>
    </header>
  );
};

export default Header;