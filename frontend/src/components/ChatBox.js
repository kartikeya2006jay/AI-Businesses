import React, { useState, useEffect, useRef } from 'react';
import { chatWithAI } from '../services/api';
import { MessageSquare, Send, X, Bot, User as UserIcon } from 'lucide-react';

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
          <MessageSquare size={24} color="white" />
          <div className="notification-ping"></div>
        </button>
      )}

      {/* Main Chat Window */}
      <div className={`chat-box glass-v2 ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-brand">
            <div className="bot-avatar">
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3>Merchant AI</h3>
              <span className="online-status">Online • Ready to help</span>
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
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>

        <style jsx>{`
          .glass-v2 {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
          }
          .chat-toggle {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 64px;
            height: 64px;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            box-shadow: 0 4px 15px rgba(0, 186, 242, 0.4);
          }
          .chat-toggle:hover { transform: scale(1.1); }
          .notification-ping {
            position: absolute;
            top: 0;
            right: 0;
            width: 14px;
            height: 14px;
            background: #22c55e;
            border-radius: 50%;
            border: 2px solid white;
          }
          .chat-box {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 380px;
            height: 550px;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            z-index: 1001;
            transform: translateY(120%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
          }
          .chat-box.open { transform: translateY(0); }
          .chat-header {
            padding: 1.5rem;
            background: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0,0,0,0.05);
          }
          .header-brand { display: flex; align-items: center; gap: 0.8rem; }
          .bot-avatar {
            width: 36px;
            height: 36px;
            background: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .header-brand h3 { margin: 0; font-size: 1rem; color: var(--secondary); font-weight: 700; }
          .online-status { font-size: 0.75rem; color: #22c55e; font-weight: 500; }
          .close-btn { background: transparent; border: none; color: #999; cursor: pointer; padding: 4px; }
          .close-btn:hover { color: #333; }
          .message-list {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
            background: rgba(248, 250, 252, 0.5);
          }
          .message-wrapper { display: flex; gap: 0.8rem; align-items: flex-end; }
          .message-wrapper.user { flex-direction: row-reverse; }
          .avatar-circle {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            flex-shrink: 0;
          }
          .message-wrapper.user .avatar-circle { display: none; }
          .message-bubble {
            max-width: 80%;
            padding: 0.8rem 1rem;
            border-radius: 18px;
            font-size: 0.9rem;
            line-height: 1.5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          }
          .assistant .message-bubble {
            background: white;
            color: #333;
            border-bottom-left-radius: 4px;
          }
          .user .message-bubble {
            background: var(--primary);
            color: white;
            border-bottom-right-radius: 4px;
          }
          .chat-input-area {
            padding: 1.2rem;
            background: white;
            display: flex;
            gap: 0.8rem;
            align-items: center;
          }
          .chat-input-area input {
            flex: 1;
            padding: 0.8rem 1.2rem;
            border-radius: 20px;
            border: 1px solid #eee;
            background: #f8fafc;
            outline: none;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          .chat-input-area input:focus { border-color: var(--primary); background: white; }
          .send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--primary);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }
          .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 186, 242, 0.3); }
          .send-btn:disabled { opacity: 0.5; background: #cbd5e1; }
          
          /* Typing Animation */
          .typing span {
            width: 6px;
            height: 6px;
            background: #94a3b8;
            border-radius: 50%;
            display: inline-block;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out both;
          }
          .typing span:nth-child(1) { animation-delay: -0.32s; }
          .typing span:nth-child(2) { animation-delay: -0.16s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
          }
        `}</style>
      </div>
    </>
  );
};

export default ChatBox;
