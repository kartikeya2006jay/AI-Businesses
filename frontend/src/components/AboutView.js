import React from 'react';
import { Info, Mail, Github, Globe } from 'lucide-react';

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

            <style jsx>{`
        .about-view {
          display: flex;
          justify-content: center;
          padding: 2rem;
        }
        .about-card {
          max-width: 500px;
          width: 100%;
          padding: 3rem 2rem;
          text-align: center;
        }
        .brand-icon {
          width: 64px;
          height: 64px;
          background: var(--primary);
          color: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          margin: 0 auto 1.5rem;
        }
        h2 { margin-bottom: 0.5rem; color: var(--secondary); }
        .version { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
        .about-content { text-align: left; }
        .about-content p { color: #666; line-height: 1.6; }
        .feature-list { margin: 2rem 0; display: flex; flex-direction: column; gap: 0.8rem; }
        .feature-item { display: flex; align-items: center; gap: 0.8rem; color: #444; font-size: 0.9rem; }
        .dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; }
        .social-links {
          margin-top: 3rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }
        .social-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.05);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};

export default AboutView;
