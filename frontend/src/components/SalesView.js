import React, { useState, useEffect } from 'react';
import SaleEntryForm from './SaleEntryForm';
import { ShoppingBag, TrendingUp, History, Calendar, Package } from 'lucide-react';
import { getTransactions } from '../services/api';
import '../styles/SalesView.css';

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

    </div>
  );
};

export default SalesView;
