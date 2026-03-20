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

      {/* Header */}
      <div className="view-header">
        <div>
          <h2>Sales Hub</h2>
          <p className="header-sub">Track and record all your sales transactions.</p>
        </div>
        <div className="sales-today-badge">
          <ShoppingBag size={16} />
          Today's Revenue:&nbsp;<span className="badge-amount">₹{summaries.daily || 0}</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="sales-layout">

        {/* LEFT — Transaction History */}
        <div className="sales-main">
          <div className="recent-transactions glass shadow-soft">
            <div className="list-header">
              <h3><History size={14} />Transaction History</h3>
              {history.length > 0 && (
                <span className="transaction-count-badge">{history.length} records</span>
              )}
            </div>

            <div className="transaction-list">
              {history.length > 0 ? (
                history.map((t, i) => (
                  <div key={i} className="transaction-item">
                    <div className="t-icon">
                      <Package size={15} />
                    </div>
                    <div className="t-details">
                      <span className="t-product">{t.product}</span>
                      <span className="t-date">
                        <Calendar size={11} />
                        {t.date}
                      </span>
                    </div>
                    <div className="t-amount">₹{t.amount}</div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><History size={44} /></div>
                  <p>No transactions yet.</p>
                  <span className="hint">Start recording sales to see them here!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Sale Form + Tip */}
        <div className="sales-sidebar">
          <SaleEntryForm inventory={inventory} onSaleSuccess={onSale} />

          <div className="sales-tips">
            <h3><TrendingUp size={13} />Sales Tip</h3>
            <p>
              Your best selling product is usually <strong>Cold Drinks</strong> during late
              afternoons. Consider keeping extra stock ready!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesView;
