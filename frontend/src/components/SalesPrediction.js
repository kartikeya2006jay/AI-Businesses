import React from 'react';
import '../styles/SalesPrediction.css';

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
        </div>
    );
};

export default SalesPrediction;
