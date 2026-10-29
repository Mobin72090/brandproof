import React from 'react';
import { ShieldAlert, LayoutDashboard, FileCheck2 } from 'lucide-react';

export default function NotFoundView({ onNavigate }) {
  return (
    <div className="not-found-container">
      <div className="card not-found-card">
        <div className="not-found-icon-wrap">
          <ShieldAlert size={48} className="not-found-icon" />
        </div>
        <span className="badge badge-warning" style={{ alignSelf: 'center', marginBottom: '8px' }}>
          Error 404
        </span>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The requested section or route does not exist within the BrandProof governance suite. It may have been moved, renamed, or you may have followed an outdated link.
        </p>

        <div className="not-found-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('audit')}
          >
            <FileCheck2 size={16} />
            <span>Open Content Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
