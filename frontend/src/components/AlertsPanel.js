import React from 'react';

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
            <style jsx>{`
        .alert-item {
          padding: 0.8rem 1rem;
          border-radius: 8px;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
        }
        .alert-item.warning { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; }
        .alert-item.info { background: #eff6ff; border: 1px solid #dbeafe; color: #1e40af; }
      `}</style>
        </div>
    );
};

export default AlertsPanel;
