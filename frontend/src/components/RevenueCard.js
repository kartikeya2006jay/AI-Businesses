import React from 'react';
import '../styles/RevenueCard.css';

const RevenueCard = ({ title, amount, trend }) => {
  return (
    <div className="revenue-card glass">
      <div className="card-header">
        <span className="card-title">{title}</span>
        <span className={`trend ${trend.startsWith('+') ? 'up' : 'down'}`}>
          {trend}
        </span>
      </div>
      <div className="card-amount">₹{amount.toLocaleString()}</div>
      <div className="card-footer">
        <div className="indicator"></div>
        <span>Updated just now</span>
      </div>
    </div>
  );
};

export default RevenueCard;
