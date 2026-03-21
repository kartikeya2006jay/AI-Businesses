import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Wallet, Calendar, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import axios from 'axios';
import '../styles/ReportsView.css';

const ReportsView = () => {
    const [pnL, setPnL] = useState(null);
    const [eod, setEod] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [pnlRes, eodRes] = await Promise.all([
                axios.get('http://localhost:8000/reports/profit-loss'),
                axios.get('http://localhost:8000/reports/eod')
            ]);
            setPnL(pnlRes.data);
            setEod(eodRes.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="reports-view">Calculating Reports...</div>;

    return (
        <div className="reports-view">
            <div className="khata-header">
                <h2><TrendingUp size={32} /> Business Performance</h2>
            </div>

            <div className="reports-grid">
                <div className="report-card">
                    <h3><BarChart3 size={18} /> Monthly Net Profit</h3>
                    <div className={`report-value ${pnL.net_profit >= 0 ? 'profit' : 'loss'}`}>
                        ₹{pnL.net_profit.toLocaleString()}
                    </div>
                    <div className="report-detail">
                        Profit Margin: <strong>{pnL.margin.toFixed(1)}%</strong>
                    </div>
                </div>

                <div className="report-card">
                    <h3><Wallet size={18} /> Revenue vs Expenses</h3>
                    <div className="report-detail" style={{ marginBottom: '0.4rem' }}>
                        Monthly Revenue: <span style={{ color: '#10b981', fontWeight: 700 }}>₹{pnL.revenue.toLocaleString()}</span>
                    </div>
                    <div className="report-detail">
                        Monthly Expenses: <span style={{ color: '#ef4444', fontWeight: 700 }}>₹{pnL.expenses.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="eod-summary">
                <h3><Calendar size={18} /> End-of-Day Summary ({eod.date})</h3>
                <div className="eod-rows">
                    <div className="eod-row">
                        <span>Total Sales Today</span>
                        <span>₹{eod.total_sales.toLocaleString()}</span>
                    </div>
                    <div className="eod-row cash">
                        <span><ArrowUpRight size={14} /> Cash Sales</span>
                        <span>+₹{eod.cash_sales.toLocaleString()}</span>
                    </div>
                    <div className="eod-row credit">
                        <span><ArrowRight size={14} /> Credit Sales (Udhaar)</span>
                        <span>₹{eod.credit_sales.toLocaleString()}</span>
                    </div>
                    <div className="eod-row expense">
                        <span><ArrowDownRight size={14} /> Expenses Today</span>
                        <span>-₹{eod.total_expenses.toLocaleString()}</span>
                    </div>
                    <div className="eod-row" style={{ borderTop: '2px solid var(--glass-border)', paddingTop: '1rem' }}>
                        <span>Net Cash in Hand</span>
                        <span style={{ color: eod.net_cash_flow >= 0 ? '#10b981' : '#ef4444' }}>
                            ₹{eod.net_cash_flow.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;
