import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Banknote } from 'lucide-react';
import { getCashDrawer } from '../services/api';
import '../styles/CashDrawer.css';

const CashDrawer = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getCashDrawer();
                setData(res.data);
            } catch (err) {
                console.error('Error fetching cash drawer', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="cash-drawer-card glass"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading cash drawer…</p></div>;
    if (!data) return null;

    const flows = [
        { label: 'Opening Balance', value: data.opening_balance, type: 'neutral', icon: <Wallet size={16} /> },
        { label: 'Cash Sales', value: data.cash_sales, type: 'inflow', icon: <ArrowUpRight size={16} /> },
        { label: 'Credit Sales (Udhaar)', value: data.credit_sales, type: 'credit', icon: <Clock size={16} /> },
        { label: 'Expenses', value: data.expenses, type: 'outflow', icon: <ArrowDownRight size={16} /> },
    ];

    const isPositive = data.closing_balance >= data.opening_balance;

    return (
        <div className="cash-drawer-card glass shadow-soft">
            <div className="cd-header">
                <div className="cd-title">
                    <Banknote size={18} />
                    <span>Daily Cash Drawer</span>
                </div>
                <span className="cd-date">{data.date}</span>
            </div>

            <div className="cd-flow-list">
                {flows.map((f, i) => (
                    <div key={i} className={`cd-flow-item ${f.type}`}>
                        <div className="cd-flow-icon">{f.icon}</div>
                        <span className="cd-flow-label">{f.label}</span>
                        <span className="cd-flow-value">
                            {f.type === 'inflow' && '+'}
                            {f.type === 'outflow' && '-'}
                            ₹{f.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            <div className="cd-divider" />

            <div className={`cd-closing ${isPositive ? 'positive' : 'negative'}`}>
                <div className="cd-closing-label">
                    <TrendingUp size={18} />
                    Closing Balance
                </div>
                <div className="cd-closing-value">₹{data.closing_balance.toLocaleString()}</div>
            </div>
        </div>
    );
};

export default CashDrawer;
