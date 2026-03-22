import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpRight } from 'lucide-react';
import { getInventory, getTransactions } from '../services/api';
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

        // Group transactions by product
        const productRevenue = {};
        transactions.forEach(t => {
            if (!productRevenue[t.product]) {
                productRevenue[t.product] = { revenue: 0, qty: 0 };
            }
            productRevenue[t.product].revenue += t.amount;
            productRevenue[t.product].qty += (t.quantity || 1);
        });

        const products = Object.keys(productRevenue).map(product => {
            const rev = productRevenue[product].revenue;
            const sellPrice = priceMap[product] || (rev / productRevenue[product].qty);
            const costPerUnit = costMap[product] || (sellPrice * 0.7);
            const totalCost = costPerUnit * productRevenue[product].qty;
            const profit = rev - totalCost;
            const margin = rev > 0 ? ((profit / rev) * 100) : 0;

            return {
                product,
                revenue: Math.round(rev),
                cost: Math.round(totalCost),
                profit: Math.round(profit),
                margin: Math.round(margin),
                qty: productRevenue[product].qty
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

    if (loading) return <div className="margins-view"><p className="loading-text">Calculating margins…</p></div>;

    if (!marginData || marginData.products.length === 0) {
        return (
            <div className="margins-view">
                <div className="margins-empty glass">
                    <PieChart size={64} style={{ opacity: 0.2 }} />
                    <h3>No Margin Data Available</h3>
                    <p>Record sales and add inventory to see profit analysis.</p>
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(...marginData.products.map(p => p.revenue));

    return (
        <div className="margins-view">
            {/* ── Hero ── */}
            <div className="margins-hero glass">
                <div className="hero-left">
                    <PieChart className="hero-icon" size={36} />
                    <div>
                        <h1>Profit Margin Analyzer</h1>
                        <p>Per-product profitability insights for smarter stocking</p>
                    </div>
                </div>
                <div className="margin-stats-row">
                    <div className="m-stat">
                        <span className="m-stat-val">{marginData.avgMargin}%</span>
                        <span className="m-stat-lbl">Avg. Margin</span>
                    </div>
                    <div className="m-stat">
                        <span className="m-stat-val green">₹{marginData.totalProfit.toLocaleString()}</span>
                        <span className="m-stat-lbl">Total Profit</span>
                    </div>
                    <div className="m-stat">
                        <span className="m-stat-val">₹{marginData.totalRevenue.toLocaleString()}</span>
                        <span className="m-stat-lbl">Total Revenue</span>
                    </div>
                </div>
            </div>

            {/* ── Best / Worst Cards ── */}
            <div className="margin-highlights">
                {marginData.bestProduct && (
                    <div className="highlight-card best glass">
                        <TrendingUp size={24} />
                        <div>
                            <span className="hl-label">Best Margin</span>
                            <span className="hl-product">{marginData.bestProduct.product}</span>
                            <span className="hl-value green">{marginData.bestProduct.margin}% profit</span>
                        </div>
                    </div>
                )}
                {marginData.worstProduct && (
                    <div className="highlight-card worst glass">
                        <TrendingDown size={24} />
                        <div>
                            <span className="hl-label">Lowest Margin</span>
                            <span className="hl-product">{marginData.worstProduct.product}</span>
                            <span className="hl-value amber">{marginData.worstProduct.margin}% profit</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Product Margin Chart ── */}
            <div className="margins-chart-card glass">
                <h2><BarChart3 size={22} /> Product Margins</h2>
                <div className="bars-container">
                    {marginData.products.map((p, i) => {
                        const barWidth = maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0;
                        const marginColor = p.margin >= 30 ? '#10b981' : p.margin >= 20 ? '#f59e0b' : '#ef4444';
                        return (
                            <div key={p.product} className="bar-row" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="bar-label">
                                    <span className="bar-product">{p.product}</span>
                                    <span className="bar-margin" style={{ color: marginColor }}>
                                        <ArrowUpRight size={12} /> {p.margin}%
                                    </span>
                                </div>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${barWidth}%`,
                                            background: `linear-gradient(90deg, ${marginColor}88, ${marginColor})`,
                                        }}
                                    />
                                    <span className="bar-amount">₹{p.revenue.toLocaleString()}</span>
                                </div>
                                <div className="bar-meta">
                                    <span>Cost: ₹{p.cost.toLocaleString()}</span>
                                    <span className="profit-tag" style={{ color: marginColor }}>
                                        Profit: ₹{p.profit.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MarginsView;
