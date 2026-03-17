import React from 'react';
import { Info, Mail, Github, Globe } from 'lucide-react';
import '../styles/AboutView.css';

const AboutView = () => {
  return (
    <div className="about-view">
      <div className="about-card glass">
        <div className="brand-icon">M</div>
        <h2>Merchant Copilot</h2>
        <p className="version">Version 1.0.0 (Premium)</p>

        <div className="about-content">
          <p>Merchant Copilot is an AI-powered assistant designed for small business owners to manage sales, track inventory, and get real-time business insights.</p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="dot"></div>
              <span>AI-driven sales forecasting</span>
            </div>
            <div className="feature-item">
              <div className="dot"></div>
              <span>Automated inventory deduction</span>
            </div>
            <div className="feature-item">
              <div className="dot"></div>
              <span>Revenue summaries (Daily, Weekly, Monthly)</span>
            </div>
          </div>

          <div className="social-links">
            <button className="social-btn"><Mail size={20} /></button>
            <button className="social-btn"><Github size={20} /></button>
            <button className="social-btn"><Globe size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
