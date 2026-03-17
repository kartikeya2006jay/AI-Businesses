import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Info, Settings, LogOut } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'sales', icon: <ShoppingCart size={20} />, label: 'Sales' },
    { id: 'inventory', icon: <Package size={20} />, label: 'Inventory' },
    { id: 'insights', icon: <Info size={20} />, label: 'AI Insights' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    { id: 'about', icon: <Info size={20} />, label: 'About' },
  ];

  return (
    <div className="sidebar glass">
      <div className="sidebar-brand">
        <div className="brand-logo">M</div>
        <span>Merchant Copilot</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {menuItems.slice(0, 3).map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="item-icon">{item.icon}</div>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: '1.5rem' }}>Insights & Support</div>
        {menuItems.slice(3).map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="item-icon">{item.icon}</div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout">
          <div className="item-icon"><LogOut size={20} /></div>
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
