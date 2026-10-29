import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function NewFactModal({
  isOpen,
  onClose,
  onSubmit,
  brandId
}) {
  const [factKey, setFactKey] = useState('');
  const [factStatement, setFactStatement] = useState('');
  const [verifiedValue, setVerifiedValue] = useState('');
  const [evidenceSource, setEvidenceSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!factKey.trim() || !factStatement.trim() || !verifiedValue.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        brand_id: brandId,
        fact_key: factKey.trim().toLowerCase().replace(/\s+/g, '_'),
        fact_statement: factStatement.trim(),
        verified_value: verifiedValue.trim(),
        evidence_source: evidenceSource.trim() || null
      });
      setFactKey('');
      setFactStatement('');
      setVerifiedValue('');
      setEvidenceSource('');
      onClose();
    } catch {
      // Handled by toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-fact-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} style={{ color: '#16a34a' }} />
            <h3 id="modal-fact-title" className="modal-title">Add Verified Brand Fact</h3>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Fact Key Identifier *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. founding_year or sla_uptime"
                value={factKey}
                onChange={(e) => setFactKey(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Verified Value *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2021 or 99.95%"
                value={verifiedValue}
                onChange={(e) => setVerifiedValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fact Statement *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. AetherCloud was founded in 2021 by a team of distributed systems engineers."
              value={factStatement}
              onChange={(e) => setFactStatement(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Evidence Source Citation</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Delaware Certificate of Incorporation #639201"
              value={evidenceSource}
              onChange={(e) => setEvidenceSource(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Verified Fact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
