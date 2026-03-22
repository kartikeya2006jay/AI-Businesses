import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, ShoppingBag, Calendar, Award, UserCheck, Zap, Activity, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCustomerAnalytics } from '../services/api';
import '../styles/CustomersView.css';

const CustomersView = () => {
    const [data, setData] = useState({ recent_customers: [], stats: { total_unique: 0, monthly_revenue: 0 } });
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
        const { recent_customers, stats } = data;
        if (!recent_customers.length) return [];

        // Performance segments (Professional tiers based on spend)
        const high = recent_customers.filter(c => c.total_spend >= 1000).length;
        const mid = recent_customers.filter(c => c.total_spend >= 500 && c.total_spend < 1000).length;
        const base = recent_customers.filter(c => c.total_spend < 500).length;

        return [
            { name: 'High Value', value: high, color: '#0ea5e9' },
            { name: 'Mid Range', value: mid, color: '#3b82f6' },
            { name: 'Occasional', value: base, color: '#94a3b8' },
        ].filter(d => d.value > 0);
    }, [data.recent_customers]);

    if (loading) return <div className="customers-view"><p className="loading-text">Loading customer activity monitor…</p></div>;

    const { recent_customers, stats } = data;
    const top3 = recent_customers.slice(0, 3);

    return (
        <div className="customers-view animate-in">
            {/* ── Header ── */}
            <div className="customers-header">
                <div className="title-area">
                    <div className="icon-box"><Activity size={24} /></div>
                    <div>
                        <h1>Customer Activity Monitor</h1>
                        <p>Showing active profiles from the last 10 days</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="h-stat-card glass">
                        <span className="h-label">Monthly Reach</span>
                        <span className="h-value">{stats.total_unique}</span>
                    </div>
                    <div className="h-stat-card glass">
                        <span className="h-label">Monthly Gross</span>
                        <span className="h-value">₹{stats.monthly_revenue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* ── Top Section: Recent Performance ── */}
            <div className="customer-insights-row">
                {/* Active Spotlight */}
                <div className="vip-spotlight glass">
                    <div className="section-head">
                        <TrendingUp size={18} color="#0ea5e9" />
                        <h2>Recent High-Activity</h2>
                    </div>
                    <div className="vip-cards">
                        {top3.length > 0 ? top3.map((c, i) => (
                            <div key={c.customer_name} className="vip-card">
                                <div className="vip-avatar">
                                    {c.customer_name[0].toUpperCase()}
                                </div>
                                <div className="vip-info">
                                    <span className="vip-name">{c.customer_name}</span>
                                    <span className="vip-meta">₹{c.total_spend.toLocaleString()} (Recent)</span>
                                </div>
                                <div className="vip-status-tag">
                                    <UserCheck size={12} /> Active
                                </div>
                            </div>
                        )) : (
                            <div className="empty-sub">No recent activity detected.</div>
                        )}
                    </div>
                </div>

                {/* Activity Mix Chart */}
                <div className="loyalty-mix glass">
                    <div className="section-head">
                        <BarChart3 size={18} color="#3b82f6" />
                        <h2>Activity Mix (Month)</h2>
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

            {/* ── Main Customer List (Filtered to 10 days) ── */}
            <div className="customers-list-card glass">
                <div className="section-head">
                    <Calendar size={18} />
                    <h2>Active Roster (Rolling 10-Day)</h2>
                </div>
                <div className="table-responsive">
                    <table className="loyalty-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Transactions</th>
                                <th>Total Value</th>
                                <th>Average Checkout</th>
                                <th>Last Seen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_customers.length > 0 ? recent_customers.map((c, i) => (
                                <tr key={c.customer_name} style={{ animationDelay: `${i * 0.05}s` }}>
                                    <td className="name-cell">
                                        <div className="name-avatar">{c.customer_name[0].toUpperCase()}</div>
                                        <span>{c.customer_name}</span>
                                    </td>
                                    <td className="center-cell">{c.transaction_count}</td>
                                    <td className="equity-cell">₹{c.total_spend.toLocaleString()}</td>
                                    <td>₹{c.avg_order_value.toLocaleString()}</td>
                                    <td className="date-cell">{c.last_purchase}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty-cell">No customer data available for the selected period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersView;
