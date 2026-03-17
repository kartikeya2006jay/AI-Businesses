import React from 'react';
import { Settings, Bell, Shield, User, Database } from 'lucide-react';
import '../styles/SettingsView.css';

const SettingsView = () => {
    return (
        <div className="settings-view">
            <div className="view-header">
                <h2>Settings</h2>
            </div>

            <div className="settings-grid">
                <section className="settings-group glass">
                    <div className="group-header">
                        <User size={20} />
                        <h3>Profile Settings</h3>
                    </div>
                    <div className="setting-item">
                        <label>Business Name</label>
                        <input type="text" defaultValue="Apex Retail" />
                    </div>
                    <div className="setting-item">
                        <label>Email Address</label>
                        <input type="email" defaultValue="admin@apexretail.com" />
                    </div>
                    <button className="save-btn">Update Profile</button>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Bell size={20} />
                        <h3>Notifications</h3>
                    </div>
                    <div className="toggle-item">
                        <span>Low Stock Alerts</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                        <span>Daily Reports</span>
                        <input type="checkbox" defaultChecked />
                    </div>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Shield size={20} />
                        <h3>Privacy & Security</h3>
                    </div>
                    <button className="outline-btn">Change Password</button>
                    <button className="outline-btn">Two-Factor Authentication</button>
                </section>

                <section className="settings-group glass">
                    <div className="group-header">
                        <Database size={20} />
                        <h3>Data Management</h3>
                    </div>
                    <p>Download your transaction history or inventory data as CSV.</p>
                    <div className="button-row">
                        <button className="outline-btn">Export Transactions</button>
                        <button className="outline-btn">Export Inventory</button>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default SettingsView;
