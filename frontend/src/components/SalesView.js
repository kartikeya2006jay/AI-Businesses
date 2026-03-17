import React, { useState, useEffect } from 'react';
import SaleEntryForm from './SaleEntryForm';
import { ShoppingBag, TrendingUp, History, Calendar, Package } from 'lucide-react';
import { getTransactions } from '../services/api';

const SalesView = ({ inventory, fetchData, summaries }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await getTransactions();
      setHistory(res.data.reverse());
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const onSale = () => {
    fetchData();
    loadTransactions();
  };

  return (
    <div className="sales-view">
      <div className="sales-layout">
        <div className="sales-main">
          <div className="view-header">
            <h2>Sales Hub</h2>
            <div className="sales-stats glass">
              <div className="stat">
                <ShoppingBag size={18} />
                <span>Today's Sales: ₹{summaries.daily}</span>
              </div>
            </div>
          </div>

          <div className="recent-transactions glass">
            <div className="list-header">
              <h3><History size={18} /> Recent Activity</h3>
            </div>

            <div className="transaction-list">
              {history.length > 0 ? (
                history.map((t, i) => (
                  <div key={i} className="transaction-item">
                    <div className="t-icon">
                      <Package size={16} />
                    </div>
                    <div className="t-details">
                      <span className="t-product">{t.product}</span>
                      <span className="t-date"><Calendar size={12} /> {t.date}</span>
                    </div>
                    <div className="t-amount">₹{t.amount}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <History size={48} />
                  <p>No recent transactions to show.</p>
                  <span className="hint">Start recording sales to see them here!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sales-sidebar">
          <SaleEntryForm inventory={inventory} onSaleSuccess={onSale} />

          <div className="sales-tips glass">
            <h3><TrendingUp size={18} /> Sales Tip</h3>
            <p>Your best selling product is usually <strong>Cold Drinks</strong> during late afternoons. Consider keeping extra stock!</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sales-view { padding: 1rem; }
        .sales-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1rem;
          font-weight: 600;
          color: var(--primary);
        }
        .recent-transactions {
          min-height: 400px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .list-header h3 { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 1.5rem; font-size: 1.1rem; }
        .transaction-list { flex: 1; }
        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.2s;
        }
        .transaction-item:hover { background: rgba(0, 186, 242, 0.02); }
        .t-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .t-details { flex: 1; display: flex; flex-direction: column; }
        .t-product { font-weight: 600; color: var(--secondary); margin-bottom: 0.2rem; }
        .t-date { font-size: 0.75rem; color: #999; display: flex; align-items: center; gap: 0.3rem; }
        .t-amount { font-weight: 700; color: var(--primary); font-size: 1.1rem; }
        
        .empty-state {
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          text-align: center;
        }
        .empty-state p { margin: 1rem 0 0.5rem; font-weight: 600; color: #666; }
        .empty-state .hint { font-size: 0.8rem; }
        .sales-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
        .sales-tips { padding: 1.5rem; }
        .sales-tips h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; margin-top: 0; color: var(--primary); }
        .sales-tips p { font-size: 0.9rem; color: #666; line-height: 1.5; margin-bottom: 0; }
      `}</style>
    </div>
  );
};

export default SalesView;
