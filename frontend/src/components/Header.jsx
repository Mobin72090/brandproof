import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw, Cpu, Server } from 'lucide-react';

export default function Header({
  systemInfo,
  health,
  brands,
  selectedBrand,
  onSelectBrand,
  onSeedDemo,
  isSeeding
}) {
  const isHealthy = health?.status === 'healthy';
  const hasAi = systemInfo?.ai_active;

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">Brand Governance Studio</h1>
        {brands && brands.length > 0 && (
          <div className="header-brand-tag">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>BRAND:</span>
            <select
              value={selectedBrand?.id || ''}
              onChange={(e) => {
                const b = brands.find(brand => brand.id === Number(e.target.value));
                if (b) onSelectBrand(b);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {brands.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#131c31', color: '#fff' }}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="header-right">
        {/* Backend Connectivity Status */}
        <div className="status-indicator" title={isHealthy ? "FastAPI SQLite connected" : "Connecting..."}>
          <span className={`status-dot ${isHealthy ? 'online' : ''}`} />
          <Server size={13} style={{ color: '#94a3b8' }} />
          <span>{isHealthy ? 'API Active' : 'Connecting'}</span>
        </div>

        {/* AI Model Status */}
        <div
          className="status-indicator"
          style={{
            borderColor: hasAi ? 'rgba(99, 102, 241, 0.4)' : 'rgba(59, 130, 246, 0.3)',
            background: hasAi ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.08)'
          }}
          title={hasAi ? `AI Active: ${systemInfo?.ai_model}` : "Running deterministic rule-based checks"}
        >
          {hasAi ? (
            <>
              <Sparkles size={13} style={{ color: '#818cf8' }} />
              <span style={{ color: '#c7d2fe' }}>AI: {systemInfo?.ai_model || 'Gemini'}</span>
            </>
          ) : (
            <>
              <Cpu size={13} style={{ color: '#60a5fa' }} />
              <span style={{ color: '#93c5fd' }}>Engine: Deterministic</span>
            </>
          )}
        </div>

        {/* Seed Demo Data Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          title="Seed or reset fictional AetherCloud demo brand data"
        >
          <RefreshCw size={13} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Seeding...' : 'Reset Demo Brand'}</span>
        </button>
      </div>
    </header>
  );
}
