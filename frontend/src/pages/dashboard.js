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
                                <RevenueChart />
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
                return (
                    <div className="insights-hub glass" style={{ padding: '2rem' }}>
                        <h2>AI Insights Hub</h2>
                        <p>Ask our AI Copilot in the chat bubble for detailed financial advice and forecasting!</p>
                    </div>
                );
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
                        <h1>Apex Retail <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span></h1>
                        <p>Managing your business with intelligence.</p>
                    </div>
                    <div className="header-date glass">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </header>

                {renderContent()}
            </main>

            <ChatBox />

            <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }
        .dashboard-main {
          margin-left: 260px;
          flex: 1;
          padding: 2.5rem;
          max-width: calc(100vw - 260px);
        }
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }
        .header-info h1 { font-size: 1.8rem; margin: 0; color: var(--secondary); }
        .header-info h1 span { color: var(--primary); }
        .header-info p { margin: 0.5rem 0 0; color: #666; font-size: 0.9rem; }
        .header-date {
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 12px;
          color: var(--secondary);
        }
        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .mini-card { padding: 1.5rem; }
        .mini-card h3 { font-size: 1rem; margin-top: 0; color: #666; }
        .growth-val { font-size: 2rem; font-weight: 800; color: var(--success); margin: 0.5rem 0; }
        .mini-card p { font-size: 0.8rem; color: #888; margin: 0; }
        .inventory-preview { padding: 1.5rem; margin-top: 1.5rem; }
        .inventory-preview h3 { font-size: 1rem; margin-top: 0; margin-bottom: 1rem; }
        .stock-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .stock-item { display: flex; justify-content: space-between; font-size: 0.9rem; }
        .stock-count.warning { color: var(--error); font-weight: 700; }
        .mini-t-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(0,0,0,0.02);
          font-size: 0.85rem;
        }
        .mini-t-amount { font-weight: 700; color: var(--primary); }
        .recent-list { overflow-y: auto; max-height: 200px; }
        .empty-hint { font-size: 0.8rem; color: #999; margin: 1rem 0; }
      `}</style>
        </div>
    );
};

export default Dashboard;
