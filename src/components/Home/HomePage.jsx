import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaBalanceScale, FaCarCrash, FaChartLine, FaComments, FaSignOutAlt, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Home.css';

const ModuleCard = ({ title, description, icon: Icon, path, isActive, onClick }) => (
    <div
        className={`module-card ${!isActive ? 'disabled' : ''}`}
        onClick={isActive ? onClick : undefined}
    >
        {isActive ? (
            <span className="active-badge">Disponibile</span>
        ) : (
            <span className="coming-soon-badge">Coming Soon</span>
        )}
        <div className="module-icon">
            <Icon />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const HomePage = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { addToast } = useNotification();

    const handleModuleClick = (path) => {
        navigate(path);
    };

    const handleComingSoon = () => {
        addToast('Questo modulo sarà disponibile a breve!', 'info');
    };

    const modules = [
        {
            title: 'Genera Report',
            description: 'Analisi automatica e generazione report polizze.',
            icon: FaFileAlt,
            path: '/upload',
            isActive: true,
            action: () => handleModuleClick('/upload')
        },
        {
            title: 'Confronta Polizze/Preventivi',
            description: 'Comparazione dettagliata tra diverse coperture.',
            icon: FaBalanceScale,
            path: '/compare',
            isActive: true,
            action: () => handleModuleClick('/compare')
        },
        {
            title: 'Analisi Sinistro',
            description: 'Valutazione preliminare e gestione sinistri.',
            icon: FaCarCrash,
            isActive: true,
            action: () => handleModuleClick('/claims')
        },
        {
            title: 'Analisi Prospect',
            description: 'Analisi rischi e proposte per nuovi clienti.',
            icon: FaUserTie,
            isActive: false,
            action: handleComingSoon
        },
        {
            title: 'Analisi Economica',
            description: 'Dashboard finanziaria e proiezioni di costo.',
            icon: FaChartLine,
            isActive: false,
            action: handleComingSoon
        },
        {
            title: 'AI Chat Assistant',
            description: 'Assistente virtuale per domande immediate.',
            icon: FaComments,
            isActive: false,
            action: handleComingSoon
        }
    ];

    return (
        <div className="home-page fade-in">
            <header className="home-header">
                <div className="home-logo">
                    <img src="/logo-horizontal.png" alt="Insurance Lab" />
                </div>
                <div className="home-user">
                    <span>Benvenuto, {user?.username || 'Utente'}</span>
                    <button onClick={logout} className="logout-btn-text">
                        <FaSignOutAlt /> Esci
                    </button>
                </div>
            </header>

            <main className="home-content">
                <div className="home-title">
                    <h1>Scegli uno Strumento</h1>
                    <p>Seleziona il modulo operativo per iniziare l'attività</p>
                </div>

                <div className="modules-grid">
                    {modules.map((module, index) => (
                        <ModuleCard
                            key={index}
                            title={module.title}
                            description={module.description}
                            icon={module.icon}
                            isActive={module.isActive}
                            onClick={module.action}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HomePage;
