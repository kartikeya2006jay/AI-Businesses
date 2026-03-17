import React from 'react';
import { Settings, Bell, Shield, User, Database } from 'lucide-react';

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

            <style jsx>{`
        .settings-view { padding: 1rem; }
        .view-header { margin-bottom: 2rem; }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }
        .settings-group { padding: 2rem; }
        .group-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
          color: var(--secondary);
        }
        .settings-group h3 { margin: 0; font-size: 1.1rem; }
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .setting-item label { font-size: 0.85rem; font-weight: 600; color: #666; }
        .setting-item input {
          background: rgba(255,255,255,0.5);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 0.8rem;
          border-radius: 10px;
        }
        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .save-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .outline-btn {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid var(--primary);
          background: transparent;
          color: var(--primary);
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1rem;
        }
        .button-row { display: flex; gap: 1rem; }
        .button-row .outline-btn { margin-bottom: 0; }
        p { font-size: 0.85rem; color: #666; margin-bottom: 1.5rem; }
      `}</style>
        </div>
    );
};

export default SettingsView;
