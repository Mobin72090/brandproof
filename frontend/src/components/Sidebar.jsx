import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  BookOpenCheck,
  History,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function Sidebar({
  activeView,
  onNavigate,
  draftsCount = 0,
  rulesCount = 0,
  factsCount = 0,
  openFindingsCount = 0
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'audit',
      label: 'Content Review Studio',
      icon: FileCheck2,
      badge: draftsCount > 0 ? draftsCount : null
    },
    {
      id: 'guidelines',
      label: 'Brand Rules & Facts',
      icon: BookOpenCheck,
      badge: (rulesCount + factsCount) > 0 ? (rulesCount + factsCount) : null
    },
    {
      id: 'history',
      label: 'Audit & Review Log',
      icon: History,
      badge: null
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">BP</div>
        <div>
          <div className="logo-title">BrandProof</div>
          <div className="logo-subtitle">Governance Suite</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {openFindingsCount > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#fca5a5'
          }}>
            <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span><strong>{openFindingsCount}</strong> open issues in current draft</span>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
          <Info size={13} />
          <span>CODEX-48 Round 2 MVP</span>
        </div>
        <div style={{ fontSize: '0.7rem' }}>
          Human-in-the-loop governance. All corrections require human reviewer sign-off.
        </div>
      </div>
    </aside>
  );
}
