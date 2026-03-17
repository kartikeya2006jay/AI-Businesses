import React from 'react';
import { Mail, Github, Globe, ShieldCheck, Rocket, Heart, Award } from 'lucide-react';
import '../styles/AboutView.css';

const AboutView = () => {
  return (
    <div className="about-view">
      <div className="about-hero glass">
        <div className="brand-logo-large">M</div>
        <h1>Merchant Copilot</h1>
        <p className="subtitle">Empowering the heartbeat of India's commerce.</p>
        <div className="badge-row">
          <span className="premium-badge"><Award size={14} /> Premium Edition</span>
          <span className="version-pill">v1.2.0</span>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-section glass">
          <div className="section-title">
            <Rocket size={20} className="icon-blue" />
            <h3>Our Mission</h3>
          </div>
          <p>We provide street-smart AI tools for the modern merchant. Our mission is to bridge the gap between traditional retail and cutting-edge technology, making business management a "no-brainer" for everyone from kirana stores to boutiques.</p>
        </div>

        <div className="about-section glass">
          <div className="section-title">
            <ShieldCheck size={20} className="icon-green" />
            <h3>Privacy & Security</h3>
          </div>
          <p>Your business data is yours alone. We use secure, local-first data processing and anonymized AI protocols to ensure your financial insights remain confidential and protected at all times.</p>
        </div>
      </div>

      <div className="about-footer glass">
        <h3>Built with <Heart size={18} className="icon-heart" /> for Merchants</h3>
        <p>Have feedback or need custom features? Connect with the developers.</p>
        <div className="social-links">
          <a href="mailto:support@merchantcopilot.ai" className="social-link" title="Email Us">
            <Mail size={22} />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link" title="Follow Progress">
            <Github size={22} />
          </a>
          <a href="https://paytm.com" target="_blank" rel="noreferrer" className="social-link" title="Visit Website">
            <Globe size={22} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
