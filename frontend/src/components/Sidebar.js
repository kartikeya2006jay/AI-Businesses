import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Info, Settings,
  LogOut, BookOpen, User, ChevronLeft, ChevronRight,
  TrendingUp, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { logout } = useAuth();

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { id: 'sales', icon: <ShoppingCart size={18} />, label: 'Quick Bill', badge: 'Popular' },
        { id: 'inventory', icon: <Package size={18} />, label: 'Inventory' },
        { id: 'customers', icon: <User size={18} />, label: 'Customers', badge: 'New' },
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { id: 'lending', icon: <BookOpen size={18} />, label: 'Khata Book' },
        { id: 'insights', icon: <Brain size={18} />, label: 'AI Insights' },
        { id: 'margins', icon: <TrendingUp size={18} />, label: 'Profits' },
        { id: 'settings', icon: <Settings size={18} />, label: 'Settings' },
        { id: 'about', icon: <Info size={18} />, label: 'About' },
      ]
    }
  ];

  return (
    <div className={`sidebar glass-heavy ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-logo rotating-slow">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M6 26V6L16 16L26 6V26" stroke="url(#lg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="3" fill="white">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="lg" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00baf2" />
                <stop offset="1" stopColor="#002e6e" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!collapsed && <span className="brand-name-premium">Merchant Copilot</span>}
      </div>

      {/* Collapse Toggle */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {menuGroups.map(group => (
          <div key={group.label} className="nav-group">
            {!collapsed && <div className="nav-section-label">{group.label}</div>}
            {group.items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <div className="item-icon">{item.icon}</div>
                {!collapsed && <span className="item-label">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`item-badge ${item.id === 'customers' ? 'alt' : ''}`}>{item.badge}</span>
                )}
                {collapsed && item.badge && <span className="collapsed-dot" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={logout} title={collapsed ? 'Logout' : undefined}>
          <div className="item-icon"><LogOut size={18} /></div>
          {!collapsed && <span className="item-label">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
