import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  Layers,
  Sparkles,
  Info,
  Check,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';

export default function BrandTrustReport({
  draftId,
  findingsCount = 0,
  onRefreshTrigger
}) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    if (!draftId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTrustReport(draftId);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load Brand Trust Report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [draftId, findingsCount, onRefreshTrigger]);

  if (isLoading && !report) {
    return (
      <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
        <p>Computing Brand Trust Report from persisted findings...</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="card" style={{ padding: '24px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
          <ShieldAlert size={18} />
          <strong>Trust Report Unavailable</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={fetchReport} style={{ marginTop: '12px' }}>
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!report) return null;

  const criticalCount = report.unresolved_by_severity.critical || 0;
  const highCount = report.unresolved_by_severity.high || 0;
  const mediumCount = report.unresolved_by_severity.medium || 0;
  const lowCount = report.unresolved_by_severity.low || 0;

  const isApproved = report.review_status === 'Approved';
  const isBlocked = report.is_approval_blocked;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Banner: Publication Readiness */}
      <div style={{
        background: isApproved
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
          : isBlocked
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid',
        borderColor: isApproved
          ? 'rgba(16, 185, 129, 0.4)'
          : isBlocked
          ? 'rgba(239, 68, 68, 0.4)'
          : 'rgba(99, 102, 241, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
              Governance Audit Summary
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Draft #{report.draft_id}: {report.draft_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
              {report.publication_readiness}
            </h3>
            {isApproved ? (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Compliant & Signed
              </span>
            ) : isBlocked ? (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <ShieldAlert size={13} style={{ marginRight: '4px' }} /> Approval Blocked
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Ready for Review
              </span>
            )}
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchReport}
          disabled={isLoading}
          title="Refresh Trust Report"
        >
          <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
          <span>Refresh Report</span>
        </button>
      </div>

      {/* Blockers or Readiness Notice */}
      {report.blockers && report.blockers.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontWeight: 600, fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <span>Active Publication Blockers ({report.blockers.length}):</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            {report.blockers.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4-Card Executive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Card 1: Critical Findings */}
        <div className="card" style={{ padding: '16px', borderLeft: `4px solid ${criticalCount > 0 ? '#ef4444' : '#10b981'}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Critical Blockers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: criticalCount > 0 ? '#ef4444' : '#10b981', margin: '4px 0' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {criticalCount === 0 ? 'Zero critical issues' : 'Must be resolved to approve'}
          </div>
        </div>

        {/* Card 2: Warnings & Style */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Warnings (High/Med/Low)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24', margin: '4px 0' }}>
            {highCount + mediumCount + lowCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {highCount} High • {mediumCount} Med • {lowCount} Low
          </div>
        </div>

        {/* Card 3: Resolved Corrections */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Resolved Corrections
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', margin: '4px 0' }}>
            {report.resolved_summary.total_resolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {report.resolved_summary.accepted} Accepted • {report.resolved_summary.edited} Edited • {report.resolved_summary.dismissed} Dismissed
          </div>
        </div>

        {/* Card 4: Category Breakdown */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Open Category Issues
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#818cf8', margin: '4px 0' }}>
            {report.total_unresolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {report.unresolved_by_category.fact_conflicts} Fact • {report.unresolved_by_category.prohibited_claims} Claims • {report.unresolved_by_category.terminology} Terms
          </div>
        </div>
      </div>

      {/* Category Pills & Breakdown Detail */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: '#818cf8' }} />
          Compliance Category Breakdown
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Verified Fact Conflicts</span>
              <span className={`badge ${report.unresolved_by_category.fact_conflicts > 0 ? 'badge-critical' : 'badge-low'}`}>
                {report.unresolved_by_category.fact_conflicts} open
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Audited against official incorporation, SLA addendums, and SOC-2 certificates.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Prohibited Claims</span>
              <span className={`badge ${report.unresolved_by_category.prohibited_claims > 0 ? 'badge-high' : 'badge-low'}`}>
                {report.unresolved_by_category.prohibited_claims} open
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Checks for unverified absolutes, illegal SLA guarantees, or unsubstantiated pricing superiority.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Terminology & Product Names</span>
              <span className={`badge ${report.unresolved_by_category.terminology > 0 ? 'badge-medium' : 'badge-low'}`}>
                {report.unresolved_by_category.terminology} open
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Guarantees approved trademark casing and intercepts retired or deprecated product names.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>Voice, Style & Tone</span>
              <span className={`badge ${report.unresolved_by_category.voice_and_tone > 0 ? 'badge-low' : 'badge-low'}`}>
                {report.unresolved_by_category.voice_and_tone} open
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Intercepts corporate clichés, empty buzzwords, and passive constructions.
            </p>
          </div>
        </div>
      </div>

      {/* Underlying Evidence References */}
      {report.evidence_references && report.evidence_references.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} style={{ color: '#818cf8' }} />
            Active Evidence References ({report.evidence_references.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {report.evidence_references.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span className={`badge badge-${item.severity}`}>{item.severity}</span>
                    <strong style={{ color: '#f8fafc' }}>{item.title}</strong>
                    {item.matched_text && (
                      <code style={{ fontSize: '0.74rem', color: '#fca5a5', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '3px' }}>
                        "{item.matched_text}"
                      </code>
                    )}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                    {item.evidence}
                  </div>
                </div>
                {item.suggested_correction && (
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7', textAlign: 'right' }}>
                    Fix: "{item.suggested_correction}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transparent Calculation Basis Callout */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.04)',
        border: '1px dashed rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        fontSize: '0.78rem',
        color: '#94a3b8'
      }}>
        <Info size={15} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#c7d2fe' }}>Calculation Transparency:</strong> {report.calculation_basis}
          <div style={{ marginTop: '2px', color: '#64748b' }}>
            Generated deterministically at: {new Date(report.generated_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
