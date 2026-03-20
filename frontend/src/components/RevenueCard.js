import React from 'react';
import '../styles/RevenueCard.css';

const RevenueCard = ({ title, amount, trend }) => {
  const isPos = String(trend).startsWith('+');
  return (
    <div className="revenue-card glass shadow-bold">
      <div className="card-glare"></div>
      <p className="card-title">{title}</p>
      <div className="card-amount-row">
        <h2 className="card-amount">₹{Number(amount).toLocaleString()}</h2>
        <span className={`card-trend ${isPos ? 'pos' : 'neg'}`}>
          {isPos ? '↑' : '↓'} {trend}
        </span>
      </div>
      <div className="card-progress-bar">
        <div className="progress-fill" style={{ width: '70%', background: isPos ? 'var(--success)' : 'var(--accent)' }}></div>
      </div>
    </div>
  );
};

export default RevenueCard;
