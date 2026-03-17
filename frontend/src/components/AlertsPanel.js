import React from 'react';
import '../styles/AlertsPanel.css';

const AlertsPanel = () => {
    const alerts = [
        { type: 'warning', text: 'Low stock: Cold Drinks (剩 5)' },
        { type: 'info', text: 'Weekly report is ready for viewing.' }
    ];

    return (
        <div className="alerts-panel glass">
            <h3>Inventory Alerts</h3>
            <div className="alert-list">
                {alerts.map((alert, i) => (
                    <div key={i} className={`alert-item ${alert.type}`}>
                        {alert.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsPanel;
