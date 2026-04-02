import React, { useMemo } from 'react';
import {
    TrendingUp, AlertTriangle, BarChart3, Zap, Target,
    RefreshCw, Cpu, Activity, Globe, ShieldCheck, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeuralStrategyModal from './NeuralStrategyModal';
import '../styles/InsightsView.css';
import '../styles/NeuralStrategy.css';

const InsightsView = ({ inventory = [], transactions = [], summaries = {} }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

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

        const matrixCoverage = 94.2; // Mocked consistent with UI requirements
        const criticalNodes = lowStockItems.length;

        return { bestSeller, stockoutRiskCount, projectedMonthly, growthPct, matrixCoverage, criticalNodes };
    }, [inventory, transactions, summaries]);

    // Handle search filtered results
    const filteredProducts = React.useMemo(() => {
        if (!searchQuery) return [];
        return inventory.filter(item =>
            item.product.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5);
    }, [searchQuery, inventory]);

    const handleProductSelect = (productName) => {
        setSelectedProduct(productName);
        setIsModalOpen(true);
        setSearchQuery('');
    };

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
            id: 'velocity',
            title: 'Sales Velocity',
            icon: <Activity className="node-icon icon-cyan" />,
            label: 'Top Active Node',
            value: insights.bestSeller,
            desc: `High-frequency throughput detected in ${insights.bestSeller} clusters. Optimal restock latency identified.`,
            tag: 'POSITIVE_DELTA',
            tagClass: 'pill-apex-green'
        },
        {
            id: 'risk',
            title: 'Risk Parameters',
            icon: <ShieldCheck className="node-icon icon-gold" />,
            label: 'Critical Depletion Sync',
            value: `${insights.criticalNodes} Nodes`,
            desc: `Identified ${insights.criticalNodes} inventory nodes near critical exhaustion. Mitigation strategy initialized.`,
            tag: 'ACTION_REQUIRED',
            tagClass: 'pill-apex-gold'
        },
        {
            id: 'efficiency',
            title: 'Neural Efficiency',
            icon: <Zap className="node-icon icon-purple" />,
            label: 'Matrix Integrity',
            value: `${insights.matrixCoverage}%`,
            desc: `Stock health index is optimal. Neural layers synchronized with live market volatility.`,
            tag: 'STABLE_MATRIX',
            tagClass: 'pill-apex-blue'
        }
    ];

    return (
        <div className="neural-insights-root">

            {/* ── Background Decorative Layer ── */}
            <div className="neural-grid-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neural-hero-panel-advanced"
            >
                <div className="hero-top-row">
                    <div className="hero-left">
                        <div className="ai-core-orb">
                            <Cpu size={28} />
                        </div>
                        <div className="hero-text-neural">
                            <h1>Neural Engine <span>ZENITH v10.0</span></h1>
                            <p>Merchant Heuristics & Strategic Telemetry Hub</p>
                        </div>
                    </div>

                    <div className="hero-right-telemetry">
                        <div className="telemetry-node">
                            <Globe size={14} />
                            <span>@Node: 07-PYTM</span>
                        </div>
                        <div className="telemetry-node active">
                            <div className="pulse-dot" />
                            <span>Uplink: Synchronized</span>
                        </div>
                    </div>
                </div>

                <div className="neural-search-container">
                    <div className="neural-search-box">
                        <Search className="search-icon-neural" size={20} />
                        <input
                            type="text"
                            placeholder="Analyze any product (eg: Oreo)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <AnimatePresence>
                            {searchQuery && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="search-results-dropdown"
                                >
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(p => (
                                            <div
                                                key={p.product}
                                                className="result-item-enhanced"
                                                onClick={() => handleProductSelect(p.product)}
                                            >
                                                <div className="result-left">
                                                    <Target size={14} className="target-icon-neural" />
                                                    <span className="product-name-result">{p.product}</span>
                                                </div>
                                                <div className="result-right">
                                                    <span className="result-meta">Stock: <b className={p.quantity < 20 ? 'text-warn' : 'text-ok'}>{p.quantity}</b></span>
                                                    <span className="result-meta">₹{p.price}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-result">No neural match found</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            whileHover={{ y: -10, scale: 1.02 }}
                            transition={{ delay: idx * 0.15, duration: 0.5 }}
                            className={`neural-node-card ${card.id} bento-item-apex`}
                        >
                            <div className="node-header">
                                <div style={{ position: 'relative' }}>
                                    {card.icon}
                                    <div className="pulse-ring" style={{ position: 'absolute', top: '-5px', right: '-5px', width: '8px', height: '8px' }} />
                                </div>
                                <h3>{card.title}</h3>
                            </div>

                            <div className="node-body">
                                <div className="metric-wrap-elite">
                                    <span className="apex-label">{card.label}</span>
                                    <span className="apex-value" style={{ fontSize: '2rem' }}>{card.value}</span>
                                </div>
                                <p className="node-description" style={{ fontSize: '0.85rem' }}>{card.desc}</p>
                            </div>

                            <div className="node-footer-neural">
                                <span className={`apex-status-pill ${card.tagClass}`}>
                                    {card.tag}
                                </span>
                                <div className="apex-scan-line" style={{ height: '2px', opacity: 0.1 }} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <NeuralStrategyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                transactions={transactions}
                inventory={inventory}
            />
        </div>
    );
};

export default InsightsView;
