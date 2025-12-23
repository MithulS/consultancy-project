import { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

/**
 * ChatWidget Component - 24/7 AI Customer Support Chatbot
 * Features: Real-time chat, quick replies, multilingual support, auto-escalation
 */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [language, setLanguage] = useState('en');
  const [isEscalated, setIsEscalated] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Welcome message on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        sender: 'bot',
        text: "👋 Hi! I'm your AI support assistant. How can I help you today?",
        timestamp: new Date(),
        quickReplies: [
          'Track my order',
          'Return an item',
          'Check product availability',
          'Payment help'
        ]
      };
      setMessages([welcomeMessage]);
      setQuickReplies(welcomeMessage.quickReplies);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    
    if (!text) return;

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setQuickReplies([]);

    try {
      // Get auth token if available
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send message to backend
      const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          sessionId,
          language
        })
      });

      const data = await response.json();

      if (data.success) {
        // Simulate typing delay for better UX
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            text: data.response,
            timestamp: new Date(),
            intent: data.intent,
            quickReplies: data.quickReplies
          };

          setMessages(prev => [...prev, botMessage]);
          setQuickReplies(data.quickReplies || []);
          setIsTyping(false);

          // Handle escalation
          if (data.escalate) {
            setIsEscalated(true);
            handleEscalation();
          }
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      setIsTyping(false);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm having trouble connecting right now. Please try again or contact support directly.",
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleEscalation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.success) {
        const escalationMessage = {
          id: Date.now() + 2,
          sender: 'bot',
          text: `✨ You're being connected to a human agent. Queue position: ${data.queuePosition}. Estimated wait: ${Math.floor(data.estimatedWaitTime / 60)} minutes.`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, escalationMessage]);
      }
    } catch (error) {
      console.error('Error escalating:', error);
    }
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const submitFeedback = async (rating) => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating
        })
      });

      const feedbackMessage = {
        id: Date.now(),
        sender: 'bot',
        text: '🙏 Thank you for your feedback! It helps us improve.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, feedbackMessage]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const endConversation = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/chatbot/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      setIsOpen(false);
      
      // Show feedback prompt before closing
      const feedbackMessage = {
        id: Date.now(),
        sender: 'bot',
        text: 'How would you rate this conversation?',
        timestamp: new Date(),
        showRating: true
      };

      setMessages(prev => [...prev, feedbackMessage]);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    
    const langMessage = {
      id: Date.now(),
      sender: 'bot',
      text: `Language changed to ${lang.toUpperCase()}. How can I help you?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, langMessage]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-widget-container">
      {/* Minimized Chat Button */}
      {!isOpen && (
        <button
          className="chat-widget-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.6 15.73 3.64 17.23L2.05 21.95C1.93 22.32 2.08 22.72 2.41 22.91C2.55 23 2.72 23.05 2.89 23.05C3.04 23.05 3.19 23.01 3.33 22.94L8.05 20.36C9.27 21.13 10.63 21.5 12 21.5C17.52 21.5 22 17.02 22 11.5C22 5.98 17.52 2 12 2Z"
              fill="white"
            />
          </svg>
          {messages.length > 0 && (
            <span className="chat-badge">{messages.filter(m => m.sender === 'bot' && !m.read).length}</span>
          )}
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"/>
                </svg>
              </div>
              <div>
                <h3>AI Support Assistant</h3>
                <span className="chat-status">
                  <span className="status-dot"></span>
                  {isEscalated ? 'Connecting to agent...' : 'Typically replies instantly'}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              {/* Language Selector */}
              <select 
                className="language-selector"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label="Select language"
              >
                <option value="en">🇬🇧 EN</option>
                <option value="es">🇪🇸 ES</option>
                <option value="fr">🇫🇷 FR</option>
                <option value="de">🇩🇪 DE</option>
                <option value="zh">🇨🇳 ZH</option>
                <option value="ja">🇯🇵 JA</option>
              </select>
              
              <button
                className="chat-close-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
              >
                {message.sender === 'bot' && (
                  <div className="message-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"/>
                    </svg>
                  </div>
                )}
                
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                  
                  {/* Rating Component */}
                  {message.showRating && (
                    <div className="rating-container">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          className="rating-button"
                          onClick={() => submitFeedback(rating)}
                          aria-label={`Rate ${rating} stars`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message bot-message">
                <div className="message-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3B82F6">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"/>
                  </svg>
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {quickReplies.length > 0 && (
            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-button"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
                disabled={isEscalated}
              />
              <button
                className="chat-send-button"
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isEscalated}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            <div className="chat-footer">
              <span className="powered-by">Powered by AI</span>
              <button className="end-chat-button" onClick={endConversation}>
                End chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
