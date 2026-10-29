import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  Send,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Check,
  X,
  History,
  Layers,
  ShieldCheck
} from 'lucide-react';
import BrandTrustReport from './BrandTrustReport';

export default function ContentAuditView({
  draft,
  drafts = [],
  onSelectDraft,
  onUpdateDraftText,
  onRunAudit,
  onApplyCorrection,
  onTransitionStatus,
  isAnalyzing,
  findings = [],
  reviewHistory = [],
  openReviewNotesModal
}) {
  const [currentText, setCurrentText] = useState(draft?.current_text || '');
  const [isDirty, setIsDirty] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [customCorrectionText, setCustomCorrectionText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [includeAi, setIncludeAi] = useState(true);
  const [studioTab, setStudioTab] = useState('inspector'); // 'inspector' or 'report'

  // Track previous draft props to safely adjust state when draft switches or server text updates
  const [prevDraftId, setPrevDraftId] = useState(draft?.id);
  const [prevDraftText, setPrevDraftText] = useState(draft?.current_text);

  if (draft && (draft.id !== prevDraftId || draft.current_text !== prevDraftText)) {
    setPrevDraftId(draft.id);
    setPrevDraftText(draft.current_text);
    setCurrentText(draft.current_text || '');
    setIsDirty(false);
    setEditingFindingId(null);
  }

  if (!draft) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
        <FileCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: 'var(--primary)' }} />
        <h3 style={{ color: 'var(--text-main)' }}>No Content Draft Selected</h3>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Please choose a draft from the dropdown or submit a new draft to review.</p>
      </div>
    );
  }

  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentText.length;

  const openFindings = findings.filter(f => f.status === 'open');
  const criticalOpenCount = openFindings.filter(f => f.severity === 'critical').length;

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const handleTextChange = (e) => {
    setCurrentText(e.target.value);
    setIsDirty(e.target.value !== draft.current_text);
  };

  const handleSaveText = async () => {
    await onUpdateDraftText(draft.id, currentText);
    setIsDirty(false);
  };

  const handleStartEditCorrection = (finding) => {
    setEditingFindingId(finding.id);
    setCustomCorrectionText(finding.suggested_correction || finding.matched_text || '');
  };

  const handleSaveCustomCorrection = async (findingId) => {
    await onApplyCorrection(findingId, 'edit', customCorrectionText);
    setEditingFindingId(null);
  };

  const statusClass = draft.review_status.toLowerCase().replace(' ', '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar: Draft Picker & Review State Machine */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Draft selector dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Active Draft
            </span>
            <select
              value={draft.id}
              onChange={(e) => {
                const selected = drafts.find(d => d.id === Number(e.target.value));
                if (selected) onSelectDraft(selected);
              }}
              style={{
                background: '#ffffff',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontWeight: 600,
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
              aria-label="Select draft to audit"
            >
              {drafts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.review_status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`status-badge ${statusClass}`}>
                {draft.review_status}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Channel: <strong>{draft.channel}</strong> • Author: <strong>{draft.author}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Workflow State Transition Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {draft.review_status === 'Draft' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'In Review')}
              title="Submit draft to human editorial review"
            >
              <Send size={14} />
              <span>Submit for Review</span>
            </button>
          )}

          {draft.review_status === 'In Review' && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => openReviewNotesModal(draft.id, 'Changes Requested')}
                title="Send back with change requests"
              >
                <AlertTriangle size={14} style={{ color: '#d97706' }} />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={() => onTransitionStatus(draft.id, 'Approved')}
                disabled={criticalOpenCount > 0}
                title={criticalOpenCount > 0 ? "Resolve open critical findings before approval" : "Formally approve for publication"}
                style={{
                  opacity: criticalOpenCount > 0 ? 0.5 : 1,
                  cursor: criticalOpenCount > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Approve Content</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => openReviewNotesModal(draft.id, 'Rejected')}
                title="Reject publication"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>
            </>
          )}

          {draft.review_status === 'Changes Requested' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'In Review')}
              title="Re-submit revisions for review"
            >
              <Send size={14} />
              <span>Re-submit for Review</span>
            </button>
          )}

          {(draft.review_status === 'Approved' || draft.review_status === 'Rejected') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'Draft')}
              title="Re-open draft for editing"
            >
              <RotateCcw size={14} />
              <span>Re-open Draft</span>
            </button>
          )}

          <button
            type="button"
            className={`btn btn-secondary btn-sm ${showHistory ? 'btn-primary' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="View review history trail"
          >
            <History size={14} />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Review History Drawer if toggled */}
      {showHistory && (
        <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--primary-border)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} />
            Review State Audit Trail
          </h4>
          {reviewHistory.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>No review events recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reviewHistory.map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>{h.from_status}</span>
                    <span style={{ margin: '0 8px', color: 'var(--primary)' }}>→</span>
                    <strong style={{ color: 'var(--text-main)' }}>{h.to_status}</strong>
                    <span style={{ marginLeft: '12px', color: 'var(--text-muted)' }}>by {h.changed_by}</span>
                    {h.notes && <span style={{ marginLeft: '12px', color: 'var(--text-subtle)', fontStyle: 'italic' }}>"{h.notes}"</span>}
                  </div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warning banner if critical findings exist while In Review */}
      {criticalOpenCount > 0 && draft.review_status === 'In Review' && (
        <div style={{
          background: 'var(--critical-bg)',
          border: '1px solid var(--critical-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--critical)',
          fontSize: '0.88rem'
        }}>
          <ShieldAlert size={20} style={{ color: 'var(--critical)', flexShrink: 0 }} />
          <div>
            <strong>Approval Blocked:</strong> {criticalOpenCount} unresolved critical brand compliance finding(s) detected.
            You must accept, edit, or reject all critical findings before this draft can be approved.
          </div>
        </div>
      )}

      {/* Main Two-Column Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: Content Editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Marketing Copy Editor
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Edit directly or apply corrections from the Governance Inspector.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {wordCount} words • {charCount} chars
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveText}
                disabled={!isDirty}
                style={{
                  borderColor: isDirty ? 'var(--primary)' : 'var(--border-color)',
                  color: isDirty ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isDirty ? 600 : 500
                }}
              >
                <Save size={13} />
                <span>{isDirty ? 'Save Edits*' : 'Saved'}</span>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="form-textarea"
            value={currentText}
            onChange={handleTextChange}
            rows={16}
            placeholder="Enter marketing draft content here..."
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.92rem',
              lineHeight: '1.65',
              padding: '16px',
              minHeight: '380px',
              backgroundColor: '#ffffff',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          />

          {/* Bottom Audit Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={includeAi}
                onChange={(e) => setIncludeAi(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                Enable Gemini AI Tone & Nuance Audit
              </span>
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onRunAudit(draft.id, includeAi)}
              disabled={isAnalyzing}
            >
              <Sparkles size={15} className={isAnalyzing ? 'spin' : ''} />
              <span>{isAnalyzing ? 'Auditing Guidelines & Facts...' : 'Run Governance Audit'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Governance Inspector & Brand Trust Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '520px' }}>
          {/* Top Switcher Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${studioTab === 'inspector' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStudioTab('inspector')}
              >
                <Layers size={14} />
                <span>Governance Inspector ({openFindings.length})</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${studioTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStudioTab('report')}
              >
                <ShieldCheck size={14} />
                <span>Brand Trust Report</span>
              </button>
            </div>

            {studioTab === 'inspector' && findings.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      background: filterSeverity === sev ? 'var(--primary-light)' : 'transparent',
                      border: '1px solid',
                      borderColor: filterSeverity === sev ? 'var(--primary-border)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: filterSeverity === sev ? 600 : 500,
                      color: filterSeverity === sev ? 'var(--primary)' : 'var(--text-subtle)',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            )}
          </div>

          {studioTab === 'report' ? (
            <BrandTrustReport
              draftId={draft.id}
              findingsCount={findings.length}
              onRefreshTrigger={draft.updated_at}
            />
          ) : (
            <>
              {/* Findings List */}
              {findings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4, color: '#16a34a' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No findings to display.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-muted)' }}>
                    Click <strong>"Run Governance Audit"</strong> below the editor to check this draft against approved brand voice, terminology, facts, and prohibited claims.
                  </p>
                </div>
              ) : filteredFindings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
                  <p>No findings matching severity: <strong>{filterSeverity}</strong></p>
                </div>
              ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredFindings.map((finding) => {
                const isEditing = editingFindingId === finding.id;
                const isResolved = finding.status !== 'open';

                return (
                  <div
                    key={finding.id}
                    style={{
                      background: isResolved ? '#f8fafc' : '#ffffff',
                      border: '1px solid',
                      borderColor: isResolved
                        ? 'var(--border-color)'
                        : finding.severity === 'critical'
                        ? 'var(--critical-border)'
                        : finding.severity === 'high'
                        ? 'var(--high-border)'
                        : 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      opacity: isResolved ? 0.75 : 1,
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Header: Severity, Rule Type, and Source */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${finding.severity}`}>
                          {finding.severity}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                          {finding.rule_type}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          color: finding.finding_source === 'ai_assisted' ? 'var(--primary)' : 'var(--text-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 500
                        }}>
                          {finding.finding_source === 'ai_assisted' ? (
                            <><Sparkles size={11} /> AI Auditor</>
                          ) : (
                            <><Layers size={11} /> Rule Engine</>
                          )}
                        </span>
                      </div>

                      {/* Finding Status Badge */}
                      {finding.status !== 'open' && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: finding.status === 'accepted' ? '#dcfce7' : '#f1f5f9',
                          color: finding.status === 'accepted' ? '#16a34a' : 'var(--text-subtle)'
                        }}>
                          {finding.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                      {finding.title}
                    </div>

                    {/* Matched text snippet */}
                    {finding.matched_text && (
                      <div style={{
                        background: '#fef2f2',
                        borderLeft: `3px solid ${finding.severity === 'critical' ? 'var(--critical)' : '#ea580c'}`,
                        padding: '6px 10px',
                        borderRadius: '0 4px 4px 0',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--critical)',
                        marginBottom: '8px',
                        wordBreak: 'break-word'
                      }}>
                        "{finding.matched_text}"
                      </div>
                    )}

                    {/* Explanation */}
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '8px' }}>
                      {finding.explanation}
                    </p>

                    {/* Evidence citation */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>EVIDENCE:</span>
                      <span>{finding.evidence}</span>
                    </div>

                    {/* Suggested Correction Box & Actions */}
                    {finding.suggested_correction && (
                      <div style={{
                        background: '#eff6ff',
                        border: '1px solid var(--primary-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                          Suggested Correction:
                        </div>

                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={customCorrectionText}
                              onChange={(e) => setCustomCorrectionText(e.target.value)}
                              style={{ fontSize: '0.85rem' }}
                            />
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingFindingId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSaveCustomCorrection(finding.id)}
                              >
                                Apply Edited
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {finding.suggested_correction}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons (only if open) */}
                    {finding.status === 'open' && !isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', paddingTop: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onApplyCorrection(finding.id, 'reject')}
                          title="Dismiss finding without modifying draft"
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>

                        {finding.suggested_correction && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStartEditCorrection(finding)}
                              title="Customize correction text before applying"
                            >
                              <Edit3 size={13} />
                              <span>Edit & Apply</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => onApplyCorrection(finding.id, 'accept')}
                              title="Replace text in draft content automatically"
                            >
                              <Check size={13} />
                              <span>Accept Correction</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
