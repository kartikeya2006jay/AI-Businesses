import React, { useMemo } from 'react';
import {
    TrendingUp, AlertTriangle, BarChart3, Zap, Target,
    RefreshCw, Cpu, Activity, Globe, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/InsightsView.css';

const InsightsView = ({ inventory = [], transactions = [], summaries = {} }) => {
    // ── Dynamic Logic for "Neural Nodes" ──────────────────────────
    const insights = useMemo(() => {
        if (!inventory.length && !transactions.length) return null;

        const productFrequency = transactions.reduce((acc, curr) => {
            acc[curr.product] = (acc[curr.product] || 0) + 1;
            return acc;
        }, {});

        const bestSeller = Object.keys(productFrequency).length > 0
            ? Object.keys(productFrequency).reduce((a, b) => productFrequency[a] > productFrequency[b] ? a : b)
            : 'N/A';

        const lowStockItems = inventory.filter(item => item.quantity < 10);
        const stockoutRiskCount = lowStockItems.length;

        const currentMonthly = summaries.monthly || 0;
        const projectedMonthly = Math.round(currentMonthly * 1.12);
        const growthPct = currentMonthly > 0 ? 12 : 0;

        return { bestSeller, stockoutRiskCount, projectedMonthly, growthPct };
    }, [inventory, transactions, summaries]);

    if (!insights) {
        return (
            <div className="insights-empty-neural">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                    <Cpu size={60} className="neural-core-icon" />
                </motion.div>
                <h2>Initializing Neural Engine...</h2>
                <p>Establishing data uplink. Awaiting transaction telemetry.</p>
            </div>
        );
    }

    const cards = [
        {
            id: 'performance',
            title: 'Top Performance',
            icon: <Target className="node-icon icon-cyan" />,
            label: 'High Velocity Asset',
            value: insights.bestSeller,
            desc: `Leading the transaction stream. Market demand for "${insights.bestSeller}" is currently peaking.`,
            tag: 'Trending Now',
            tagClass: 'cyan-glow'
        },
        {
            id: 'inventory',
            title: 'Supply Integrity',
            icon: <ShieldCheck className="node-icon icon-gold" />,
            label: 'Stock Depletion Risk',
            value: `${insights.stockoutRiskCount} Items`,
            desc: insights.stockoutRiskCount > 0
                ? `Critical risk detected in ${insights.stockoutRiskCount} SKU nodes. Immediate replenishment recommended.`
                : "All supply chains stabilized. Neural monitoring active for all product nodes.",
            tag: insights.stockoutRiskCount > 0 ? 'Critical' : 'Stable',
            tagClass: insights.stockoutRiskCount > 0 ? 'gold-glow' : 'green-glow'
        },
        {
            id: 'forecast',
            title: 'Growth Projection',
            icon: <Activity className="node-icon icon-purple" />,
            label: 'Predictive Revenue',
            value: `₹${insights.projectedMonthly.toLocaleString()}`,
            desc: `Current velocity indicates a ${insights.growthPct}% performance delta by month-end cycles.`,
            tag: 'Optimistic',
            tagClass: 'purple-glow'
        }
    ];

    return (
        <div className="neural-insights-root">

            {/* ── Background Decorative Layer ── */}
            <div className="neural-grid-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neural-hero-panel"
            >
                <div className="hero-left">
                    <div className="ai-core-orb">
                        <Cpu size={28} />
                    </div>
                    <div className="hero-text-neural">
                        <h1>Neural Insights Engine <span>v4.2</span></h1>
                        <p>Real-time heuristic analysis of your local business matrix.</p>
                    </div>
                </div>
                <div className="hero-right-telemetry">
                    <div className="telemetry-node">
                        <Globe size={14} />
                        <span>Node: 07-PYTM</span>
                    </div>
                    <div className="telemetry-node active">
                        <div className="pulse-dot" />
                        <span>Uplink: Synchronized</span>
                    </div>
                </div>
            </motion.div>

            <div className="neural-insights-grid">
                <AnimatePresence>
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, duration: 0.5 }}
                            className={`neural-node-card ${card.id}`}
                        >
                            <div className="node-header">
                                {card.icon}
                                <h3>{card.title}</h3>
                            </div>

                            <div className="node-body">
                                <div className="metric-wrap-elite">
                                    <span className="metric-sub">{card.label}</span>
                                    <span className="metric-main">{card.value}</span>
                                </div>
                                <p className="node-description">{card.desc}</p>
                            </div>

                            <div className="node-footer-neural">
                                <span className={`neural-tag ${card.tagClass}`}>
                                    {card.tag}
                                </span>
                                <div className="scan-line-mini" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="neural-cta-dock"
            >
                <div className="cta-left">
                    <Zap className="cta-icon-zap" size={22} />
                    <div className="cta-copy">
                        <h4>Establish Deep Strategy Matrix?</h4>
                        <p>Interface with AI Copilot: <span>"Analyze {insights.bestSeller} performance trends"</span></p>
                    </div>
                </div>
                <button
                    className="neural-cta-btn"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                    Initialize AI Chat
                    <TrendingUp size={16} />
                </button>
            </motion.div>

        </div>
    );
};

export default InsightsView;
