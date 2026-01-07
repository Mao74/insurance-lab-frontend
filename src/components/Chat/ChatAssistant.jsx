import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaComments, FaShieldAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './ChatAssistant.css';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'assistant',
            text: 'Ciao! Sono il tuo assistente virtuale specializzato in ambito **assicurativo e legale**. Come posso aiutarti oggi?',
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [inputValue]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Add user message
        const newUserMsg = {
            type: 'user',
            text: userMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            // Include history in the request
            const history = messages.slice(1).map(m => ({
                role: m.type === 'assistant' ? 'assistant' : 'user',
                content: m.text
            }));

            // Streaming fetch
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Include cookies for session auth
                credentials: 'include',
                body: JSON.stringify({
                    message: userMessage,
                    history: history
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Create placeholder for assistant response
            const timestamp = new Date().toISOString();
            setMessages(prev => [...prev, {
                type: 'assistant',
                text: '',
                timestamp: timestamp
            }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                // Update the last message (which is the assistant's)
                setMessages(prev => {
                    const newArr = [...prev];
                    const lastIndex = newArr.length - 1;
                    newArr[lastIndex] = {
                        ...newArr[lastIndex],
                        text: accumulatedText
                    };
                    return newArr;
                });
            }

            setIsLoading(false);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                text: 'Si è verificato un errore di connessione. Riprova più tardi.',
                timestamp: new Date().toISOString()
            }]);
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const suggestions = [
        "Cos'è la rivalsa assicurativa?",
        "Quali sono i termini di prescrizione?",
        "Analizza la clausola di esclusione",
        "Come si calcola il danno biologico?"
    ];

    if (!isOpen) {
        return (
            <div className="chat-fab-container">
                <button
                    className="chat-fab"
                    onClick={() => setIsOpen(true)}
                    title="Assistente IA"
                >
                    <FaComments />
                </button>
            </div>
        );
    }

    return (
        <div className="chat-overlay">
            <div className="chat-window">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-title">
                        <div className="chat-logo">
                            <FaRobot />
                        </div>
                        <div className="chat-info">
                            <h3>Insurance Assistant</h3>
                            <p>
                                <span className="status-badge"></span>
                                Online • Ambito Assicurativo/Legale
                            </p>
                        </div>
                    </div>
                    <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
                        <FaTimes />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="welcome-screen">
                            <FaShieldAlt className="welcome-icon" />
                            <h2>Assistente Blindato</h2>
                            <p>Poni domande specifiche su polizze, sinistri e normative.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                <div className="message-bubble">
                                    {msg.type === 'assistant' ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                <span className="message-timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="message assistant">
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="chat-input-container-col" style={{ width: '100%' }}>
                        {messages.length < 3 && !isLoading && (
                            <div className="suggestions-container" style={{ marginBottom: '12px' }}>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        className="suggestion-chip"
                                        onClick={() => {
                                            setInputValue(s);
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div className="chat-input-wrapper">
                                <textarea
                                    ref={textareaRef}
                                    className="chat-input"
                                    placeholder="Scrivi una domanda..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                />
                            </div>
                            <button
                                className="send-btn"
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
