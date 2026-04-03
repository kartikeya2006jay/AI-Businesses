import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Heart, Zap, Terminal, Activity, X, Phone, Mail, MapPin, User, Cpu } from 'lucide-react';
import '../styles/AboutView.css';

const AboutView = () => {
  const [showContact, setShowContact] = useState(false);

  const contactInfo = {
    name: "Kartikeya Yadav",
    phone: "9720613333",
    email: "kartikeya2006jay@gmail.com",
    address: "Bangalore, Karnataka, 560100"
  };

  return (
    <div className="about-view app-root">
      {/* ── Elite Brand Hero ────────────────────────────── */}
      <div className="elite-hero-new">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hero-logo-box"
        >
          <div className="aura-glow" />
          <svg width="100" height="100" viewBox="0 0 32 32" fill="none" className="brand-m-large">
            <path d="M6 26V6L16 16L26 6V26" stroke="url(#hero-m-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="3" fill="white">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="hero-m-gradient" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00baf2" />
                <stop offset="1" stopColor="#0055ff" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <div className="hero-branding-elite">
          <h1 className="hero-main-title">
            <span className="thin">MERCHANT</span>
            <span className="bold">COPILOT</span>
          </h1>
          <div className="zenith-chip">
            <Cpu size={12} className="icon-cyan" />
            <span>ZENITH_V10.0_NEURAL_BACKBONE</span>
            <span className="pulse-dot-active" />
          </div>
        </div>
      </div>

      {/* ── Capabilities Matrix ────────────────────────── */}
      <div className="capability-grid-premium">
        {[
          { icon: <Zap />, label: "ZERO LATENCY", detail: "Near-instant sync across nodes.", color: "cyan" },
          { icon: <ShieldCheck />, label: "DATA FORTRESS", detail: "Military-grade data isolation.", color: "green" },
          { icon: <Activity />, label: "NEURAL PREDICT", detail: "Advanced sales forecasting.", color: "purple" },
          { icon: <Terminal />, label: "ZENITH CONSOLE", detail: "Next-gen merchant interface.", color: "gold" }
        ].map((node, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.04)' }}
            className={`capability-card-zenith glass ${node.color}`}
          >
            <div className="card-icon">{node.icon}</div>
            <div className="card-header-text">{node.label}</div>
            <p className="card-detail">{node.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Terminal Uplink ────────────────────────────────── */}
      <div className="terminal-uplink-container glass-heavy">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="t-dot red" />
            <span className="t-dot yellow" />
            <span className="t-dot green" />
          </div>
          <span className="terminal-title">ESTABLISH_DIRECT_UPLINK</span>
        </div>

        <div className="terminal-content">
          <p className="terminal-prompt">$ initiating secure_handshake --target hq</p>
          <p className="terminal-response">AUTHENTICATION_GRANTEED. READY_FOR_UPLINK.</p>

          <div className="uplink-actions-final">
            <button onClick={() => setShowContact(true)} className="uplink-btn-premium">
              <span className="btn-glow" />
              <span>EXECUTE_CALL_HQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Contact Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="contact-overlay"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="contact-modal glass-heavy"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-contact" onClick={() => setShowContact(false)}>
                <X size={20} />
              </button>

              <div className="contact-card-header">
                <User size={40} className="icon-cyan" />
                <h3>DEVELOPER_STATUS</h3>
              </div>

              <div className="contact-details-grid">
                <div className="detail-item">
                  <User size={16} className="detail-icon" />
                  <div className="detail-content">
                    <label>NAME</label>
                    <p>{contactInfo.name}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={16} className="detail-icon" />
                  <div className="detail-content">
                    <label>TEL</label>
                    <p>{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Mail size={16} className="detail-icon" />
                  <div className="detail-content">
                    <label>EMAIL</label>
                    <p>{contactInfo.email}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <MapPin size={16} className="detail-icon" />
                  <div className="detail-content">
                    <label>LOCATION</label>
                    <p>{contactInfo.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="zenith-footer">
        <div className="f-line" />
        <p>POWERED_BY_ZENITH_ENGINE <Heart size={10} className="icon-heart" /></p>
        <div className="version-tag-elite">0x7F2C | ENCRYPTED</div>
      </footer>
    </div>
  );
};

export default AboutView;
