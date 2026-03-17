import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
];

const RevenueChart = () => {
    return (
        <div className="chart-container glass">
            <div className="chart-header">
                <h3>Revenue Overview</h3>
                <select className="chart-filter">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00baf2" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00baf2" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#00baf2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <style jsx>{`
        .chart-container {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .chart-header h3 { margin: 0; color: var(--secondary); font-size: 1.1rem; }
        .chart-filter {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          border: 1px solid #eee;
          font-size: 0.8rem;
          outline: none;
        }
      `}</style>
        </div>
    );
};

export default RevenueChart;
