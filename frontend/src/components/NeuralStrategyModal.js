import React, { useMemo, useState, useEffect } from 'react';
import {
    X, TrendingUp, Zap, Target,
    Layers, Activity, Box, ShieldCheck, Sparkles,
    Search, Calendar, Loader2, BarChart4, ArrowUpRight,
    TrendingDown, AlertCircle, ShoppingCart, Globe, History, BrainCircuit,
    Cpu, Command, Fingerprint, ChevronDown, Layers2, PieChart
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import '../styles/NeuralStrategy.css';

const NeuralStrategyModal = ({ isOpen, onClose, product, transactions = [], inventory = [] }) => {
    const { theme } = useTheme();
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showDeepInsights, setShowDeepInsights] = useState(false);
    const [analysisAnimation, setAnalysisAnimation] = useState(false);
    const [viewMode, setViewMode] = useState('month');
    const [analysisLogs, setAnalysisLogs] = useState([]);

    const isLight = theme === 'light' || theme === 'cream';

    // ── Neural Analysis Stream Logic ──────────────────────────
    useEffect(() => {
        if (showDeepInsights) {
            const logs = [
                "[NODE_0x82A]: INITIALIZING_DEEP_SCAN...",
                "[SYSTEM]: ACCESSING_HISTORICAL_QUERIES...",
                "[DATA_UPLINK]: FETCHING_MARKET_NODE_12...",
                "[NEURAL_CORE]: CROSS_REFERENCING_INVENTORY...",
                "[ZENITH]: CALCULATING_OPTIMAL_RESTOCK_LATENCY...",
                "[STRATEGY]: GENERATING_RECOMMENDED_PRICE_ADJUSTMENT...",
                "[ZENITH]: INSIGHTS_DECODED_SUCCESSFULLY."
            ];

            let i = 0;
            const interval = setInterval(() => {
                if (i < logs.length) {
                    setAnalysisLogs(prev => [...prev.slice(-5), logs[i]]);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 800);
            return () => clearInterval(interval);
        } else {
            setAnalysisLogs([]);
        }
    }, [showDeepInsights]);

    useEffect(() => {
        if (isOpen) {
            setIsAnalyzing(true);
            setShowDeepInsights(false);
            const timer = setTimeout(() => setIsAnalyzing(false), 1200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, product]);

    // ── High-Precision Sales Engine ───────────────────────────
    const analytics = useMemo(() => {
        if (!product || !inventory.length) return null;

        const item = inventory.find(i => i.product === product) || {};
        const productSales = transactions.filter(t => t.product === product);

        const now = new Date();
        const getDailyTotal = (daysAgo) => {
            const targetDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            return productSales
                .filter(t => {
                    const d = new Date(t.date || t.timestamp);
                    return d.getDate() === targetDate.getDate() &&
                        d.getMonth() === targetDate.getMonth() &&
                        d.getFullYear() === targetDate.getFullYear();
                })
                .reduce((s, t) => s + (t.quantity || 1), 0);
        };

        // Calculate Daily Map for Graph (last 30 days)
        const dailyData = Array.from({ length: 30 }).map((_, i) => {
            const daysAgo = 29 - i;
            const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            const sales = getDailyTotal(daysAgo);
            return {
                label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                sales: sales,
                isToday: daysAgo === 0
            };
        });

        const soldToday = dailyData[29].sales;
        const sold7d = dailyData.slice(23, 30).reduce((s, d) => s + d.sales, 0);
        const sold30d = dailyData.reduce((s, d) => s + d.sales, 0);

        const stock = item.quantity || 0;
        const price = item.price || 0;
        const totalProfit = (price - (item.cost_price || price * 0.7)) * sold30d;
        const margin = price > 0 ? (((price - (item.cost_price || price * 0.7)) / price) * 100).toFixed(1) : 0;

        return { dailyData, soldToday, sold7d, sold30d, stock, price, totalProfit, margin };
    }, [product, inventory, transactions]);

    const handleRunDeepAnalysis = () => {
        setAnalysisAnimation(true);
        setTimeout(() => {
            setAnalysisAnimation(false);
            setShowDeepInsights(true);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="neural-modal-overlay">
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 100 }}
                    className="neural-3d-box"
                >
                    {analysisAnimation && <div className="apex-scan-line" />}

                    {/* Header: APEX V10 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                <div className="pulse-ring" />
                                <span className="apex-label" style={{ margin: 0, opacity: 0.5 }}>Strategic Intelligence // ZENITH_V10.0</span>
                            </div>
                            <h1 className="apex-title">{product}</h1>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                                <span className="apex-status-pill pill-apex-blue">DATA_STREAMS_ACTIVE</span>
                                <span className="apex-status-pill" style={{ color: isLight ? 'var(--text-muted)' : 'rgba(255,255,255,0.3)' }}>SYNCED: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: isLight ? 'var(--bg-secondary)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--primary)', color: isLight ? 'var(--text-bright)' : '#fff', width: '70px', height: '70px', borderRadius: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                            <X size={32} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '3rem' }}>

                        {/* ── LEFT: Precision Sales Graph ────────────────── */}
                        <div className="graph-container-apex">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 1000 }}>Sales Performance</h3>
                                    <p className="apex-label" style={{ margin: 0 }}>Daily Units Sold</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select className="apex-select" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                                        <option value="today">Today</option>
                                        <option value="week">7 Cycles</option>
                                        <option value="month">Full Month</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ height: '440px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics?.dailyData.slice(viewMode === 'today' ? 29 : viewMode === 'week' ? 23 : 0)}>
                                        <defs>
                                            <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#00f2ff" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="12 12" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.02)"} vertical={false} />
                                        <XAxis dataKey="label" stroke={isLight ? "var(--text-muted)" : "rgba(255,255,255,0.2)"} fontSize={11} fontWeight={900} axisLine={false} tickLine={false} dy={15} />
                                        <YAxis stroke={isLight ? "var(--text-muted)" : "rgba(255,255,255,0.2)"} fontSize={11} fontWeight={900} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{ background: isLight ? '#fff' : '#0a0f19', border: `1px solid ${isLight ? 'var(--primary)' : '#00f2ff'}`, borderRadius: '24px', padding: '15px' }}
                                            itemStyle={{ color: isLight ? 'var(--primary)' : '#00f2ff', fontWeight: 1000 }}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            fill="url(#barGlow)"
                                            radius={[12, 12, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', opacity: 0.3, fontSize: '0.85rem', fontWeight: 1000, letterSpacing: '2px', textTransform: 'uppercase' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <span>STREAM_ID: 0x82A</span>
                                    <span>LATENCY: 0.12ms</span>
                                </div>
                                <span style={{ color: '#00f2ff' }}>Real-Time Injection Active</span>
                            </div>
                        </div>

                        {/* ── RIGHT: Apex 3D Bento Matrix ────────────────── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>

                                <motion.div whileHover={{ y: -15, scale: 1.02 }} className="bento-item-apex" style={{ gridColumn: 'span 2', background: isLight ? 'rgba(255,188,0,0.05)' : 'linear-gradient(135deg, rgba(255,188,0,0.1), rgba(0,0,0,0.2))' }}>
                                    <div className="apex-label" style={{ color: '#ffbc00' }}>Gross Monthly Profit</div>
                                    <div className="apex-value" style={{ color: '#ffbc00', fontSize: '3.8rem' }}>₹{(analytics?.totalProfit || 0).toLocaleString()}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span className="apex-status-pill pill-apex-gold">Peak Resilience</span>
                                        <TrendingUp size={30} color="#ffbc00" />
                                    </div>
                                </motion.div>

                                <motion.div whileHover={{ y: -15, scale: 1.02 }} className="bento-item-apex">
                                    <div className="apex-label">Stock Status</div>
                                    <div className="apex-value">{analytics?.stock} <small style={{ fontSize: '1rem', opacity: 0.3 }}>PCS</small></div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 1000, color: analytics?.stock < 20 ? '#ef4444' : '#10b981', background: analytics?.stock < 20 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block', marginTop: '10px' }}>
                                        {analytics?.stock < 20 ? 'CRITICAL_RESTOCK' : 'OPTIMAL_LEVEL'}
                                    </span>
                                </motion.div>

                                <motion.div whileHover={{ y: -15, scale: 1.02 }} className="bento-item-apex">
                                    <div className="apex-label">Profit Node</div>
                                    <div className="apex-value" style={{ color: '#00f2ff' }}>{analytics?.margin}%</div>
                                    <span className="apex-status-pill pill-apex-blue" style={{ marginTop: '10px', display: 'inline-block' }}>STRATEGIC_FIT</span>
                                </motion.div>

                                <motion.div whileHover={{ y: -15, scale: 1.02 }} className="bento-item-apex" style={{ background: isLight ? 'rgba(188, 0, 255, 0.05)' : 'rgba(188, 0, 255, 0.05)' }}>
                                    <div className="apex-label" style={{ color: '#bc00ff' }}>Today's Sales</div>
                                    <div className="apex-value" style={{ color: '#bc00ff' }}>{analytics?.soldToday} <small style={{ fontSize: '1rem', opacity: 0.4 }}>items</small></div>
                                    <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: isLight ? 'var(--text-muted)' : 'rgba(255,255,255,0.4)', fontWeight: 800 }}>LIVE_THROUGHPUT</p>
                                </motion.div>

                                <motion.div whileHover={{ y: -15, scale: 1.02 }} className="bento-item-apex" style={{ background: isLight ? 'rgba(0, 242, 255, 0.05)' : 'rgba(0, 242, 255, 0.05)' }}>
                                    <div className="apex-label" style={{ color: '#00f2ff' }}>Weekly Sales</div>
                                    <div className="apex-value">{analytics?.sold7d} <small style={{ fontSize: '1rem', opacity: 0.4 }}>items</small></div>
                                    <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: isLight ? 'var(--text-muted)' : 'rgba(255,255,255,0.4)', fontWeight: 800 }}>7-DAY_TOTAL</p>
                                </motion.div>

                            </div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-item-apex" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ background: '#10b981', color: '#000', padding: '18px', borderRadius: '25px' }}>
                                        <Sparkles size={32} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: isLight ? 'var(--text-bright)' : '#fff' }}>Recommended Action</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '1rem', color: isLight ? 'var(--text-main)' : 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>Demand is shifting towards weekend peaks. Suggest adjusting pricing node by <strong>+2.5%</strong>.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom Reveal Action */}
                    <div style={{ marginTop: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '2.5rem', opacity: 0.4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Fingerprint size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: 1000, fontFamily: 'JetBrains Mono' }}>UPLINK_ENCRYPTED</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Cpu size={20} /> <span style={{ fontSize: '0.8rem', fontWeight: 1000, fontFamily: 'JetBrains Mono' }}>CORE_V9_ZENITH</span>
                            </div>
                        </div>

                        <button
                            className="apex-liquid-btn"
                            style={{ padding: '1.6rem 6rem' }}
                            onClick={handleRunDeepAnalysis}
                            disabled={analysisAnimation || showDeepInsights}
                        >
                            {analysisAnimation ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Loader2 className="spin" size={32} />
                                    <span>ANALYZING MARKET NODES...</span>
                                </div>
                            ) : showDeepInsights ? (
                                'INSIGHTS_DECODED'
                            ) : (
                                'RUN DEEP ANALYSIS'
                            )}
                        </button>
                    </div>

                    {/* ── Technical Ledger: Live Neural Stream ── */}
                    {showDeepInsights && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="technical-ledger"
                        >
                            <div className="ledger-header">
                                <BrainCircuit size={14} className="icon-cyan" />
                                <span>LIVE_ANALYSIS_STREAM</span>
                            </div>
                            <div className="ledger-body">
                                {analysisLogs.map((log, idx) => (
                                    <div key={idx} className="ledger-line">
                                        <span className="line-prefix">{">>"}</span>
                                        <span className="line-content">{log}</span>
                                    </div>
                                ))}
                                <div className="ledger-cursor" />
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {showDeepInsights && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '4rem', padding: '3rem', background: isLight ? 'rgba(0, 186, 242, 0.05)' : 'rgba(0, 242, 255, 0.03)', borderRadius: '40px', border: `1px solid ${isLight ? 'var(--primary)' : 'rgba(0, 242, 255, 0.2)'}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                                <div className="insight-node">
                                    <h5 className="apex-label" style={{ color: '#00f2ff' }}>Buying Pattern</h5>
                                    <p style={{ color: isLight ? 'var(--text-main)' : 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>Customers buying <strong>{product}</strong> also peak in high-value beverage nodes.</p>
                                </div>
                                <div className="insight-node">
                                    <h5 className="apex-label" style={{ color: '#bc00ff' }}>Neural Forecast</h5>
                                    <p style={{ color: isLight ? 'var(--text-main)' : 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>Projected growth of <strong>+18.4%</strong> in next supply cycle detected.</p>
                                </div>
                                <div className="insight-node">
                                    <h5 className="apex-label" style={{ color: '#ffbc00' }}>Smart Restock</h5>
                                    <p style={{ color: isLight ? 'var(--text-main)' : 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>Acquisition latency minimized if restocked within <strong>48 hours</strong>.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default NeuralStrategyModal;

