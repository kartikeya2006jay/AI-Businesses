import React, { useState, useEffect } from 'react';
import SaleEntryForm from './SaleEntryForm';
import { ShoppingBag, TrendingUp, History, Calendar, Package, Sparkles, RefreshCw } from 'lucide-react';
import { getTransactions, getSalesTip } from '../services/api';
import '../styles/SalesView.css';

const SalesView = ({ inventory, fetchData, summaries }) => {
  const [history, setHistory] = useState([]);
  const [tip, setTip] = useState(null);
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    loadTransactions();
    fetchTip();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await getTransactions();
      setHistory(res.data.reverse());
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const fetchTip = async () => {
    setLoadingTip(true);
    try {
      const res = await getSalesTip();
      setTip(res.data.tip);
    } catch (error) {
      console.error("Error fetching sales tip:", error);
      setTip("Focus on your best-sellers to ensure they never go out of stock!");
    } finally {
      setLoadingTip(false);
    }
  };

  const onSale = () => {
    fetchData();
    loadTransactions();
  };

  return (
    <div className="sales-view app-root">

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
              <h3><History size={16} />Transaction History</h3>
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

          <div className={`sales-tips glass ai-tip-card ${loadingTip ? 'loading' : ''}`}>
            <div className="tip-header">
              <h3><Sparkles size={16} className="sparkle-icon" /> AI Sales Tip</h3>
              <button
                className="refresh-tip-btn"
                onClick={fetchTip}
                disabled={loadingTip}
                title="Refresh Insight"
              >
                <RefreshCw size={14} className={loadingTip ? 'spin' : ''} />
              </button>
            </div>
            {loadingTip ? (
              <div className="tip-loading-state">
                <div className="pulse-skeleton"></div>
                <div className="pulse-skeleton short"></div>
              </div>
            ) : (
              <p className="tip-content">
                {tip || "Analyzing your business data for the perfect insight..."}
              </p>
            )}
            <div className="ai-badge">Powered by Merchant AI</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesView;
