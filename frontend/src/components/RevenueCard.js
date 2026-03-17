import React from 'react';

const RevenueCard = ({ title, amount, trend }) => {
    return (
        <div className="revenue-card glass">
            <div className="card-header">
                <span className="card-title">{title}</span>
                <span className={`trend ${trend.startsWith('+') ? 'up' : 'down'}`}>{trend}</span>
            </div>
            <div className="card-amount">₹{amount.toLocaleString()}</div>
            <div className="card-footer">vs previous period</div>

            <style jsx>{`
        .revenue-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #666;
        }
        .trend {
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        .trend.up { background: #e6f7ed; color: #15803d; }
        .trend.down { background: #fef2f2; color: #b91c1c; }
        .card-amount {
          font-size: 2rem;
          font-weight: 800;
          color: var(--secondary);
        }
        .card-footer {
          font-size: 0.8rem;
          color: #888;
        }
      `}</style>
        </div>
    );
};

export default RevenueCard;
