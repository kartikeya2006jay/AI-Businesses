import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Info, Settings, LogOut } from 'lucide-react';

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
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          border-radius: 0 24px 24px 0;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 3rem;
          padding: 0 0.5rem;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .sidebar-brand span {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--secondary);
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          border: none;
          background: transparent;
          border-radius: 12px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        .nav-item:hover {
          background: rgba(0, 186, 242, 0.05);
          color: var(--primary);
        }
        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 186, 242, 0.3);
        }
        .sidebar-footer {
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .logout:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
