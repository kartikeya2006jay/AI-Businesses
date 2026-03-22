import React, { useState, useEffect, useMemo } from 'react';
import { Users, Crown, TrendingUp, ShoppingBag, Calendar, Award, Star, UserCheck, ShieldCheck, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCustomerAnalytics } from '../services/api';
import '../styles/CustomersView.css';

const tierConfig = {
    Gold: { emoji: '🥇', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <ShieldCheck size={14} /> },
    Silver: { emoji: '🥈', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: <Award size={14} /> },
    Bronze: { emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.1)', icon: <UserCheck size={14} /> },
};

const CustomersView = () => {
    const [data, setData] = useState({ customers: [], total_unique: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getCustomerAnalytics();
                setData(res.data);
            } catch (err) {
                console.error('Error fetching customer analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const chartData = useMemo(() => {
        const counts = { Gold: 0, Silver: 0, Bronze: 0 };
        data.customers.forEach(c => {
            if (counts[c.tier] !== undefined) counts[c.tier]++;
        });
        return [
            { name: 'VIP (Gold)', value: counts.Gold, color: '#f59e0b' },
            { name: 'Loyal (Silver)', value: counts.Silver, color: '#3b82f6' },
            { name: 'Regular (Bronze)', value: counts.Bronze, color: '#94a3b8' },
        ].filter(d => d.value > 0);
    }, [data.customers]);

    if (loading) return <div className="customers-view"><p className="loading-text">Analyzing your high-value shoppers…</p></div>;

    const { customers, total_unique } = data;
    const top3 = customers.slice(0, 3);
    const totalRevenue = customers.reduce((s, c) => s + c.total_spend, 0);
    const avgAov = customers.length > 0
        ? (customers.reduce((s, c) => s + c.avg_order_value, 0) / customers.length).toFixed(0)
        : 0;

    return (
        <div className="customers-view animate-in">
            {/* ── Header ── */}
            <div className="customers-header">
                <div className="title-area">
                    <div className="icon-box"><Users size={24} /></div>
                    <div>
                        <h1>Customer Intelligence</h1>
                        <p>Real-time loyalty & behavior analysis</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="h-stat-card glass">
                        <span className="h-label">Unique Customers</span>
                        <span className="h-value">{total_unique}</span>
                    </div>
                    <div className="h-stat-card glass">
                        <span className="h-label">Retention Revenue</span>
                        <span className="h-value">₹{totalRevenue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* ── Top Section: VIP Spotlight & Mix ── */}
            <div className="customer-insights-row">
                {/* VIP Spotlight */}
                <div className="vip-spotlight glass">
                    <div className="section-head">
                        <Crown size={18} color="#f59e0b" />
                        <h2>VIP Spotlight</h2>
                    </div>
                    <div className="vip-cards">
                        {top3.map((c, i) => (
                            <div key={c.customer_name} className={`vip-card rank-${i + 1}`}>
                                <div className="vip-avatar">
                                    {c.customer_name[0].toUpperCase()}
                                    <div className="rank-crown">{i === 0 ? '👑' : i + 1}</div>
                                </div>
                                <div className="vip-info">
                                    <span className="vip-name">{c.customer_name}</span>
                                    <span className="vip-meta">₹{c.total_spend.toLocaleString()} spent</span>
                                </div>
                                <div className="vip-tier-tag" style={{ color: tierConfig[c.tier]?.color }}>
                                    {tierConfig[c.tier]?.icon} {c.tier}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loyalty Mix Chart */}
                <div className="loyalty-mix glass">
                    <div className="section-head">
                        <Zap size={18} color="#3b82f6" />
                        <h2>Loyalty Mix</h2>
                    </div>
                    <div className="chart-container-inner">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {chartData.map(d => (
                                <div key={d.name} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: d.color }}></span>
                                    <span className="name">{d.name}</span>
                                    <span className="val">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Customer List ── */}
            <div className="customers-list-card glass">
                <div className="section-head">
                    <Award size={18} />
                    <h2>Full Customer Roster</h2>
                </div>
                <div className="table-responsive">
                    <table className="loyalty-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Loyalty Status</th>
                                <th>Visit Frequency</th>
                                <th>Total Equity</th>
                                <th>Last Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c, i) => (
                                <tr key={c.customer_name} style={{ animationDelay: `${i * 0.05}s` }}>
                                    <td className="name-cell">
                                        <div className="name-avatar">{c.customer_name[0].toUpperCase()}</div>
                                        <span>{c.customer_name}</span>
                                    </td>
                                    <td>
                                        <span className="tier-badge" style={{
                                            color: tierConfig[c.tier]?.color,
                                            background: tierConfig[c.tier]?.bg
                                        }}>
                                            {tierConfig[c.tier]?.icon} {c.tier}
                                        </span>
                                    </td>
                                    <td className="freq-cell">
                                        <span className="count">{c.transaction_count}</span>
                                        <span className="lbl">purchases</span>
                                    </td>
                                    <td className="equity-cell">₹{c.total_spend.toLocaleString()}</td>
                                    <td className="date-cell">{c.last_purchase}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersView;
