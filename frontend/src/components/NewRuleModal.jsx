import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function NewRuleModal({
  isOpen,
  onClose,
  onSubmit,
  brandId
}) {
  const [title, setTitle] = useState('');
  const [ruleType, setRuleType] = useState('terminology');
  const [category, setCategory] = useState('Terminology');
  const [severity, setSeverity] = useState('high');
  const [patternOrTerm, setPatternOrTerm] = useState('');
  const [preferredTerm, setPreferredTerm] = useState('');
  const [description, setDescription] = useState('');
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        brand_id: brandId,
        title: title.trim(),
        rule_type: ruleType,
        category,
        severity,
        pattern_or_term: patternOrTerm.trim() || null,
        preferred_term: preferredTerm.trim() || null,
        description: description.trim(),
        rationale: rationale.trim() || null
      });
      setTitle('');
      setPatternOrTerm('');
      setPreferredTerm('');
      setDescription('');
      setRationale('');
      onClose();
    } catch {
      // Handled by toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-rule-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
            <h3 id="modal-rule-title" className="modal-title">Add Approved Brand Rule</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Rule Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Disallow Unsubstantiated 100% Uptime Claims"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Rule Type</label>
              <select
                className="form-select"
                value={ruleType}
                onChange={(e) => {
                  setRuleType(e.target.value);
                  if (e.target.value === 'terminology') setCategory('Terminology');
                  else if (e.target.value === 'prohibited_claim') setCategory('Claims & Compliance');
                  else if (e.target.value === 'voice') setCategory('Tone & Style');
                }}
              >
                <option value="terminology">Terminology & Product Name</option>
                <option value="prohibited_claim">Prohibited Marketing Claim</option>
                <option value="voice">Tone & Writing Style</option>
                <option value="mandatory_rule">Mandatory Legal/Brand Rule</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="critical">Critical (Blocks Publication Approval)</option>
                <option value="high">High (Strong Editorial Warning)</option>
                <option value="medium">Medium (Style Recommendation)</option>
                <option value="low">Low (Polishing Suggestion)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Flagged Term or Phrase</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 100% zero downtime"
                value={patternOrTerm}
                onChange={(e) => setPatternOrTerm(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Replacement Term</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 99.95% enterprise SLA"
                value={preferredTerm}
                onChange={(e) => setPreferredTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rule Guidance / Explanation *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Explain why this rule exists and provide clear instructions for writers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Legal / Governance Rationale</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master Services Agreement standard uptime commitments"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Brand Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
