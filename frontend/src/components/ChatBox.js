import React, { useState, useEffect, useRef } from 'react';
import { chatWithAI } from '../services/api';
import { MessageSquare, Send, X, Bot, User as UserIcon } from 'lucide-react';
import '../styles/ChatBox.css';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Merchant Copilot. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await chatWithAI('default-session', userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'It seems I am having trouble connecting. Please check if your backend is running!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chat-toggle glass" onClick={() => setIsOpen(true)}>
          <div className="toggle-inner">
            <MessageSquare size={24} color="white" />
            <span className="toggle-label">Merchant AI</span>
          </div>
          <div className="notification-ping"></div>
        </button>
      )}

      {/* Main Chat Window */}
      <div className={`chat-box glass-v2 ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-brand">
            <div className="bot-avatar">
              <Bot size={22} color="white" />
            </div>
            <div>
              <h3>AI Merchant Copilot</h3>
              <span className="online-status">Online • Ready to assist</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="message-list">
          {messages.map((m, i) => (
            <div key={i} className={`message-wrapper ${m.role}`}>
              <div className="avatar-circle">
                {m.role === 'assistant' ? <Bot size={14} /> : <UserIcon size={14} />}
              </div>
              <div className="message-bubble">
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="avatar-circle">
                <Bot size={14} />
              </div>
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={scrollRef}></div>
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            placeholder="Ask about sales, inventory..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </>
  );
};

export default ChatBox;
