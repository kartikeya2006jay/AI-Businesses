import React, { useState, useEffect } from 'react';
import { Settings, Bell, Shield, User, Database, Save, Key, Download, CheckCircle, AlertCircle, X } from 'lucide-react';
import { getSettings, updateSettings, changePassword, getTransactions, getInventory } from '../services/api';
import '../styles/SettingsView.css';

const SettingsView = () => {
    const [settings, setSettings] = useState({
        business_name: 'Apex Retail',
        email: 'admin@apexretail.com',
        notifications_low_stock: true,
        notifications_daily_reports: true
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSettings();
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(settings);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: 'Update failed. Please try again.' });
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
            setStatus({ type: 'success', message: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.detail || 'Change failed.' });
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

            // Simple CSV conversion if it's an array of objects
            if (Array.isArray(data) && data.length > 0) {
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
                const csv = `${headers}\n${rows}`;
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
        }
    };

    return (
        <div className="settings-view">
            <div className="view-header">
                <h2>Settings</h2>
                {status && (
                    <div className={`status-pill ${status.type}`}>
                        {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {status.message}
                    </div>
                )}
            </div>

            <div className="settings-grid">
                <section className="settings-group glass">
                    <div className="group-header">
                        <User size={20} />
                        <h3>Profile Settings</h3>
                    </div>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="setting-item">
                            <label>Business Name</label>
                            <input
                                type="text"
                                value={settings.business_name}
                                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Bell size={20} />
                        <h3>Notifications</h3>
                    </div>
                    <div className="toggle-item">
                        <span>Low Stock Alerts</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications_low_stock}
                            onChange={(e) => setSettings({ ...settings, notifications_low_stock: e.target.checked })}
                        />
                    </div>
                    <div className="toggle-item">
                        <span>Daily Reports</span>
                        <input
                            type="checkbox"
                            checked={settings.notifications_daily_reports}
                            onChange={(e) => setSettings({ ...settings, notifications_daily_reports: e.target.checked })}
                        />
                    </div>
                    <button onClick={handleUpdateProfile} className="save-btn" style={{ marginTop: '2rem' }}>
                        Save Preferences
                    </button>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Shield size={20} />
                        <h3>Privacy & Security</h3>
                    </div>
                    <p>Manage your account security and authentication methods.</p>
                    <button className="outline-btn" onClick={() => setShowPasswordModal(true)}>
                        <Key size={16} style={{ marginRight: '8px' }} />
                        Change Password
                    </button>
                    <button className="outline-btn">
                        <Shield size={16} style={{ marginRight: '8px' }} />
                        Two-Factor Authentication
                    </button>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Database size={20} />
                        <h3>Data Management</h3>
                    </div>
                    <p>Download your transaction history or inventory data as CSV for your records.</p>
                    <div className="button-row">
                        <button className="outline-btn" onClick={() => handleExport('transactions')}>
                            <Download size={16} style={{ marginRight: '8px' }} />
                            Export Txns
                        </button>
                        <button className="outline-btn" onClick={() => handleExport('inventory')}>
                            <Download size={16} style={{ marginRight: '8px' }} />
                            Export Inv
                        </button>
                    </div>
                </section>
            </div>

            {showPasswordModal && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal">
                        <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                            <X size={20} />
                        </button>
                        <h2>Change Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="setting-item">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="setting-item">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div className="setting-item">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Change Password'}
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
