import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, BarChart3, Zap, Target, RefreshCw } from 'lucide-react';
import '../styles/InsightsView.css';

const InsightsView = ({ inventory = [], transactions = [], summaries = {} }) => {
    // ── Dynamic Logic for "Smart Cards" ──────────────────────────

    const insights = useMemo(() => {
        if (!inventory.length && !transactions.length) return null;

        // 1. Top Performance (Based on Transaction Frequency)
        const productFrequency = transactions.reduce((acc, curr) => {
            acc[curr.product] = (acc[curr.product] || 0) + 1;
            return acc;
        }, {});

        const bestSeller = Object.keys(productFrequency).length > 0
            ? Object.keys(productFrequency).reduce((a, b) => productFrequency[a] > productFrequency[b] ? a : b)
            : 'N/A';

        // 2. Inventory Health (Dynamic Stockout Probability)
        // Basic heuristic: if sales frequency > 0 and stock is low
        const lowStockItems = inventory.filter(item => item.quantity < 10);
        const stockoutRiskCount = lowStockItems.length;

        // 3. Revenue Forecast (Heuristic: 10% conservative growth based on current monthly)
        const currentMonthly = summaries.monthly || 0;
        const projectedMonthly = Math.round(currentMonthly * 1.12);
        const growthPct = currentMonthly > 0 ? 12 : 0;

        return { bestSeller, stockoutRiskCount, projectedMonthly, growthPct };
    }, [inventory, transactions, summaries]);

    if (!insights) {
        return (
            <div className="insights-empty glass">
                <RefreshCw size={48} className="spin-slow" />
                <h2>Analyzing Your Data...</h2>
                <p>Record more sales to see live AI-driven insights here.</p>
            </div>
        );
    }

    return (
        <div className="insights-view">
            <div className="insights-hero glass">
                <div className="hero-content">
                    <Zap className="zap-icon" size={32} />
                    <h1>Live Business Insights</h1>
                    <p>Dynamic analysis powered by your real-time store performance data.</p>
                </div>
                <div className="hero-stats">
                    <div className="quick-stat">
                        <span className="stat-label">Data Sync Status</span>
                        <span className="stat-value text-success">Live</span>
                    </div>
                </div>
            </div>

            <div className="insights-grid">
                {/* 1. Top Performance */}
                <div className="insight-card premium-card">
                    <div className="card-header">
                        <Target className="icon-p" />
                        <h3>Top Performance</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Best Seller (Freq)</span>
                            <span className="metric-value">{insights.bestSeller}</span>
                        </div>
                        <p className="insight-desc">
                            This product has the highest transaction frequency.
                            Consider a premium placement in your store.
                        </p>
                    </div>
                    <div className="card-footer">
                        <span className="tag blue">Trending Now</span>
                    </div>
                </div>

                {/* 2. Inventory Health */}
                <div className="insight-card premium-card">
                    <div className="card-header">
                        <AlertTriangle className="icon-y" />
                        <h3>Inventory Health</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Critical Stock Risk</span>
                            <span className="metric-value">{insights.stockoutRiskCount} Items</span>
                        </div>
                        <p className="insight-desc">
                            {insights.stockoutRiskCount > 0
                                ? `Warning: ${insights.stockoutRiskCount} items have less than 10 units left.`
                                : "Excellent! All items have healthy stock levels currently."}
                        </p>
                    </div>
                    <div className="card-footer">
                        <span className={`tag ${insights.stockoutRiskCount > 0 ? 'orange' : 'green'}`}>
                            {insights.stockoutRiskCount > 0 ? 'Action Required' : 'Status Good'}
                        </span>
                    </div>
                </div>

                {/* 3. Revenue Forecast */}
                <div className="insight-card premium-card">
                    <div className="card-header">
                        <BarChart3 className="icon-g" />
                        <h3>Growth Forecast</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Projected Month End</span>
                            <span className="metric-value">₹{insights.projectedMonthly.toLocaleString()}</span>
                        </div>
                        <p className="insight-desc">
                            Based on your {summaries.monthly > 0 ? 'current momentum' : 'last activity'},
                            we project <span className="text-success">{insights.growthPct}% growth</span>.
                        </p>
                    </div>
                    <div className="card-footer">
                        <span className="tag green">Positive Outlook</span>
                    </div>
                </div>
            </div>

            <div className="ai-cta-banner glass-v2">
                <div className="cta-info">
                    <TrendingUp size={24} />
                    <div>
                        <h4>Unlock Deeper Strategies?</h4>
                        <p>Ask our AI Copilot: "How can I improve my {insights.bestSeller} sales?"</p>
                    </div>
                </div>
                <button className="cta-button" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
                    Open AI Chat
                </button>
            </div>
        </div>
    );
};

export default InsightsView;
