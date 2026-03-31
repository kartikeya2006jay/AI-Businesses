import React, { useState, useEffect } from 'react';
import { BookOpen, User, IndianRupee, Clock, CheckCircle, Search, Filter, ArrowRight, ShieldAlert, TrendingUp, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLending, payLending } from '../services/api';
import '../styles/LendingView.css';

const LendingView = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [payModal, setPayModal] = useState(null); // { customer_name, balance }
    const [payAmount, setPayAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await getLending();
            setRecords(res.data);
        } catch (err) {
            console.error("Failed to fetch lending records", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await payLending({
                customer_name: payModal.customer_name,
                amount_paid: parseFloat(payAmount)
            });
            setPayModal(null);
            setPayAmount('');
            fetchRecords();
        } catch (err) {
            alert("Payment failed: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRecords = records.filter(r =>
        r.customer_name.toLowerCase().includes(search.toLowerCase()) && r.balance > 0
    );

    const totalOutstanding = records.reduce((sum, r) => sum + (r.balance > 0 ? r.balance : 0), 0);
    const criticalLendings = records.filter(r => r.balance > 5000).length;

    return (
        <div className="lending-view app-root">
            {/* ── HEADER ── */}
            <div className="lending-header">
                <div className="header-left">
                    <h2>Neural Khata Ledger</h2>
                    <p className="header-sub">Monitor decentralized credit assets and settlement cycles.</p>
                </div>

                <div className="lending-stats glass shadow-soft">
                    <div className="quick-stat">
                        <IndianRupee size={16} />
                        <span className="stat-label">System Exposure</span>
                        <span className="stat-val highlight">₹{totalOutstanding.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* ── STATS CARDS ── */}
            <div className="lending-stats-row">
                <div className="stat-card glass shadow-soft">
                    <div className="stat-icon"><BookOpen size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{records.filter(r => r.balance > 0).length}</span>
                        <span className="stat-label">Active Udhaar Accounts</span>
                    </div>
                </div>
                <div className="stat-card glass shadow-soft warning">
                    <div className="stat-icon"><ShieldAlert size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{criticalLendings}</span>
                        <span className="stat-label">High-Value Exposures (&gt;₹5k)</span>
                    </div>
                </div>
                <div className="stat-card glass shadow-soft">
                    <div className="stat-icon"><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">₹{(totalOutstanding / records.length || 0).toFixed(0)}</span>
                        <span className="stat-label">Average Balance / Client</span>
                    </div>
                </div>
            </div>

            {/* ── SEARCH & FILTER ── */}
            <div className="search-controls glass shadow-soft">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search ledger by individual name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* ── RECORDS GRID ── */}
            {loading ? (
                <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <span>Syncing Ledger Data…</span>
                </div>
            ) : (
                <div className="records-grid">
                    <AnimatePresence>
                        {filteredRecords.map((record, idx) => (
                            <motion.div
                                key={record.customer_name}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="record-card glass shadow-soft"
                            >
                                <div className="card-top">
                                    <div className="user-icon">
                                        <User size={24} />
                                    </div>
                                    <div className="user-info">
                                        <h3>{record.customer_name}</h3>
                                        <span className="last-tx">
                                            <Clock size={11} style={{ marginRight: 6 }} />
                                            Active: {record.last_transaction}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-amount">
                                    <span className="label">Asset Exposure</span>
                                    <span className="value">₹{record.balance.toLocaleString()}</span>
                                </div>
                                <button
                                    className="pay-btn"
                                    onClick={() => setPayModal(record)}
                                >
                                    Record Liquidation
                                    <ArrowRight size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredRecords.length === 0 && !loading && (
                        <div className="empty-state glass col-span-all">
                            <BookOpen size={48} />
                            <p>No active credit records identified for search parameters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── PAYMENT MODAL (RESTORED WITH PREMIUM LOOK) ── */}
            <AnimatePresence>
                {payModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="modal glass shadow-bold"
                        >
                            <div className="modal-header">
                                <div className="header-icon"><IndianRupee size={18} /></div>
                                <h3>Settlement Entry</h3>
                                <button className="close-btn" onClick={() => setPayModal(null)}><X size={18} /></button>
                            </div>

                            <div className="settlement-preview">
                                <p>Recording liquidation for <strong>{payModal.customer_name}</strong></p>
                                <div className="outstanding-pill">Exposure: ₹{payModal.balance}</div>
                            </div>

                            <form onSubmit={handlePayment} className="edit-form">
                                <div className="form-group ink-border">
                                    <label>Liquidation Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        max={payModal.balance}
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        placeholder="Enter settlement amount..."
                                        autoFocus
                                    />
                                    <p className="input-hint">Maximum allowable: ₹{payModal.balance}</p>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="action-btn" style={{ width: 'auto', padding: '0.8rem 1.5rem' }} onClick={() => setPayModal(null)}>Cancel</button>
                                    <button type="submit" className="save-btn" disabled={submitting}>
                                        {submitting ? <Loader2 size={18} className="spin" /> : 'Confirm Liquidation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LendingView;
