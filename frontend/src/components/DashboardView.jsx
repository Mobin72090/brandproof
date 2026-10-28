import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe' }}>
              Governance Overview
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Protecting brand equity before publication
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            {brand ? brand.name : 'BrandProof Governance'}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5' }}>
            {brand?.tagline || 'Autonomous brand governance and verified marketing fact compliance platform.'}
          </p>

          {brand?.tone_attributes && brand.tone_attributes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>APPROVED TONE:</span>
              {brand.tone_attributes.map((tone, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>{totalDrafts}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Marketing Drafts</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>{inReviewCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>In Active Review</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>{approvedCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Approved Publications</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.2 }}>
              {rules.length + facts.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rules & Verified Facts</div>
          </div>
        </div>
      </div>

      {/* Product Architecture & Purpose Summary */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.04)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '2px' }}>Deterministic & AI Guard</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>Instant regex matching for legal SLAs and product casing, paired with optional Gemini AI for tone subtleties.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '2px' }}>Brand Trust Report</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>Computes transparent publication-readiness and approval blockers from real persisted SQLite findings.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
            <Award size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '2px' }}>Human-in-the-Loop Sign-Off</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>Authors accept or customize suggestions with one-click replacements. Approval is strictly blocked until critical findings are resolved.</div>
          </div>
        </div>
      </div>

      {/* Main Sections: Recent Drafts & Governance Rules */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recent Drafts Section */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
                Marketing Content In Pipeline
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Select a draft to audit against approved voice, facts, and prohibited claims.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('audit')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {drafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No content drafts submitted yet.</p>
              <button
                className="btn btn-outline-primary btn-sm"
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
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    <div style={{ flex: 1, marginRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
                          {draft.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                          {draft.channel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Author: <strong>{draft.author}</strong> • Last Updated: {new Date(draft.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`status-badge ${statusClass}`}>
                        {draft.review_status}
                      </span>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
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
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#818cf8' }} />
              Governance Workflow
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Approved Rules & Facts</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Set verified product terms, SLA commitments, and forbidden superlatives.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  2
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Deterministic & AI Audit</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Runs regex-based exact matches and Gemini AI auditor for nuanced tone checks.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Accept or Edit Corrections</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>One-click replacement updates draft text automatically in SQLite persistence.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                  4
                </span>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>Human Sign-Off</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Transitions from In Review to Approved. Approval is blocked if critical issues remain.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c7d2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} />
              Brand Knowledge Base
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
              Currently active: <strong>{rules.length}</strong> Brand Rules and <strong>{facts.length}</strong> Verified Facts.
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onNavigate('guidelines')}
              style={{ width: '100%' }}
            >
              Manage Brand Rules & Facts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
