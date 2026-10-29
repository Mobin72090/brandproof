import React from 'react';
import { Menu, Sparkles, RefreshCw, Cpu, Server } from 'lucide-react';

export default function Header({
  systemInfo,
  health,
  brands = [],
  selectedBrand,
  onSelectBrand,
  onSeedDemo,
  isSeeding,
  onToggleMobileMenu,
  isMobileMenuOpen = false
}) {
  const isHealthy = health?.status === 'healthy';
  const hasAi = systemInfo?.ai_active;

  return (
    <header className="top-header" role="banner">
      <div className="header-left">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="menu-toggle-btn"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={20} />
        </button>

        <h1 className="header-title">Brand Governance Studio</h1>

        {brands && brands.length > 0 && (
          <div className="header-brand-tag" title="Active Brand Context">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>BRAND:</span>
            <select
              className="header-brand-select"
              value={selectedBrand?.id || ''}
              onChange={(e) => {
                const b = brands.find(brand => brand.id === Number(e.target.value));
                if (b) onSelectBrand(b);
              }}
              aria-label="Select active brand profile"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Backend Connectivity Status */}
        <div
          className="status-indicator"
          title={isHealthy ? "FastAPI SQLite connected and operational" : "Connecting to backend..."}
        >
          <span className={`status-dot ${isHealthy ? 'online' : ''}`} />
          <Server size={13} style={{ color: 'var(--text-subtle)' }} />
          <span>{isHealthy ? 'API Active' : 'Connecting'}</span>
        </div>

        {/* AI Model Status */}
        <div
          className="status-indicator"
          style={{
            borderColor: hasAi ? 'var(--primary-border)' : 'var(--border-color)',
            background: hasAi ? 'var(--primary-light)' : '#f8fafc'
          }}
          title={hasAi ? `AI Active: ${systemInfo?.ai_model}` : "Running deterministic rule-based checks"}
        >
          {hasAi ? (
            <>
              <Sparkles size={13} style={{ color: 'var(--primary)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>AI: {systemInfo?.ai_model || 'Gemini'}</span>
            </>
          ) : (
            <>
              <Cpu size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Engine: Deterministic</span>
            </>
          )}
        </div>

        {/* Seed Demo Data Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          title="Seed or restore fictional AetherCloud demo brand data"
          aria-label="Reset demo brand data"
        >
          <RefreshCw size={13} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Seeding...' : 'Reset Demo Brand'}</span>
        </button>
      </div>
    </header>
  );
}
