import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RevenueCard from '../components/RevenueCard';
import RevenueChart from '../components/RevenueChart';
import SaleEntryForm from '../components/SaleEntryForm';
import AlertsPanel from '../components/AlertsPanel';
import ChatBox from '../components/ChatBox';
import SalesView from '../components/SalesView';
import InventoryView from '../components/InventoryView';
import SettingsView from '../components/SettingsView';
import AboutView from '../components/AboutView';
import InsightsView from '../components/InsightsView';
import { getSummaries, getInventory, getTransactions } from '../services/api';
import '../styles/global.css';
import '../styles/dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [summaries, setSummaries] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [inventory, setInventory] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <section className="summary-grid">
                            <RevenueCard title="Daily Revenue" amount={summaries.daily} trend="+12%" />
                            <RevenueCard title="Weekly Revenue" amount={summaries.weekly} trend="+5.4%" />
                            <RevenueCard title="Monthly Revenue" amount={summaries.monthly} trend="+18%" />
                        </section>

                        <div className="dashboard-content">
                            <div className="left-column">
                                <RevenueChart transactions={recentTransactions} />
                                <div className="stats-row">
                                    <div className="mini-card glass recent-list">
                                        <h3>Recent Activity</h3>
                                        <div className="mini-transactions">
                                            {recentTransactions.slice(0, 5).map((t, i) => (
                                                <div key={i} className="mini-t-item">
                                                    <span>{t.product}</span>
                                                    <span className="mini-t-amount">₹{t.amount}</span>
                                                </div>
                                            ))}
                                            {recentTransactions.length === 0 && <p className="empty-hint">No recent transactions</p>}
                                        </div>
                                    </div>
                                    <div className="mini-card glass">
                                        <h3>Product Variety</h3>
                                        <div className="growth-val">{inventory.length}</div>
                                        <p>Total items in catalog</p>
                                    </div>
                                </div>
                            </div>

                            <div className="right-column">
                                <SaleEntryForm inventory={inventory} onSaleSuccess={fetchData} />
                                <div className="inventory-preview glass">
                                    <h3>Low Stock Items</h3>
                                    <div className="stock-list">
                                        {inventory.filter(i => i.quantity < 20).map(item => (
                                            <div key={item.product} className="stock-item">
                                                <span>{item.product}</span>
                                                <span className="stock-count warning">{item.quantity} left</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'sales':
                return <SalesView inventory={inventory} fetchData={fetchData} summaries={summaries} />;
            case 'inventory':
                return <InventoryView inventory={inventory} fetchData={fetchData} />;
            case 'insights':
                return <InsightsView inventory={inventory} transactions={recentTransactions} summaries={summaries} />;
            case 'settings':
                return <SettingsView />;
            case 'about':
                return <AboutView />;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="dashboard-main">
                <header className="main-header">
                    <div className="header-info">
                        <h1>Business Overview <span className="tab-pill">{activeTab}</span></h1>
                        <p>Welcome back! Here's what's happening with your store today.</p>
                    </div>
                    <div className="header-actions">
                        <div className="header-date glass">
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
