import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaComments, FaShieldAlt, FaPaperclip, FaFileAlt, FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const [attachedContext, setAttachedContext] = useState(null); // { text, filename }

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check for returned context from MaskingPage
    useEffect(() => {
        if (location.state?.chatContext && location.state?.fileName) {
            setIsOpen(true);
            setAttachedContext({
                text: location.state.chatContext,
                filename: location.state.fileName
            });
            // Optional: Auto-add a system message acknowledging the file
            setMessages(prev => [...prev, {
                type: 'assistant',
                text: `Ho ricevuto il documento **${location.state.fileName}**. Mascheramento completato. Chiedimi pure qualsiasi cosa a riguardo.`,
                timestamp: new Date().toISOString()
            }]);

            // Clean up state to prevent re-reading on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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

    const handleAttachClick = () => {
        navigate('/upload', { state: { mode: 'chat' } });
        setIsOpen(false); // Close chat while navigating
    };

    const handleClearChat = () => {
        if (window.confirm('Sei sicuro di voler cancellare tutta la conversazione?')) {
            setMessages([{
                type: 'assistant',
                text: 'Ciao! Sono il tuo assistente virtuale specializzato in ambito **assicurativo e legale**. Come posso aiutarti oggi?',
                timestamp: new Date().toISOString()
            }]);
            setAttachedContext(null);
            // Clear history state to prevent re-attach on refresh
            window.history.replaceState({}, document.title);
        }
    };

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

            // Inject context if present
            let payloadMessage = userMessage;
            if (attachedContext) {
                // Prepend context to this message ONLY once, then clear it
                // Or: handling context as a separate hidden system message in backend is better, 
                // but simpler for now:
                // We'll reset attachedContext after sending, treating it as "consumed" for the immediate interaction context, 
                // but ideally the LLM history remembers it.
                // However, to ensure it's treated as a document, let's prepend it clearly.
                payloadMessage = `[CONTESTO DOCUMENTO MASCHERATO]\n${attachedContext.text}\n\n[DOMANDA UTENTE]\n${userMessage}`;
                setAttachedContext(null); // Consumed
            }

            // Chat API call
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: payloadMessage,
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
                    <div className="chat-actions">
                        <button className="icon-btn" onClick={handleClearChat} title="Cancella chat">
                            <FaTrash />
                        </button>
                        <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>
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
                        {/* Attached File Chip */}
                        {attachedContext && (
                            <div className="attached-file-chip">
                                <FaFileAlt />
                                <span>{attachedContext.filename}</span>
                                <button onClick={() => setAttachedContext(null)} className="remove-file-btn">
                                    <FaTimes />
                                </button>
                            </div>
                        )}

                        {messages.length < 3 && !isLoading && !attachedContext && (
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

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <button
                                className="attach-btn"
                                onClick={handleAttachClick}
                                title="Allega documento da analizzare"
                                disabled={isLoading}
                            >
                                <FaPaperclip />
                            </button>

                            <div className="chat-input-wrapper" style={{ flex: 1 }}>
                                <textarea
                                    ref={textareaRef}
                                    className="chat-input"
                                    placeholder={attachedContext ? "Chiedi qualcosa sul documento..." : "Scrivi una domanda..."}
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
