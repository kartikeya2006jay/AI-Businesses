import React from 'react';

const SalesPrediction = () => {
    return (
        <div className="prediction-card glass">
            <h3>AI Sales Prediction</h3>
            <div className="prediction-content">
                <div className="metric">
                    <span>Expected Tomorrow</span>
                    <strong>₹1,250</strong>
                </div>
                <div className="insight">
                    💡 Demand for <strong>cold drinks</strong> is expected to rise by 20% due to warmer weather.
                </div>
            </div>
            <style jsx>{`
        .prediction-card h3 { margin-bottom: 1.5rem; color: var(--secondary); }
        .metric { display: flex; flex-direction: column; margin-bottom: 1rem; }
        .metric span { font-size: 0.9rem; color: #666; }
        .metric strong { font-size: 1.5rem; color: #15803d; }
        .insight {
          padding: 1rem;
          background: rgba(0, 186, 242, 0.05);
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
        }
      `}</style>
        </div>
    );
};

export default SalesPrediction;
