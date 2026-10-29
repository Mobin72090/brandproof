import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  Award
} from 'lucide-react';

export default function DashboardView({
  brand,
  drafts = [],
  rules = [],
  facts = [],
  onSelectDraft,
  onOpenNewDraftModal,
  onNavigate
}) {
  // Compute metric stats
  const totalDrafts = drafts.length;
  const inReviewCount = drafts.filter(d => d.review_status === 'In Review').length;
  const approvedCount = drafts.filter(d => d.review_status === 'Approved').length;
  const changesCount = drafts.filter(d => d.review_status === 'Changes Requested').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Welcome */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
          borderColor: 'var(--primary-border)',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-low">
              Governance Overview
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Protecting brand integrity before publication
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            {brand ? brand.name : 'BrandProof Governance'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            {brand?.tagline || 'Autonomous brand governance and verified marketing fact compliance platform.'}
          </p>

          {brand?.tone_attributes && brand.tone_attributes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>APPROVED TONE:</span>
              {brand.tone_attributes.map((tone, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#ffffff',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {tone}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewDraftModal}
          >
            <Plus size={16} />
            <span>Submit Content Draft</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Total Drafts */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>Active Drafts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{totalDrafts}</div>
          </div>
        </div>

        {/* KPI 2: In Review */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>In Review</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-heading)' }}>{inReviewCount}</div>
          </div>
        </div>

        {/* KPI 3: Approved */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>Approved</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-heading)' }}>{approvedCount}</div>
          </div>
        </div>

        {/* KPI 4: Changes Requested */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase' }}>Revisions Needed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-heading)' }}>{changesCount}</div>
          </div>
        </div>
      </div>

      {/* Product Architecture & Purpose Summary */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '2px' }}>Deterministic & AI Guard</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Instant regex matching for legal SLAs and product casing, paired with optional Gemini AI for tone subtleties.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '2px' }}>Brand Trust Report</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Computes transparent publication-readiness and approval blockers from real persisted SQLite findings.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <Award size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '2px' }}>Human-in-the-Loop Sign-Off</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Authors accept or customize suggestions with one-click replacements. Approval is strictly blocked until critical findings are resolved.</div>
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Drafts & Governance Rules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Recent Drafts Section */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Marketing Content In Pipeline
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select a draft to audit against approved voice, facts, and prohibited claims.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('audit')}
            >
              <span>View All Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {drafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No content drafts submitted yet.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onOpenNewDraftModal}
                style={{ marginTop: '12px' }}
              >
                Submit First Draft
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {drafts.map((draft) => {
                const statusClass = draft.review_status.toLowerCase().replace(' ', '-');
                return (
                  <div
                    key={draft.id}
                    onClick={() => onSelectDraft(draft)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                      e.currentTarget.style.borderColor = 'var(--primary-border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div style={{ flex: '1 1 200px', minWidth: '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                          {draft.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {draft.channel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        Author: <strong>{draft.author}</strong> • Last Updated: {new Date(draft.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span className={`status-badge ${statusClass}`}>
                        {draft.review_status}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDraft(draft);
                        }}
                      >
                        <span>Audit</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Governance Process Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Governance Workflow
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Approved Rules & Facts</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Set verified product terms, SLA commitments, and forbidden superlatives.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  2
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Deterministic & AI Audit</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Runs regex-based exact matches and Gemini AI auditor for nuanced tone checks.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Accept or Edit Corrections</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>One-click replacement updates draft text automatically in SQLite persistence.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  4
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Human Sign-Off</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Transitions from In Review to Approved. Approval is blocked if critical issues remain.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#eff6ff', borderColor: 'var(--primary-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} />
              Brand Knowledge Base
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Currently active: <strong>{rules.length}</strong> Brand Rules and <strong>{facts.length}</strong> Verified Facts.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('guidelines')}
              style={{ width: '100%', borderColor: 'var(--primary-border)' }}
            >
              Manage Brand Rules & Facts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
