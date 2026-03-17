import React from 'react';
import { TrendingUp, AlertTriangle, BarChart3, ArrowUpRight, Zap, Target } from 'lucide-react';
import '../styles/InsightsView.css';

const InsightsView = ({ inventory, transactions, summaries }) => {
    // Basic logic for "Smart Cards"
    const lowStockCount = inventory.filter(item => item.quantity < 15).length;
    const topProduct = transactions.length > 0 ?
        transactions.reduce((acc, curr) => {
            acc[curr.product] = (acc[curr.product] || 0) + 1;
            return acc;
        }, {}) : {};

    const bestSeller = Object.keys(topProduct).reduce((a, b) => topProduct[a] > topProduct[b] ? a : b, 'N/A');

    return (
        <div className="insights-view">
            <div className="insights-hero glass">
                <div className="hero-content">
                    <Zap className="zap-icon" size={32} />
                    <h1>AI Insights Hub</h1>
                    <p>Harness the power of AI to optimize your business operations and maximize profit.</p>
                </div>
                <div className="hero-stats">
                    <div className="quick-stat">
                        <span className="stat-label">AI Confidence</span>
                        <span className="stat-value">98.4%</span>
                    </div>
                </div>
            </div>

            <div className="insights-grid">
                <div className="insight-card premium-card">
                    <div className="card-header">
                        <Target className="icon-p" />
                        <h3>Top Performance</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Best Selling Product</span>
                            <span className="metric-value">{bestSeller}</span>
                        </div>
                        <p className="insight-desc">This product accounts for the majority of your daily traffic. Consider bundle offers.</p>
                    </div>
                    <div className="card-footer">
                        <span className="tag blue">High Demand</span>
                    </div>
                </div>

                <div className="insight-card premium-card">
                    <div className="card-header">
                        <AlertTriangle className="icon-y" />
                        <h3>Inventory Health</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Items Needing Restock</span>
                            <span className="metric-value">{lowStockCount}</span>
                        </div>
                        <p className="insight-desc">Probability of stockout for these items is <span className="text-warning">85%</span> within 3 days.</p>
                    </div>
                    <div className="card-footer">
                        <span className="tag orange">Action Required</span>
                    </div>
                </div>

                <div className="insight-card premium-card">
                    <div className="card-header">
                        <BarChart3 className="icon-g" />
                        <h3>Revenue Forecast</h3>
                    </div>
                    <div className="card-body">
                        <div className="insight-metric">
                            <span className="metric-label">Estimated Monthly</span>
                            <span className="metric-value">₹{(summaries.monthly * 1.15).toLocaleString()}</span>
                        </div>
                        <p className="insight-desc">Based on current trends, we project a <span className="text-success">15% growth</span> this month.</p>
                    </div>
                    <div className="card-footer">
                        <span className="tag green">+15% Outlook</span>
                    </div>
                </div>
            </div>

            <div className="ai-cta-banner glass-v2">
                <div className="cta-info">
                    <BarChart3 size={24} />
                    <div>
                        <h4>Need deeper analysis?</h4>
                        <p>Ask our AI Copilot directly about sales strategies, inventory optimization, or expense tracking.</p>
                    </div>
                </div>
                <button className="cta-button">Open AI Assistant</button>
            </div>
        </div>
    );
};

export default InsightsView;
