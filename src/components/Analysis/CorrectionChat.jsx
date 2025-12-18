import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaLightbulb, FaSpinner } from 'react-icons/fa';
import './CorrectionChat.css';

const CorrectionChat = ({ analysisId, onClose, onCorrectionApplied }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setHistory(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/analysis/${analysisId}/correct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ correction_message: userMessage })
            });

            if (!response.ok) {
                throw new Error('Errore durante la correzione');
            }

            const data = await response.json();

            setHistory(prev => [...prev, {
                type: 'assistant',
                text: data.message || 'Correzione applicata. Il report è stato aggiornato.',
                sections: data.updated_sections || []
            }]);

            if (onCorrectionApplied && data.updated_html) {
                onCorrectionApplied(data.updated_html);
            }

        } catch (error) {
            setHistory(prev => [...prev, {
                type: 'error',
                text: `Errore: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "L'indirizzo corretto è Via Roma 123, Milano",
        "La somma assicurata è 500.000€",
        "Manca la copertura per eventi atmosferici",
        "Il numero di polizza è errato"
    ];

    return (
        <div className="correction-chat-overlay">
            <div className="correction-chat">
                <div className="correction-chat-header">
                    <div className="correction-chat-title">
                        <FaLightbulb />
                        <span>Suggerisci Correzione</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="correction-chat-messages">
                    {history.length === 0 && (
                        <div className="welcome-message">
                            <p>Hai notato un errore nel report? Descrivi cosa non è corretto.</p>
                            <div className="suggestions">
                                <p className="suggestions-title">Esempi:</p>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        className="suggestion-chip"
                                        onClick={() => setMessage(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {history.map((msg, i) => (
                        <div key={i} className={`message ${msg.type}`}>
                            {msg.type === 'user' && <div className="message-label">Tu</div>}
                            {msg.type === 'assistant' && <div className="message-label">Assistente</div>}
                            <div className="message-text">{msg.text}</div>
                            {msg.sections && msg.sections.length > 0 && (
                                <div className="updated-sections">
                                    Sezioni aggiornate: {msg.sections.join(', ')}
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant loading">
                            <FaSpinner className="spin" />
                            <span>Sto elaborando la correzione...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <form className="correction-chat-input" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Descrivi l'errore da correggere..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!message.trim() || isLoading}>
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CorrectionChat;
