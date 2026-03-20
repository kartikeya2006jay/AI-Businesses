import React, { useState, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import '../styles/RevenueChart.css';

/* ── helpers ────────────────────────────────────────────── */
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Group an array of transactions into buckets.
 * @param {Array}  txns   – array of { date: "YYYY-MM-DD", amount: number, ... }
 * @param {string} range  – 'week' | 'month'
 * Returns [{ name, revenue, prev }]
 */
function buildChartData(txns, range) {
    if (!txns || txns.length === 0) return [];

    const now = new Date();

    if (range === 'week') {
        // last 7 days — one bucket per calendar day
        const buckets = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            buckets[key] = { name: DAY_LABELS[d.getDay()], revenue: 0, prev: 0 };
        }
        // previous 7-day window for "prev" baseline
        const prevBuckets = {};
        for (let i = 13; i >= 7; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            prevBuckets[d.toISOString().slice(0, 10)] =
                DAY_LABELS[d.getDay()];
        }

        txns.forEach(t => {
            const tDate = (t.date || '').slice(0, 10);
            if (buckets[tDate] !== undefined) {
                buckets[tDate].revenue += Number(t.amount) || 0;
            }
            // map prev day to same weekday slot
            const pDate = new Date(tDate);
            pDate.setDate(pDate.getDate() + 7);
            const pKey = pDate.toISOString().slice(0, 10);
            if (buckets[pKey] !== undefined) {
                buckets[pKey].prev += Number(t.amount) || 0;
            }
        });

        return Object.values(buckets);
    }

    // month — 4 weekly buckets
    const wkBuckets = [
        { name: 'Wk 1', revenue: 0, prev: 0 },
        { name: 'Wk 2', revenue: 0, prev: 0 },
        { name: 'Wk 3', revenue: 0, prev: 0 },
        { name: 'Wk 4', revenue: 0, prev: 0 },
    ];

    txns.forEach(t => {
        if (!t.date) return;
        const tDate = new Date(t.date);
        const msAgo = now - tDate;
        const daysAgo = msAgo / 86400000;
        const amt = Number(t.amount) || 0;

        if (daysAgo <= 7) wkBuckets[3].revenue += amt;
        else if (daysAgo <= 14) wkBuckets[2].revenue += amt;
        else if (daysAgo <= 21) wkBuckets[1].revenue += amt;
        else if (daysAgo <= 28) wkBuckets[0].revenue += amt;
        // prev period (29-56 days ago)
        else if (daysAgo <= 35) wkBuckets[3].prev += amt;
        else if (daysAgo <= 42) wkBuckets[2].prev += amt;
        else if (daysAgo <= 49) wkBuckets[1].prev += amt;
        else if (daysAgo <= 56) wkBuckets[0].prev += amt;
    });

    return wkBuckets;
}

/* ── Custom Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const current = payload.find(p => p.dataKey === 'revenue')?.value ?? 0;
        const prev = payload.find(p => p.dataKey === 'prev')?.value ?? 0;
        const diff = current - prev;
        const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null;
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">₹{current.toLocaleString()}</p>
                {pct !== null && (
                    <p className={`tooltip-diff ${diff >= 0 ? 'pos' : 'neg'}`}>
                        {diff >= 0 ? '▲' : '▼'} {Math.abs(pct)}% vs prev
                    </p>
                )}
                {prev > 0 && (
                    <p className="tooltip-prev">Prev: ₹{prev.toLocaleString()}</p>
                )}
            </div>
        );
    }
    return null;
};

/* ── Component ──────────────────────────────────────────── */
const RevenueChart = ({ transactions = [] }) => {
    const [range, setRange] = useState('week');

    const data = useMemo(() => buildChartData(transactions, range), [transactions, range]);

    const total = data.reduce((s, d) => s + d.revenue, 0);
    const prevTotal = data.reduce((s, d) => s + d.prev, 0);
    const growth = prevTotal > 0 ? (((total - prevTotal) / prevTotal) * 100).toFixed(1) : null;
    const isUp = growth === null || Number(growth) >= 0;
    const avgPerBucket = data.length > 0 ? Math.round(total / data.length) : 0;

    const isEmpty = total === 0;

    return (
        <div className="chart-container glass">
            {/* Header */}
            <div className="chart-header">
                <div className="chart-title-group">
                    <span className="chart-icon">📈</span>
                    <div>
                        <h3>Revenue Overview</h3>
                        <p className="chart-subtitle">
                            {isEmpty ? 'No transactions yet' : 'Compared to previous period'}
                        </p>
                    </div>
                </div>
                <select
                    className="chart-filter"
                    value={range}
                    onChange={e => setRange(e.target.value)}
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                </select>
            </div>

            {/* Stats Row */}
            <div className="chart-stats">
                <div className="chart-stat">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-num">₹{total.toLocaleString()}</span>
                </div>
                <div className="chart-stat-divider" />
                <div className="chart-stat">
                    <span className="stat-label">vs Prev Period</span>
                    {growth !== null ? (
                        <span className={`stat-badge ${isUp ? 'up' : 'down'}`}>
                            {isUp ? '▲' : '▼'} {Math.abs(growth)}%
                        </span>
                    ) : (
                        <span className="stat-badge neutral">No prev data</span>
                    )}
                </div>
                <div className="chart-stat-divider" />
                <div className="chart-stat">
                    <span className="stat-label">
                        Avg / {range === 'week' ? 'Day' : 'Week'}
                    </span>
                    <span className="stat-num">₹{avgPerBucket.toLocaleString()}</span>
                </div>
            </div>

            {/* Chart body */}
            {isEmpty ? (
                <div className="chart-empty">
                    <span>📭</span>
                    <p>No revenue data for this period.<br />Log a sale to see it here!</p>
                </div>
            ) : (
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00baf2" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#00baf2" stopOpacity={0.01} />
                                </linearGradient>
                                <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#764ba2" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.01} />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--glass-border)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: 'rgba(0,186,242,0.15)', strokeWidth: 2 }}
                            />

                            {/* Previous period dashed */}
                            <Area
                                type="monotone"
                                dataKey="prev"
                                stroke="#764ba2"
                                strokeWidth={2}
                                strokeDasharray="5 4"
                                fillOpacity={1}
                                fill="url(#gradPrev)"
                                dot={false}
                            />
                            {/* Current period bold */}
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#00baf2"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#gradCurrent)"
                                dot={{ r: 4, fill: '#00baf2', stroke: 'white', strokeWidth: 2 }}
                                activeDot={{ r: 7, fill: '#00baf2', stroke: 'white', strokeWidth: 2, filter: 'url(#glow)' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Legend */}
            {!isEmpty && (
                <div className="chart-legend">
                    <span className="legend-item current">
                        <span className="legend-dot" />
                        Current Period
                    </span>
                    <span className="legend-item prev">
                        <span className="legend-dot dashed" />
                        Previous Period
                    </span>
                    <span className="chart-live-badge">🟢 Live</span>
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
