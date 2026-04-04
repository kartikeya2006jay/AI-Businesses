import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, User, Database, Save, Key, Download, CheckCircle, AlertCircle, X, Globe, Phone, MapPin, Monitor, CreditCard, Sun, Moon, Droplet, LogOut } from 'lucide-react';
import { getSettings, updateSettings, changePassword, getTransactions, getInventory } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/SettingsView.css';

const SettingsView = () => {
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        business_name: 'Apex Retail',
        email: 'admin@apexretail.com',
        phone: '+91 98765 43210',
        address: '123, MG Road, Bangalore',
        currency: 'INR',
        notifications_low_stock: true,
        notifications_daily_reports: true,
        theme: 'glass'
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSettings();
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(settings);
            setStatus({ type: 'success', message: 'Settings saved successfully.' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setStatus({ type: 'error', message: 'Passwords do not match!' });
            return;
        }
        setLoading(true);
        try {
            await changePassword({
                current_password: passwords.current,
                new_password: passwords.new
            });
            setStatus({ type: 'success', message: 'Password updated successfully.' });
            setShowPasswordModal(false);
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.detail || 'Update failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            let data, filename;
            if (type === 'transactions') {
                const res = await getTransactions();
                data = res.data;
                filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
            } else {
                const res = await getInventory();
                data = res.data;
                filename = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
            }

            if (Array.isArray(data) && data.length > 0) {
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
                const csv = `${headers} \n${rows} `;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', filename);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err) {
            console.error("Export failed", err);
            setStatus({ type: 'error', message: 'Export failed.' });
        }
    };

    const menuItems = [
        { id: 'general', label: 'Business Profile', icon: <User size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> },
        { id: 'data', label: 'Data & Backup', icon: <Database size={18} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="settings-panel animate-in">
                        <div className="panel-header">
                            <h2>Business Profile</h2>
                            <p>Manage your public business identity and contact information.</p>
                        </div>
                        <form className="settings-form" onSubmit={handleUpdateProfile}>
                            <div className="form-grid">
                                <div className="setting-item">
                                    <label><User size={14} /> Shop / Business Name</label>
                                    <input type="text" value={settings.business_name} onChange={e => setSettings({ ...settings, business_name: e.target.value })} />
                                </div>
                                <div className="setting-item">
                                    <label><Globe size={14} /> Currency Unit</label>
                                    <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                                        <option value="INR">Indian Rupee (₹)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>
                                <div className="setting-item">
                                    <label><Save size={14} /> Official Email</label>
                                    <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                                </div>
                                <div className="setting-item">
                                    <label><Phone size={14} /> Contact Number</label>
                                    <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
                                </div>
                                <div className="setting-item full-width">
                                    <label><MapPin size={14} /> Store Address</label>
                                    <textarea rows="3" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="prime-btn" disabled={loading}>
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'security':
                return (
                    <div className="settings-panel animate-in">
                        <div className="panel-header">
                            <h2>Security & Protection</h2>
                            <p>Secure your business records and account access.</p>
                        </div>
                        <div className="security-options">
                            <div className="security-card glass">
                                <div className="sc-info">
                                    <Key size={24} />
                                    <div>
                                        <h4>Account Password</h4>
                                        <p>Update your credentials regularly for better safety.</p>
                                    </div>
                                </div>
                                <button className="sec-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                            </div>
                            <div className="security-card glass">
                                <div className="sc-info">
                                    <Shield size={24} />
                                    <div>
                                        <h4>Two-Factor Authentication</h4>
                                        <p>Add an extra layer of protection using OTP.</p>
                                    </div>
                                </div>
                                <button className="sec-btn disabled">Enable 2FA</button>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-panel animate-in">
                        <div className="panel-header">
                            <h2>Communication Preferences</h2>
                            <p>Control how and when you receive business alerts.</p>
                        </div>
                        <div className="toggle-list">
                            <div className="toggle-row glass">
                                <div className="tr-text">
                                    <h4>Inventory Alerts</h4>
                                    <p>Get notified when products drop below their threshold.</p>
                                </div>
                                <input type="checkbox" checked={settings.notifications_low_stock} onChange={e => setSettings({ ...settings, notifications_low_stock: e.target.checked })} />
                            </div>
                            <div className="toggle-row glass">
                                <div className="tr-text">
                                    <h4>End of Day Reports</h4>
                                    <p>Automatic summary of daily cash flow and sales.</p>
                                </div>
                                <input type="checkbox" checked={settings.notifications_daily_reports} onChange={e => setSettings({ ...settings, notifications_daily_reports: e.target.checked })} />
                            </div>
                        </div>
                        <button className="prime-btn" onClick={handleUpdateProfile} style={{ marginTop: '2rem' }}>Save Preferences</button>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="settings-panel animate-in">
                        <div className="panel-header">
                            <h2>Visual Experience</h2>
                            <p>Customize the look and feel of your merchant terminal.</p>
                        </div>
                        <div className="theme-grid">
                            {[
                                { id: 'glass', name: 'Lo-Fi Dusk', icon: <Droplet color="#89c4af" />, desc: 'Warm earthy analog, cozy & readable' },
                                { id: 'midnight', name: 'Midnight Glow', icon: <Moon color="#38bdf8" />, desc: 'Deep OLED dark with navy neon' },
                                { id: 'royal', name: 'Obsidian Pro', icon: <Monitor color="#6366f1" />, desc: 'Premium warm charcoal dark mode' },
                                { id: 'sunset', name: 'Titanium Elite', icon: <Monitor color="#e2e8f0" />, desc: 'The absolute pinnacle of luxury' },
                                { id: 'cream', name: 'Golden Cream', icon: <Droplet color="#d97706" />, desc: 'Premium royal warmth' },
                                { id: 'light', name: 'Pure White', icon: <Sun color="#1d4ed8" />, desc: 'Crisp professional light mode' }
                            ].map(t => (
                                <div key={t.id}
                                    data-theme={t.id}
                                    className={`theme-card glass ${settings.theme === t.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSettings({ ...settings, theme: t.id });
                                        setTheme(t.id);
                                        // Auto-save appearance changes
                                        updateSettings({ ...settings, theme: t.id });
                                    }}>
                                    <div className="tc-icon">{t.icon}</div>
                                    <div className="tc-info">
                                        <h4>{t.name}</h4>
                                        <p>{t.desc}</p>
                                    </div>
                                    {settings.theme === t.id && <div className="tc-check"><CheckCircle size={16} /></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'data':
                return (
                    <div className="settings-panel animate-in">
                        <div className="panel-header">
                            <h2>Data Integrity & Portability</h2>
                            <p>Export your business records for accounting or offline use.</p>
                        </div>
                        <div className="data-grid">
                            <div className="data-card glass">
                                <div className="dc-icon"><CreditCard /></div>
                                <h4>Sales Transactions</h4>
                                <p>Complete history of all sales and udhaar entries.</p>
                                <button onClick={() => handleExport('transactions')}><Download size={16} /> Export CSV</button>
                            </div>
                            <div className="data-card glass">
                                <div className="dc-icon"><Database /></div>
                                <h4>Inventory Ledger</h4>
                                <p>Current stock levels, pricing, and cost history.</p>
                                <button onClick={() => handleExport('inventory')}><Download size={16} /> Export CSV</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-container glass-heavy shadow-bold">
            <aside className="settings-sidebar">
                <div className="sidebar-header">
                    <Settings size={28} className="rotating" />
                    <div>
                        <h3>Control Center</h3>
                        <span>v1.2.0-stable</span>
                    </div>
                </div>
                <nav className="settings-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            data-id={item.id}
                            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer-actions">
                    <button className="nav-btn logout-btn" onClick={() => {
                        if (window.confirm("Are you sure you want to log out?")) {
                            logout();
                        }
                    }}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <div className="sidebar-footer-msg">
                    <AlertCircle size={14} />
                    <span>Always keep your business email up to date.</span>
                </div>
            </aside>

            <main className="settings-main">
                {status && (
                    <div className={`toast - alert ${status.type} slideIn`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span>{status.message}</span>
                    </div>
                )}
                {renderContent()}
            </main>

            {showPasswordModal && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal glass-heavy animate-in">
                        <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                            <X size={20} />
                        </button>
                        <div className="modal-head">
                            <Key size={24} className="icon-main" />
                            <h2>Update Password</h2>
                            <p>Create a strong password to protect your data.</p>
                        </div>
                        <form onSubmit={handleChangePassword}>
                            <div className="setting-item">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter old password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="setting-item">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Min 8 characters"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div className="setting-item">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Repeat new password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="prime-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Secure Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsView;
