import React, { useState, useEffect } from 'react';
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
import { getSummaries, getInventory, getTransactions } from '../services/api';
import { Moon, Sun, User, AlertCircle, Package } from 'lucide-react';

import '../styles/global.css';
import '../styles/dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [summaries, setSummaries] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [inventory, setInventory] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
        }
    };

    const lowStockItems = inventory.filter(i => i.quantity < 20);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="dashboard-content-wrapper">

                        {/* ── Revenue Summary Cards ── */}
                        <section className="summary-grid">
                            <RevenueCard title="Daily Revenue" amount={summaries.daily} trend="+12.5%" />
                            <RevenueCard title="Weekly Revenue" amount={summaries.weekly} trend="+8.2%" />
                            <RevenueCard title="Monthly Revenue" amount={summaries.monthly} trend="+22.1%" />
                        </section>

                        {/* ── Main Two-Column Content ── */}
                        <div className="dashboard-content">

                            {/* LEFT: Chart + Mini-cards */}
                            <div className="left-column">

                                {/* Revenue Chart */}
                                <div className="chart-container glass shadow-soft">
                                    <p className="chart-title">Revenue Performance</p>
                                    <RevenueChart transactions={recentTransactions} summaries={summaries} />
                                </div>

                                {/* Mini stats row */}
                                <div className="stats-row">

                                    {/* Live Transaction Feed */}
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

                                    {/* Inventory Count */}
                                    <div className="mini-card glass shadow-soft inventory-count-card">
                                        <p className="mini-card-title">Catalog Size</p>
                                        <div className="growth-val">{inventory.length}</div>
                                        <p>Products tracked</p>
                                    </div>

                                </div>
                            </div>

                            {/* RIGHT: New Sale + Stock Alerts */}
                            <div className="right-column">

                                {/* Sale Entry Form */}
                                <div className="billing-wrapper shadow-bold">
                                    <SaleEntryForm inventory={inventory} onSaleSuccess={fetchData} />
                                </div>

                                {/* Stock Alerts */}
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
                                {/* Cash Drawer Waterfall */}
                                <div className="cash-drawer-preview glass shadow-soft">
                                    <CashDrawer />
                                </div>
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
                return <SettingsView />;
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
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="dashboard-main">

                <header className="main-header">
                    <div className="header-info">
                        <h1>
                            Business Hub
                            <span className="tab-pill">{activeTab}</span>
                        </h1>
                        <p>Real-time oversight of your merchant operations.</p>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            className="theme-toggle"
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <div className="header-date">
                            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                </header>

                <div className="content-framer">
                    {renderContent()}
                </div>

            </main>

            <ChatBox />
        </div>
    );
};

export default Dashboard;
