import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  RotateCcw,
  Check,
  X,
  History,
  Layers,
  Info
} from 'lucide-react';

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

  // Sync draft text whenever selected draft changes
  useEffect(() => {
    if (draft) {
      setCurrentText(draft.current_text || '');
      setIsDirty(false);
      setEditingFindingId(null);
    }
  }, [draft?.id, draft?.current_text]);

  if (!draft) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        <FileCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3>No Content Draft Selected</h3>
        <p style={{ marginTop: '8px' }}>Please choose a draft from the dropdown or submit a new draft to review.</p>
      </div>
    );
  }

  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentText.length;

  const openFindings = findings.filter(f => f.status === 'open');
  const criticalOpenCount = openFindings.filter(f => f.severity === 'critical').length;
  const highOpenCount = openFindings.filter(f => f.severity === 'high').length;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Draft selector dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Draft
            </span>
            <select
              value={draft.id}
              onChange={(e) => {
                const selected = drafts.find(d => d.id === Number(e.target.value));
                if (selected) onSelectDraft(selected);
              }}
              style={{
                background: 'var(--bg-app)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontWeight: 600,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge ${statusClass}`}>
                {draft.review_status}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Channel: <strong>{draft.channel}</strong> • Author: <strong>{draft.author}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Workflow State Transition Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {draft.review_status === 'Draft' && (
            <button
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
                className="btn btn-secondary btn-sm"
                onClick={() => openReviewNotesModal(draft.id, 'Changes Requested')}
                title="Send back with change requests"
              >
                <AlertTriangle size={14} style={{ color: '#fbbf24' }} />
                <span>Request Changes</span>
              </button>

              <button
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
              className="btn btn-secondary btn-sm"
              onClick={() => onTransitionStatus(draft.id, 'Draft')}
              title="Re-open draft for editing"
            >
              <RotateCcw size={14} />
              <span>Re-open Draft</span>
            </button>
          )}

          <button
            className={`btn btn-secondary btn-sm ${showHistory ? 'btn-outline-primary' : ''}`}
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
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.7)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c7d2fe', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} />
            Review State Audit Trail
          </h4>
          {reviewHistory.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No review events recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reviewHistory.map((h) => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>{h.from_status}</span>
                    <span style={{ margin: '0 8px', color: '#6366f1' }}>→</span>
                    <strong style={{ color: '#f8fafc' }}>{h.to_status}</strong>
                    <span style={{ marginLeft: '12px', color: '#64748b' }}>by {h.changed_by}</span>
                    {h.notes && <span style={{ marginLeft: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>"{h.notes}"</span>}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
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
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#fca5a5',
          fontSize: '0.88rem'
        }}>
          <ShieldAlert size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong>Approval Blocked:</strong> {criticalOpenCount} unresolved critical brand compliance finding(s) detected.
            You must accept, edit, or reject all critical findings before this draft can be approved.
          </div>
        </div>
      )}

      {/* Main Two-Column Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: Content Editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600 }}>
                Marketing Copy Editor
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Edit directly or apply corrections from the Governance Inspector.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {wordCount} words • {charCount} chars
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSaveText}
                disabled={!isDirty}
                style={{
                  borderColor: isDirty ? 'var(--primary)' : 'var(--border-color)',
                  color: isDirty ? '#c7d2fe' : 'var(--text-muted)'
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
            rows={18}
            placeholder="Enter marketing draft content here..."
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.92rem',
              lineHeight: '1.65',
              padding: '16px',
              minHeight: '400px',
              backgroundColor: '#0c1222',
              borderRadius: 'var(--radius-md)'
            }}
          />

          {/* Bottom Audit Action Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={includeAi}
                onChange={(e) => setIncludeAi(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} style={{ color: '#818cf8' }} />
                Enable Gemini AI Tone & Nuance Audit
              </span>
            </label>

            <button
              className="btn btn-primary"
              onClick={() => onRunAudit(draft.id, includeAi)}
              disabled={isAnalyzing}
            >
              <Sparkles size={15} className={isAnalyzing ? 'spin' : ''} />
              <span>{isAnalyzing ? 'Auditing Guidelines & Facts...' : 'Run Governance Audit'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Governance Inspector & Findings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Governance Inspector
                {findings.length > 0 && (
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe' }}>
                    {openFindings.length} Open
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Review rule violations, factual conflicts, and suggested corrections.
              </p>
            </div>

            {/* Severity Filter Tabs */}
            {findings.length > 0 && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    style={{
                      background: filterSeverity === sev ? 'var(--bg-elevated)' : 'transparent',
                      border: '1px solid',
                      borderColor: filterSeverity === sev ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      color: filterSeverity === sev ? '#fff' : '#94a3b8',
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

          {/* Findings List */}
          {findings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 500, color: '#94a3b8' }}>No findings to display.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Click <strong>"Run Governance Audit"</strong> below the editor to check this draft against approved brand voice, terminology, facts, and prohibited claims.
              </p>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
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
                      background: isResolved ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: isResolved
                        ? 'rgba(255, 255, 255, 0.06)'
                        : finding.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.4)'
                        : finding.severity === 'high'
                        ? 'rgba(249, 115, 22, 0.4)'
                        : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      opacity: isResolved ? 0.65 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Header: Severity, Rule Type, and Source */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge badge-${finding.severity}`}>
                          {finding.severity}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                          {finding.rule_type}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          color: finding.finding_source === 'ai_assisted' ? '#c7d2fe' : '#93c5fd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
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
                          background: finding.status === 'accepted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: finding.status === 'accepted' ? '#34d399' : '#94a3b8'
                        }}>
                          {finding.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#f8fafc', marginBottom: '6px' }}>
                      {finding.title}
                    </div>

                    {/* Matched text snippet */}
                    {finding.matched_text && (
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderLeft: `3px solid ${finding.severity === 'critical' ? '#ef4444' : '#f97316'}`,
                        padding: '6px 10px',
                        borderRadius: '0 4px 4px 0',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#fca5a5',
                        marginBottom: '8px',
                        wordBreak: 'break-word'
                      }}>
                        "{finding.matched_text}"
                      </div>
                    )}

                    {/* Explanation */}
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '8px' }}>
                      {finding.explanation}
                    </p>

                    {/* Evidence citation */}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>EVIDENCE:</span>
                      <span>{finding.evidence}</span>
                    </div>

                    {/* Suggested Correction Box & Actions */}
                    {finding.suggested_correction && (
                      <div style={{
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
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
                                className="btn btn-secondary btn-sm"
                                onClick={() => setEditingFindingId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleSaveCustomCorrection(finding.id)}
                              >
                                Apply Edited
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#e0e7ff', fontWeight: 500 }}>
                            {finding.suggested_correction}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons (only if open) */}
                    {finding.status === 'open' && !isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', paddingTop: '6px' }}>
                        <button
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
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStartEditCorrection(finding)}
                              title="Customize correction text before applying"
                            >
                              <Edit3 size={13} />
                              <span>Edit & Apply</span>
                            </button>

                            <button
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
        </div>
      </div>
    </div>
  );
}
