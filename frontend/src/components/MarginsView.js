import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, BarChart3, ArrowUpRight, Target, Activity, Award, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { getInventory, getTransactions } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/MarginsView.css';

const MarginsView = () => {
    const [inventory, setInventory] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [invRes, txnRes] = await Promise.all([getInventory(), getTransactions()]);
                setInventory(invRes.data);
                setTransactions(txnRes.data);
            } catch (err) {
                console.error('Error fetching margin data', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const marginData = useMemo(() => {
        if (!transactions.length || !inventory.length) return null;

        const priceMap = {};
        const costMap = {};
        inventory.forEach(item => {
            priceMap[item.product] = item.price;
            costMap[item.product] = item.cost_price || (item.price * 0.7);
        });

        const productSales = {};
        transactions.forEach(t => {
            if (!productSales[t.product]) {
                productSales[t.product] = { revenue: 0, qty: 0 };
            }
            productSales[t.product].revenue += t.amount;
            productSales[t.product].qty += (t.quantity || 1);
        });

        const products = Object.keys(productSales).map(product => {
            const rev = productSales[product].revenue;
            const qty = productSales[product].qty;
            const sellPrice = priceMap[product] || (rev / qty);
            const costPerUnit = costMap[product] || (sellPrice * 0.7);
            const totalCost = costPerUnit * qty;
            const profit = rev - totalCost;
            const margin = rev > 0 ? ((profit / rev) * 100) : 0;

            return {
                product,
                unitPrice: Math.round(sellPrice),
                category: "Intelligence",
                revenue: Math.round(rev),
                costPerUnit: Math.round(costPerUnit),
                totalCost: Math.round(totalCost),
                profit: Math.round(profit),
                margin: Math.round(margin),
                qty: qty
            };
        }).sort((a, b) => b.margin - a.margin);

        const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
        const totalProfit = products.reduce((s, p) => s + p.profit, 0);
        const avgMargin = products.length > 0
            ? Math.round(products.reduce((s, p) => s + p.margin, 0) / products.length)
            : 0;

        const bestProduct = products[0] || null;
        const worstProduct = products[products.length - 1] || null;

        return { products, totalRevenue, totalProfit, avgMargin, bestProduct, worstProduct };
    }, [inventory, transactions]);

    if (loading) return (
        <div className="margins-loading">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Activity size={32} />
            </motion.div>
            <span>Synchronizing Profit Intelligence...</span>
        </div>
    );

    if (!marginData || marginData.products.length === 0) {
        return (
            <div className="margins-view">
                <div className="margins-hero-banner glass">
                    <Activity className="hero-icon-pulse" />
                    <div className="hero-text">
                        <h1>Profit Margin Analyzer</h1>
                        <p>Per-product profitability insights for smarter stocking</p>
                    </div>
                </div>
                <div className="margins-empty glass">
                    <h3>No Data Recorded</h3>
                    <p>Start recording transactions to see live Profitability vectors.</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profit-hub-wrapper">
            {/* ── Dashboard Header ── */}
            <div className="hub-top-header">
                <div className="header-meta">
                    <h2>Business Hub</h2>
                    <span className="pill-status">PROFIT ANALYSIS</span>
                </div>
                <p className="sub-text">Real-time oversight of your merchant operations ecosystem.</p>
            </div>

            {/* ── Main Analyzer Display ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="analyzer-hero-card glass shadow-bold"
            >
                <div className="hero-header-row">
                    <div className="dot-pulse-wrap">
                        <span className="dot-pulse"></span>
                    </div>
                    <div className="hero-title-group">
                        <h3>Profit Margin Analyzer</h3>
                        <p>Per-product profitability insights for smarter stocking</p>
                    </div>
                </div>

                <div className="metrics-triad">
                    <div className="triad-box glow-blue">
                        <span className="t-val">{marginData.avgMargin}%</span>
                        <span className="t-lbl">AVG. MARGIN</span>
                    </div>
                    <div className="triad-box glow-green accent">
                        <span className="t-val">₹{marginData.totalProfit.toLocaleString()}</span>
                        <span className="t-lbl">TOTAL PROFIT</span>
                    </div>
                    <div className="triad-box">
                        <span className="t-val">₹{marginData.totalRevenue.toLocaleString()}</span>
                        <span className="t-lbl">TOTAL REVENUE</span>
                    </div>
                </div>
                <div className="hero-orb-decoration"></div>
            </motion.div>

            {/* ── Highlights Row ── */}
            <div className="profit-highlights-row">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="h-card elite-highlight-card"
                >
                    <div className="elite-badge"><Award size={14} /> PEAK MARGIN</div>
                    <div className="h-header">
                        <Target size={16} className="text-secondary" />
                        <span>BEST CAPTURE</span>
                    </div>
                    <div className="elite-visual-hub">
                        <div className="orbit-wrap">
                            <Zap className="orbit-icon" />
                        </div>
                        <div className="elite-info">
                            <h4 className="h-name">{marginData.bestProduct.product}</h4>
                            <div className="h-price-mix">
                                <span className="h-u-price">₹{marginData.bestProduct.unitPrice}</span>
                                <span className="h-pct-badge">{marginData.bestProduct.margin}% profit</span>
                            </div>
                        </div>
                    </div>
                    <div className="elite-meta">
                        <p>Immediate profitability leader. <span>Optimal pricing active.</span></p>
                        <span className="h-cost-ref">₹{marginData.bestProduct.costPerUnit} Cost ・ ₹{marginData.bestProduct.profit.toLocaleString()} Profit</span>
                    </div>
                    <div className="elite-glow"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="h-card glass glow-amber"
                >
                    <div className="h-header">
                        <TrendingDown size={16} className="text-warning" />
                        <span>LOWEST MARGIN</span>
                    </div>
                    <div className="h-content">
                        <div className="h-prod-row">
                            <h4 className="h-name">{marginData.worstProduct.product}</h4>
                            <div className="h-price-mix">
                                <span className="h-u-price">₹{marginData.worstProduct.unitPrice}</span>
                                <span className="h-t-profit">₹{marginData.worstProduct.profit.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="h-meta">
                            <span className="h-pct text-warning">{marginData.worstProduct.margin}% profit</span>
                            <span className="h-cost-ref">₹{marginData.worstProduct.costPerUnit} Cost ・ ₹{marginData.worstProduct.profit.toLocaleString()} Profit</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Product Margins List ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="products-margins-list-card glass"
            >
                <div className="list-title">
                    <BarChart3 size={18} />
                    <span>Product-wise Margin Dispersion Matrix</span>
                </div>

                <div className="margins-list-container">
                    {marginData.products.map((p, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (i * 0.06) }}
                            key={p.product}
                            className="margin-row-item"
                        >
                            <div className="matrix-grid">
                                {/* Col 1: Product Identity */}
                                <div className="matrix-col-1">
                                    <h4 className="p-name">{p.product}</h4>
                                    <div className="p-meta-labels">
                                        <span className="p-price">MRP ₹{p.unitPrice}</span>
                                        <div className="p-cost-pill">
                                            <span className="p-cost-lbl">Cost ₹{p.costPerUnit}</span>
                                            <ShieldCheck size={12} className="text-secondary" />
                                        </div>
                                    </div>
                                </div>

                                {/* Col 2: Performance Track */}
                                <div className="matrix-col-2">
                                    <div className="progress-group">
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill shimmer"
                                                style={{
                                                    width: `${p.margin}%`,
                                                    background: p.margin > 50 ? 'linear-gradient(90deg, #10b981 0%, #00baf2 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="progress-labels">
                                            <div className="yield-stat">
                                                <span className="stat-pct" style={{ color: p.margin > 50 ? '#10b981' : '#f59e0b' }}>{p.margin}%</span>
                                                <span className="stat-label">Yield Tracking</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Col 3: Profit Totals */}
                                <div className="matrix-col-3">
                                    <div className="profit-stack">
                                        <div className="p-stat-box">
                                            <span className="p-total-profit">₹{p.profit.toLocaleString()}</span>
                                            <span className="p-lbl">Total Profit</span>
                                        </div>
                                        <div className="p-stat-box accent">
                                            <span className="p-unit-profit">₹{Math.round(p.profit / p.qty).toLocaleString()}</span>
                                            <span className="p-lbl">Unit Profit</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MarginsView;
