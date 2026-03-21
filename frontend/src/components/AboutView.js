import React from 'react';
import { Mail, Github, Globe, ShieldCheck, Rocket, Heart, Award, Zap, Users, CheckCircle } from 'lucide-react';
import '../styles/AboutView.css';

const AboutView = () => {
  return (
    <div className="about-view app-root">
      <div className="about-hero glass">
        <div className="brand-logo-large">M</div>
        <h1>Merchant Copilot</h1>
        <p className="subtitle">Precision AI for the neighborhood merchant. Empowering the heartbeat of India's commerce with modern intelligence.</p>
        <div className="badge-row">
          <span className="premium-badge"><Award size={16} /> Premium Edition</span>
          <span className="version-pill">v1.2.0 • Stable</span>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-section glass">
          <div className="section-title">
            <Rocket size={24} className="icon-blue" />
            <h3>Our Mission</h3>
          </div>
          <p>We provide street-smart AI tools for the modern merchant. Our mission is to bridge the gap between traditional retail and cutting-edge technology, making business management a "no-brainer" for everyone from kirana stores to boutiques.</p>
        </div>

        <div className="about-section glass">
          <div className="section-title">
            <ShieldCheck size={24} className="icon-green" />
            <h3>Privacy & Security</h3>
          </div>
          <p>Your business data is yours alone. We use secure, local-first data processing and anonymized AI protocols to ensure your financial insights remain confidential and protected at all times.</p>
        </div>

        <div className="about-section glass">
          <div className="section-title">
            <Zap size={24} className="icon-blue" />
            <h3>AI-First Approach</h3>
          </div>
          <p>Leveraging state-of-the-art Large Language Models and computer vision to automate inventory, predict sales, and provide real-time business advisory that used to require a fleet of analysts.</p>
        </div>

        <div className="about-section glass">
          <div className="section-title">
            <Users size={24} className="icon-green" />
            <h3>Community Rooted</h3>
          </div>
          <p>Designed specifically for the Indian market, supporting local workflows like Khata management, GST handling, and multi-modal sales entry that fits the fast-paced retail environment.</p>
        </div>
      </div>

      <div className="about-footer glass">
        <h3>Built with <Heart size={24} className="icon-heart" /> for Merchants</h3>
        <p>Have feedback or need custom features? Our developers are just a click away.</p>

        <div className="social-links">
          <a href="mailto:support@merchantcopilot.ai" className="social-link" title="Email Us">
            <Mail size={24} />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="social-link" title="Follow Progress">
            <Github size={24} />
          </a>
          <a href="https://paytm.com" target="_blank" rel="noreferrer" className="social-link" title="Visit Website">
            <Globe size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
