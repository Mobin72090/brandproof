import React from 'react';
import { History, FileText, CheckCircle2, Clock, Shield } from 'lucide-react';

export default function AuditHistoryView({
  drafts = [],
  reviewHistory = [],
  onSelectDraft,
  onNavigate
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <History size={20} style={{ color: '#818cf8' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700 }}>
            Governance Audit & Review Log
          </h2>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          Immutable record of editorial state transitions, reviewer comments, and publication sign-offs.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
          Drafts Review Status Summary
        </h3>

        {drafts.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No drafts available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {drafts.map((d) => {
              const statusClass = d.review_status.toLowerCase().replace(' ', '-');
              return (
                <div
                  key={d.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '4px' }}>
                      {d.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Author: <strong>{d.author}</strong> • Channel: {d.channel} • Last Modified: {new Date(d.updated_at).toLocaleString()}
                    </div>
                    {d.reviewer_notes && (
                      <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '6px' }}>
                        Reviewer Note: "{d.reviewer_notes}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-badge ${statusClass}`}>
                      {d.review_status}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onSelectDraft(d);
                        onNavigate('audit');
                      }}
                    >
                      Audit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
