import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import RevenueCard from '../components/RevenueCard';
import RevenueChart from '../components/RevenueChart';
import SaleEntryForm from '../components/SaleEntryForm';
import ChatBox from '../components/ChatBox';
import SalesView from '../components/SalesView';
import InventoryView from '../components/InventoryView';
import SettingsView from '../components/SettingsView';
import AboutView from '../components/AboutView';
import InsightsView from '../components/InsightsView';
import LendingView from '../components/LendingView';
import MarginsView from '../components/MarginsView';
import CustomersView from '../components/CustomersView';
import CashDrawer from '../components/CashDrawer';
import { getSummaries, getInventory, getTransactions, getDailyNotification } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User, AlertCircle, Package, Calendar, Monitor, Palette, Bell, TrendingUp, CheckCircle2 } from 'lucide-react';

import '../styles/global.css';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settingsTab, setSettingsTab] = useState('general');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [summaries, setSummaries] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [inventory, setInventory] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyNotification, setDailyNotification] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchData();
        fetchDailyNotification();
    }, []);

    const fetchDailyNotification = async () => {
        try {
            const res = await getDailyNotification();
            if (res.data.show) {
                setDailyNotification(res.data);
            }
        } catch (error) {
            console.error("Error fetching daily notification:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summRes, invRes, transRes] = await Promise.all([
                getSummaries(),
                getInventory(),
                getTransactions()
            ]);
            setSummaries(summRes.data);
            setInventory(invRes.data);
            setRecentTransactions(transRes.data.reverse());
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const lowStockItems = inventory.filter(i => i.quantity < 20);

    const renderSkeleton = () => (
        <div className="dashboard-content-wrapper animate-in">
            <section className="summary-grid">
                {[1, 2, 3].map(i => <div key={i} className="revenue-card glass shimmer" style={{ height: 160 }} />)}
            </section>
            <div className="dashboard-content">
                <div className="left-column">
                    <div className="chart-container glass shimmer" style={{ height: 400 }} />
                    <div className="stats-row">
                        <div className="mini-card glass shimmer" style={{ height: 280 }} />
                        <div className="mini-card glass shimmer" style={{ height: 280 }} />
                    </div>
                </div>
                <div className="right-column">
                    <div className="billing-wrapper glass shimmer" style={{ height: 400 }} />
                    <div className="inventory-preview glass shimmer" style={{ height: 200 }} />
                </div>
            </div>
        </div>
    );

    const getTrend = (curr, prev) => {
        if (!prev || prev === 0) return '+0%';
        const diff = ((curr - prev) / prev) * 100;
        return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
    };

    const renderContent = () => {
        if (loading && activeTab === 'dashboard') return renderSkeleton();

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="dashboard-content-wrapper">
                        {/* ── Revenue Summary Cards ── */}
                        <section className="summary-grid">
                            <RevenueCard
                                title="Daily Revenue"
                                amount={summaries.daily}
                                trend={getTrend(summaries.daily, summaries.prev_daily)}
                            />
                            <RevenueCard
                                title="Weekly Revenue"
                                amount={summaries.weekly}
                                trend={getTrend(summaries.weekly, summaries.prev_weekly)}
                            />
                            <RevenueCard
                                title="Monthly Revenue"
                                amount={summaries.monthly}
                                trend={getTrend(summaries.monthly, summaries.prev_monthly)}
                            />
                        </section>

                        {/* ── Main Two-Column Content ── */}
                        <div className="dashboard-content">
                            <div className="left-column">
                                <div className="chart-container glass shadow-soft">
                                    <p className="chart-title">Revenue Performance</p>
                                    <RevenueChart transactions={recentTransactions} summaries={summaries} />
                                </div>

                                <div className="stats-row">
                                    <div className="mini-card glass shadow-soft">
                                        <p className="mini-card-title">Live Transactions</p>
                                        {recentTransactions.length === 0 ? (
                                            <p className="empty-hint">Waiting for business activity…</p>
                                        ) : (
                                            <div>
                                                {recentTransactions.slice(0, 6).map((t, i) => (
                                                    <div key={i} className="mini-t-item">
                                                        <div className="mini-t-left">
                                                            <span className="mini-t-product">{t.product}</span>
                                                            <span className="mini-t-customer">
                                                                <User size={11} />
                                                                {t.customer_name || 'Walk-in Customer'}
                                                            </span>
                                                        </div>
                                                        <span className="mini-t-amount">₹{t.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mini-card glass shadow-soft inventory-count-card">
                                        <p className="mini-card-title">Catalog Size</p>
                                        <div className="growth-val">{inventory.length}</div>
                                        <p>Products tracked</p>
                                    </div>
                                </div>
                            </div>

                            <div className="right-column">
                                <div className="billing-wrapper shadow-bold">
                                    <SaleEntryForm inventory={inventory} onSaleSuccess={fetchData} />
                                </div>

                                <div className="inventory-preview glass shadow-soft">
                                    <p className="alert-title">
                                        <AlertCircle size={15} /> Stock Alerts
                                    </p>
                                    {lowStockItems.length === 0 ? (
                                        <p className="all-stocked">✅ All items well stocked!</p>
                                    ) : (
                                        <div className="stock-list">
                                            {lowStockItems.slice(0, 5).map(item => (
                                                <div key={item.product} className="stock-item">
                                                    <span>
                                                        <Package size={13} style={{ marginRight: 6, verticalAlign: 'middle', opacity: 0.5 }} />
                                                        {item.product}
                                                    </span>
                                                    <span className="stock-count">{item.quantity} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="cash-drawer-full-row animate-in">
                            <div className="section-label">
                                <Monitor size={14} /> Global Cash Position
                            </div>
                            <div className="cash-drawer-wrap shadow-soft">
                                <CashDrawer />
                            </div>
                        </div>
                    </div>
                );

            case 'sales':
                return <SalesView inventory={inventory} fetchData={fetchData} summaries={summaries} />;
            case 'inventory':
                return <InventoryView inventory={inventory} fetchData={fetchData} />;
            case 'lending':
                return <LendingView />;
            case 'insights':
                return <InsightsView inventory={inventory} transactions={recentTransactions} summaries={summaries} />;
            case 'margins':
                return <MarginsView />;
            case 'customers':
                return <CustomersView />;
            case 'settings':
                return <SettingsView initialTab={settingsTab} />;
            case 'about':
                return <AboutView />;
            default:
                return (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <h2>Coming Soon</h2>
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>This feature is currently being refined.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <main className={`dashboard-main${sidebarCollapsed ? ' main-collapsed' : ''}`}>
                <header className="main-header glass shadow-soft">
                    <div className="header-info">
                        <h1>
                            NEURAL CORE
                            <span className="tab-pill">
                                {activeTab === 'dashboard' ? 'Overview' :
                                    activeTab === 'sales' ? 'Quick Bill' :
                                        activeTab === 'lending' ? 'Khata Book' :
                                            activeTab === 'insights' ? 'AI Insights' :
                                                activeTab === 'margins' ? 'Profit Analysis' :
                                                    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </span>
                        </h1>
                        <p>High-fidelity oversight of your neural trade infrastructure.</p>
                    </div>

                    <div className="header-actions">
                        <div className="notification-wrapper">
                            <button
                                className={`header-action-btn ${showNotifications ? 'active' : ''}`}
                                onClick={() => setShowNotifications(!showNotifications)}
                                title="Notifications"
                            >
                                <Bell size={20} />
                                {dailyNotification && <span className="noti-badge" />}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown glass shadow-bold animate-in">
                                    <div className="noti-header">
                                        <h3>System Notifications</h3>
                                        <button onClick={() => setShowNotifications(false)} className="close-noti">
                                            <CheckCircle2 size={14} />
                                        </button>
                                    </div>
                                    <div className="noti-body">
                                        {dailyNotification ? (
                                            <div className="noti-item highlight">
                                                <div className="noti-header-mini">
                                                    <div className="noti-icon pulse">
                                                        <TrendingUp size={20} />
                                                    </div>
                                                    <div className="noti-meta-top">
                                                        <p className="noti-title">Neural Performance Analysis</p>
                                                        <span>Yesterday • {dailyNotification.date}</span>
                                                    </div>
                                                </div>
                                                <div className="noti-content-main">
                                                    <p className="noti-text">{dailyNotification.message}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="noti-empty">
                                                <p>No new notifications today.</p>
                                                <span>Check back tomorrow for your daily report.</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="noti-footer">
                                        <button onClick={() => {
                                            setSettingsTab('notifications');
                                            setActiveTab('settings');
                                            setShowNotifications(false);
                                        }}>
                                            Notification Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="header-action-btn"
                            onClick={() => {
                                setSettingsTab('appearance');
                                setActiveTab('settings');
                            }}
                            title="Visual Experience"
                        >
                            <Palette size={20} />
                        </button>
                        <div className="header-date glass">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                <div className="content-framer animate-in">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
