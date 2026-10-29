import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Layers,
  Info
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
  const [prevDraftId, setPrevDraftId] = useState(draftId);

  // Reset report state immediately when switching to a different draft
  if (draftId !== prevDraftId) {
    setPrevDraftId(draftId);
    setReport(null);
    setIsLoading(true);
    setError(null);
  }

  const fetchReport = useCallback(async () => {
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
  }, [draftId]);

  useEffect(() => {
    let ignore = false;
    async function loadReport() {
      try {
        const data = await api.getTrustReport(draftId);
        if (!ignore) {
          setReport(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load Brand Trust Report.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (draftId) {
      loadReport();
    }

    return () => {
      ignore = true;
    };
  }, [draftId, findingsCount, onRefreshTrigger]);

  if (isLoading && !report) {
    return (
      <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
        <p style={{ fontWeight: 500 }}>Computing Brand Trust Report from persisted findings...</p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="card" style={{ padding: '24px', borderColor: 'var(--critical-border)', background: 'var(--critical-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--critical)', marginBottom: '8px' }}>
          <ShieldAlert size={18} />
          <strong>Trust Report Unavailable</strong>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--critical)' }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={fetchReport} style={{ marginTop: '12px' }}>
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
          ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
          : isBlocked
          ? 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)'
          : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
        border: '1px solid',
        borderColor: isApproved
          ? '#bbf7d0'
          : isBlocked
          ? '#fecaca'
          : 'var(--primary-border)',
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
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)' }}>
              Governance Audit Summary
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--border-hover)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Draft #{report.draft_id}: {report.draft_title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {report.publication_readiness}
            </h3>
            {isApproved ? (
              <span className="badge badge-success" style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Compliant & Signed
              </span>
            ) : isBlocked ? (
              <span className="badge badge-critical">
                <ShieldAlert size={13} style={{ marginRight: '4px' }} /> Approval Blocked
              </span>
            ) : (
              <span className="badge badge-low">
                <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Ready for Review
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
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
          background: 'var(--critical-bg)',
          border: '1px solid var(--critical-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--critical)', fontWeight: 600, fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--critical)' }} />
            <span>Active Publication Blockers ({report.blockers.length}):</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '0.82rem', color: 'var(--critical)' }}>
            {report.blockers.map((b, idx) => (
              <li key={idx} style={{ marginTop: '2px' }}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4-Card Executive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Card 1: Critical Findings */}
        <div className="card" style={{ padding: '16px', borderLeft: `4px solid ${criticalCount > 0 ? 'var(--critical)' : '#16a34a'}` }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            Critical Blockers
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: criticalCount > 0 ? 'var(--critical)' : '#16a34a', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {criticalCount === 0 ? 'Zero critical blockers' : 'Must resolve to approve'}
          </div>
        </div>

        {/* Card 2: Warnings & Style */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            Warnings (High/Med/Low)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
            {highCount + mediumCount + lowCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {highCount} High • {mediumCount} Med • {lowCount} Low
          </div>
        </div>

        {/* Card 3: Resolved Corrections */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            Resolved Corrections
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
            {report.resolved_summary.total_resolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {report.resolved_summary.accepted} Accepted • {report.resolved_summary.edited} Edited • {report.resolved_summary.dismissed} Dismissed
          </div>
        </div>

        {/* Card 4: Category Breakdown */}
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
            Total Open Issues
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
            {report.total_unresolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {report.unresolved_by_category.fact_conflicts} Fact • {report.unresolved_by_category.prohibited_claims} Claims • {report.unresolved_by_category.terminology} Terms
          </div>
        </div>
      </div>

      {/* Category Pills & Breakdown Detail */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Layers size={16} style={{ color: 'var(--primary)' }} />
          Compliance Category Breakdown
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Fact Conflicts</span>
              <span className={`badge ${report.unresolved_by_category.fact_conflicts > 0 ? 'badge-critical' : 'badge-low'}`}>
                {report.unresolved_by_category.fact_conflicts} open
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Audited against incorporation, SLA addendums, and certifications.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Prohibited Claims</span>
              <span className={`badge ${report.unresolved_by_category.prohibited_claims > 0 ? 'badge-high' : 'badge-low'}`}>
                {report.unresolved_by_category.prohibited_claims} open
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Checks for unverified absolutes, illegal SLA guarantees, or pricing tropes.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Terminology</span>
              <span className={`badge ${report.unresolved_by_category.terminology > 0 ? 'badge-medium' : 'badge-low'}`}>
                {report.unresolved_by_category.terminology} open
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Guarantees approved trademark casing and intercepts retired products.
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Voice & Tone</span>
              <span className={`badge ${report.unresolved_by_category.voice_and_tone > 0 ? 'badge-low' : 'badge-low'}`}>
                {report.unresolved_by_category.voice_and_tone} open
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intercepts corporate clichés, empty buzzwords, and passive phrasing.
            </p>
          </div>
        </div>
      </div>

      {/* Underlying Evidence References */}
      {report.evidence_references && report.evidence_references.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
            Active Evidence References ({report.evidence_references.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
            {report.evidence_references.map((item) => (
              <div key={item.id} style={{
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${item.severity}`}>{item.severity}</span>
                    <strong style={{ color: 'var(--text-main)' }}>{item.title}</strong>
                    {item.matched_text && (
                      <code style={{ fontSize: '0.75rem', color: 'var(--critical)', background: '#fee2e2', padding: '1px 6px', borderRadius: '3px' }}>
                        "{item.matched_text}"
                      </code>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {item.evidence}
                  </div>
                </div>
                {item.suggested_correction && (
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500, textAlign: 'right' }}>
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
        background: '#eff6ff',
        border: '1px dashed var(--primary-border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={15} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--primary)' }}>Calculation Transparency:</strong> {report.calculation_basis}
          <div style={{ marginTop: '2px', color: 'var(--text-subtle)' }}>
            Generated deterministically at: {new Date(report.generated_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
