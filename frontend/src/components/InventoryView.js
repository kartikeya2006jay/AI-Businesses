import React, { useState, useEffect, useMemo } from 'react';
import {
    Package,
    Search,
    AlertTriangle,
    CheckCircle,
    Plus,
    MoreVertical,
    Sparkles,
    TrendingUp,
    ArrowRight,
    Trash2,
    Edit3,
    X,
    Image as ImageIcon,
    Loader2,
    RefreshCcw,
    Zap,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage, deleteInventory, updateInventory, getInventoryOptimization } from '../services/api';
import '../styles/InventoryView.css';

const InventoryView = ({ inventory, fetchData }) => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [productImages, setProductImages] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [optimizationPlan, setOptimizationPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // { product, quantity, price, cost_price }
    const [updateLoading, setUpdateLoading] = useState(false);

    // 0. Avatar Generation Logic
    const getAvatarStyle = (name) => {
        const colors = [
            ['#00baf2', '#007abf'], // Blue
            ['#b129ff', '#764ba2'], // Purple
            ['#f43f5e', '#be123c'], // Rose
            ['#10b981', '#047857'], // Emerald
            ['#f59e0b', '#d97706'], // Amber
            ['#6366f1', '#4338ca'], // Indigo
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        const pair = colors[Math.abs(hash) % colors.length];
        return {
            background: `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        };
    };

    // 1. Image Auto-attachment Logic
    useEffect(() => {
        const fetchImages = async () => {
            // Find all products that missing images or have 'placeholder' (failed) and aren't loading
            const missingProducts = inventory.filter(p => (!productImages[p.product] || productImages[p.product] === 'placeholder') && !loadingImages[p.product]);
            if (missingProducts.length === 0) return;

            // Mark them all as loading immediately
            const initialLoading = { ...loadingImages };
            missingProducts.forEach(p => { initialLoading[p.product] = true; });
            setLoadingImages(prev => ({ ...prev, ...initialLoading }));

            // Process in batches of 3 to be fast but respectful
            const batchSize = 3;
            for (let i = 0; i < missingProducts.length; i += batchSize) {
                const batch = missingProducts.slice(i, i + batchSize);

                await Promise.all(batch.map(async (product) => {
                    try {
                        const res = await getProductImage(product.product);
                        // Our new backend always returns a URL (even if it's a fallback)
                        if (res.data && res.data.url) {
                            setProductImages(prev => ({ ...prev, [product.product]: res.data.url }));
                        } else {
                            setProductImages(prev => ({ ...prev, [product.product]: 'placeholder' }));
                        }
                    } catch (error) {
                        console.error(`Error fetching image for ${product.product}:`, error);
                        setProductImages(prev => ({ ...prev, [product.product]: 'placeholder' }));
                    } finally {
                        setLoadingImages(prev => ({ ...prev, [product.product]: false }));
                    }
                }));
            }
        };

        if (inventory.length > 0) {
            fetchImages();
        }
    }, [inventory]); // Remove productImages to prevent potential loop

    // 2. Filtering Logic
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                filter === 'all' ? true :
                    filter === 'low' ? item.quantity < 20 :
                        filter === 'warning' ? item.quantity < 10 :
                            filter === 'instock' ? item.quantity >= 20 : true;
            return matchesSearch && matchesFilter;
        });
    }, [inventory, filter, searchQuery]);

    // 3. AI Insights Simulation
    const aiRecommendations = useMemo(() => {
        return inventory
            .filter(p => p.quantity < 30)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 3)
            .map(p => ({
                ...p,
                reason: p.quantity < 10 ? 'Critical restock needed' : 'Predictive: Stock out in 3 days',
                priority: p.quantity < 10 ? 'high' : 'medium'
            }));
    }, [inventory]);

    const handleDelete = async (name) => {
        if (window.confirm(`Remove ${name} from inventory?`)) {
            try {
                await deleteInventory(name);
                fetchData();
            } catch (err) {
                alert("Error deleting product");
            }
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Clear previous 'placeholder' errors to allow re-fetching with our new robust backend
        setProductImages(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => {
                if (next[key] === 'placeholder') delete next[key];
            });
            return next;
        });
        await fetchData();
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const handleGenerateOptimization = async () => {
        setLoadingPlan(true);
        try {
            const res = await getInventoryOptimization();
            setOptimizationPlan(res.data.plan);
        } catch (err) {
            console.error("Plan Error:", err);
            setOptimizationPlan("Unable to generate plan. Please try again later.");
        } finally {
            setLoadingPlan(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            await updateInventory(editingProduct);
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Failed to update inventory");
        } finally {
            setUpdateLoading(false);
        }
    };

    return (
        <div className="inventory-view app-root">

            {/* ── HEADER ── */}
            <div className="inventory-header">
                <div className="header-left">
                    <h2>Stock Repository</h2>
                    <p className="header-sub">Manage and monitor your real-time inventory assets.</p>
                </div>

                <div className="inventory-filters glass shadow-soft">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <Package size={16} /> All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
                        onClick={() => setFilter('low')}
                    >
                        <AlertTriangle size={16} /> Low Stock
                    </button>
                    <button
                        className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
                        onClick={() => setFilter('warning')}
                    >
                        <Zap size={16} /> Priority
                    </button>
                    <button
                        className={`filter-btn ${filter === 'instock' ? 'active' : ''}`}
                        onClick={() => setFilter('instock')}
                    >
                        <CheckCircle size={16} /> In Stock
                    </button>
                </div>
            </div>

            {/* ── QUICK STATS ── */}
            <div className="inventory-stats-row">
                <div className="stat-card glass shadow-soft">
                    <div className="stat-icon"><Package size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{inventory.length}</span>
                        <span className="stat-label">Total SKUs</span>
                    </div>
                </div>
                <div className="stat-card glass shadow-soft warning">
                    <div className="stat-icon"><AlertTriangle size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{inventory.filter(i => i.quantity < 20).length}</span>
                        <span className="stat-label">Low Stock Alerts</span>
                    </div>
                </div>
                <div className="stat-card glass shadow-soft">
                    <div className="stat-icon"><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <span className="stat-value">₹{(inventory.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) / 1000).toFixed(1)}k</span>
                        <span className="stat-label">Catalog Value</span>
                    </div>
                </div>
            </div>

            <div className="inventory-container">

                {/* ── PRODUCT GRID ── */}
                <div className="grid-main-section">
                    <div className="grid-controls glass shadow-soft" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="search-wrap" style={{ flex: 1, position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                        <button className="action-btn" style={{ width: 'auto', padding: '0.6rem 1rem' }} onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCcw size={16} className={isRefreshing ? 'spin' : ''} />
                        </button>
                    </div>

                    <div className="product-grid">
                        <AnimatePresence>
                            {filteredInventory.map((item, index) => (
                                <motion.div
                                    key={item.product}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`product-card glass shadow-soft ${item.quantity < 10 ? 'status-critical' : ''}`}
                                >
                                    <div className="product-image-wrap">
                                        {productImages[item.product] && productImages[item.product] !== 'placeholder' ? (
                                            <img
                                                src={productImages[item.product]}
                                                alt={item.product}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    setProductImages(prev => ({ ...prev, [item.product]: 'placeholder' }));
                                                }}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                {loadingImages[item.product] ? (
                                                    <div className="loading-state-inner">
                                                        <Loader2 size={28} className="spin" />
                                                        <span>Neural Search...</span>
                                                    </div>
                                                ) : (
                                                    <div className="product-avatar" style={getAvatarStyle(item.product)}>
                                                        {item.product.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className={`stock-badge ${item.quantity < 10 ? 'out' : item.quantity < 30 ? 'low' : 'ok'}`}>
                                            {item.quantity < 10 ? 'Critically Low' : item.quantity < 30 ? 'Low Stock' : 'Optimized'}
                                        </div>
                                    </div>

                                    <div className="product-details">
                                        <h4>{item.product}</h4>
                                        <div className="product-meta">
                                            <span className="product-price">₹{item.price}</span>
                                            <span className="product-qty">{item.quantity} units</span>
                                        </div>

                                        <div className="product-actions">
                                            <button className="action-btn" title="Edit Product" onClick={() => handleEdit(item)}><Edit3 size={14} /></button>
                                            <button className="action-btn delete" onClick={() => handleDelete(item.product)} title="Remove Product"><Trash2 size={14} /></button>
                                            <button className="action-btn" title="History"><TrendingUp size={14} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredInventory.length === 0 && (
                            <div className="empty-history">
                                <Package size={48} />
                                <p>No products found matching your search or filters.</p>
                                <button
                                    className="filter-btn active"
                                    style={{ margin: '1rem auto' }}
                                    onClick={() => { setFilter('all'); setSearchQuery(''); }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── AI SIDEBAR ── */}
                <aside className="inventory-sidebar">

                    <div className="ai-recommend-card glass shadow-soft">
                        <div className="ai-header">
                            <Sparkles size={20} className="sparkle-icon" />
                            <h3>Neural Analysis</h3>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Our AI brain has analyzed your inventory turnover and detected these priority items:
                        </p>

                        <div className="recommendation-list">
                            {aiRecommendations.map((rec, i) => (
                                <div key={i} className="rec-item">
                                    <div className="rec-icon">
                                        {rec.priority === 'high' ? <AlertTriangle size={16} /> : <TrendingUp size={16} />}
                                    </div>
                                    <div className="rec-details">
                                        <span className="rec-name">{rec.product}</span>
                                        <span className="rec-reason">{rec.reason}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="reorder-btn"
                            onClick={handleGenerateOptimization}
                            disabled={loadingPlan}
                        >
                            {loadingPlan ? 'Analyzing Ecosystem...' : 'Generate Optimization Plan'}
                            {!loadingPlan && <ArrowRight size={16} style={{ marginLeft: '8px' }} />}
                            {loadingPlan && <Loader2 size={16} className="spin" style={{ marginLeft: '8px' }} />}
                        </button>

                        <AnimatePresence>
                            {optimizationPlan && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    style={{ overflow: 'hidden', marginTop: '1.5rem' }}
                                >
                                    <div className="glass" style={{ padding: '1rem', fontSize: '0.8rem', borderLeft: '3px solid #b129ff', background: 'rgba(177, 41, 255, 0.05)' }}>
                                        <p style={{ lineHeight: '1.6', color: 'var(--text-main)' }}>{optimizationPlan}</p>
                                        <button
                                            style={{ marginTop: '0.5rem', background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                                            onClick={() => setOptimizationPlan(null)}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="performance-card glass shadow-soft" style={{ padding: '1.5rem' }}>
                        <div className="ai-header" style={{ marginBottom: '1rem' }}>
                            <Activity size={18} style={{ color: 'var(--primary)' }} />
                            <h3>Neural Telemetry</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Integrity</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>Nominal</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', background: 'var(--success)', opacity: 0.5 }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Profit Extraction</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>High</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: '88%', height: '100%', background: 'var(--primary)', opacity: 0.5 }}></div>
                            </div>
                        </div>
                    </div>

                </aside>

            </div>

            {/* ── EDIT MODAL ── */}
            <AnimatePresence>
                {isEditModalOpen && editingProduct && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="modal glass shadow-bold"
                        >
                            <div className="modal-header">
                                <div className="header-icon"><Edit3 size={18} /></div>
                                <h3>Edit Inventory Item</h3>
                                <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={18} /></button>
                            </div>

                            <form onSubmit={handleUpdate} className="edit-form">
                                <div className="form-group ink-border">
                                    <label>Product Name</label>
                                    <input type="text" value={editingProduct.product} disabled className="disabled-input" />
                                </div>

                                <div className="form-row">
                                    <div className="form-group ink-border">
                                        <label>Selling Price (₹)</label>
                                        <input
                                            type="number"
                                            value={editingProduct.price}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group ink-border">
                                        <label>Cost Price (₹)</label>
                                        <input
                                            type="number"
                                            value={editingProduct.cost_price || 0}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, cost_price: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group ink-border">
                                    <label>Stock Quantity</label>
                                    <div className="qty-input-wrap">
                                        <button type="button" onClick={() => setEditingProduct({ ...editingProduct, quantity: Math.max(0, editingProduct.quantity - 1) })}>-</button>
                                        <input
                                            type="number"
                                            value={editingProduct.quantity}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                        <button type="button" onClick={() => setEditingProduct({ ...editingProduct, quantity: editingProduct.quantity + 1 })}>+</button>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="action-btn" style={{ width: 'auto', padding: '0.8rem 1.5rem' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="save-btn" disabled={updateLoading}>
                                        {updateLoading ? <Loader2 size={18} className="spin" /> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryView;
