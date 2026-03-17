import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithAI } from '../services/api';
import { MessageSquare, Send, X, Bot, User as UserIcon, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import '../styles/ChatBox.css';

/* ── Translation via MyMemory (free, no key) ─────────────── */
const translateText = async (text, fromLang, toLang) => {
  if (fromLang === toLang) return text;
  try {
    const resp = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
    );
    const data = await resp.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text; // fallback: return original
  }
};

/* ── SpeechRecognition setup ─────────────────────────────── */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hello! I am your AI Merchant Copilot.\n\nType or 🎤 speak your question — I support English & Hindi!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Voice state ───────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-US');          // en-US | hi-IN
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceSupported] = useState(!!SpeechRecognition);
  const [voiceError, setVoiceError] = useState('');

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Text-to-Speech ─────────────────────────────────────── */
  const speak = useCallback((text, language = 'en-US') => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any current speech

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    utter.rate = 0.95;
    utter.pitch = 1;

    // prefer a matching voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(language.slice(0, 2)));
    if (match) utter.voice = match;

    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  /* ── Send message (shared by text & voice) ──────────────── */
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, timestamp }]);
    setLoading(true);

    try {
      // If Hindi, translate to English for the AI
      let queryText = text;
      if (lang === 'hi-IN') {
        queryText = await translateText(text, 'hi', 'en');
      }

      const res = await chatWithAI('default-session', queryText);
      let aiReply = res.data.response;

      // If Hindi mode, translate AI reply back to Hindi
      let displayReply = aiReply;
      if (lang === 'hi-IN') {
        displayReply = await translateText(aiReply, 'en', 'hi');
      }

      setMessages(prev => [...prev, { role: 'assistant', text: displayReply, timestamp }]);
      speak(displayReply, lang);
    } catch {
      const errMsg = 'Sorry, I had trouble connecting. Please check if the backend is running!';
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg, timestamp }]);
      speak(errMsg, 'en-US');
    } finally {
      setLoading(false);
    }
  }, [loading, lang, speak]);

  /* ── Voice recognition ──────────────────────────────────── */
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setVoiceError('Voice not supported in this browser. Use Chrome or Edge.');
      return;
    }
    setVoiceError('');
    window.speechSynthesis?.cancel();

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setInput(transcript);

      // Auto-send on final result
      if (e.results[e.results.length - 1].isFinal) {
        sendMessage(transcript);
      }
    };

    rec.onerror = (e) => {
      setVoiceError(
        e.error === 'not-allowed'
          ? 'Microphone permission denied. Please allow mic access.'
          : `Voice error: ${e.error}`
      );
      setIsListening(false);
    };

    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  }, [lang, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  /* ── Form submit ────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleLang = () => {
    const next = lang === 'en-US' ? 'hi-IN' : 'en-US';
    setLang(next);
    // Update greeting
    setMessages(prev => {
      const greeting = next === 'hi-IN'
        ? '🙏 नमस्ते! मैं आपका AI मर्चेंट कोपायलट हूँ। बोलें या टाइप करें!'
        : '👋 Hello! I am your AI Merchant Copilot. Type or speak your question!';
      return [{ role: 'assistant', text: greeting, timestamp: prev[0]?.timestamp }, ...prev.slice(1)];
    });
  };

  return (
    <>
      {/* ── Floating Toggle Button ─────────────────────── */}
      {!isOpen && (
        <button className="chat-toggle glass" onClick={() => setIsOpen(true)}>
          <div className="toggle-inner">
            <MessageSquare size={24} color="white" />
            <span className="toggle-label">Merchant AI</span>
          </div>
          <div className="notification-ping" />
        </button>
      )}

      {/* ── Main Chat Window ───────────────────────────── */}
      <div className={`chat-box glass-v2 ${isOpen ? 'open' : ''}`}>

        {/* Header */}
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

          <div className="header-actions">
            {/* Language toggle */}
            <button
              className={`lang-toggle ${lang === 'hi-IN' ? 'hindi' : 'english'}`}
              onClick={toggleLang}
              title={lang === 'en-US' ? 'Switch to Hindi' : 'Switch to English'}
            >
              {lang === 'en-US' ? '🇬🇧 EN' : '🇮🇳 HI'}
            </button>

            {/* TTS toggle */}
            <button
              className="icon-btn tts-btn"
              onClick={() => setTtsEnabled(p => !p)}
              title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Voice mode banner */}
        {isListening && (
          <div className="voice-banner">
            <div className="voice-waves">
              <span /><span /><span /><span /><span />
            </div>
            <span className="voice-banner-text">
              {lang === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...'}
            </span>
            <button className="stop-voice-btn" onClick={stopListening}>Stop</button>
          </div>
        )}

        {/* Error banner */}
        {voiceError && (
          <div className="voice-error">
            ⚠️ {voiceError}
            <button onClick={() => setVoiceError('')}>×</button>
          </div>
        )}

        {/* Messages */}
        <div className="message-list">
          {messages.map((m, i) => (
            <div key={i} className={`message-wrapper ${m.role}`}>
              <div className="avatar-circle">
                {m.role === 'assistant' ? <Bot size={14} /> : <UserIcon size={14} />}
              </div>
              <div>
                <div className="message-bubble">{m.text}</div>
                {m.timestamp && <div className="msg-time">{m.timestamp}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="avatar-circle"><Bot size={14} /></div>
              <div className="message-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            placeholder={lang === 'hi-IN' ? 'अपना सवाल पूछें...' : 'Ask about sales, inventory...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />

          {/* Mic button */}
          {voiceSupported && (
            <button
              type="button"
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? 'Stop listening' : `Speak in ${lang === 'en-US' ? 'English' : 'Hindi'}`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening && <span className="mic-ripple" />}
            </button>
          )}

          <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>

        {/* Hint bar */}
        <div className="input-hint">
          <span>
            {voiceSupported
              ? `🎤 Click mic to speak in ${lang === 'en-US' ? 'English' : 'हिंदी'}`
              : '⚠️ Voice needs Chrome/Edge'}
          </span>
          <span className={`lang-badge ${lang === 'hi-IN' ? 'hindi' : ''}`}>
            {lang === 'en-US' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
          </span>
        </div>
      </div>
    </>
  );
};

export default ChatBox;