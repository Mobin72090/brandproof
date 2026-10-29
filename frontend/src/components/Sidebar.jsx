import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  BookOpenCheck,
  History,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';

export default function Sidebar({
  activeView,
  onNavigate,
  draftsCount = 0,
  rulesCount = 0,
  factsCount = 0,
  openFindingsCount = 0,
  isOpen = false,
  onClose
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

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        <div className="sidebar-header">
          <button
            type="button"
            className="logo-btn"
            onClick={() => handleItemClick('dashboard')}
            aria-label="BrandProof Home"
            title="Go to BrandProof Dashboard"
          >
            <div className="logo-badge">BP</div>
            <div>
              <div className="logo-title">BrandProof</div>
              <div className="logo-subtitle">Governance Suite</div>
            </div>
          </button>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
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
          <div style={{ padding: '0 14px 14px' }}>
            <div
              style={{
                background: 'var(--critical-bg)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--critical)'
              }}
            >
              <ShieldAlert size={16} style={{ color: 'var(--critical)', flexShrink: 0 }} />
              <span><strong>{openFindingsCount}</strong> open issues in draft</span>
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)' }}>
            <Info size={13} />
            <span style={{ fontWeight: 600 }}>CODEX-48 Round 2 MVP</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Human-in-the-loop governance. All corrections require human reviewer sign-off.
          </div>
        </div>
      </aside>
    </>
  );
}
