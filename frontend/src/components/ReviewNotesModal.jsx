import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

export default function ReviewNotesModal({
  isOpen,
  onClose,
  onSubmit,
  draftId,
  targetStatus
}) {
  const [reviewerName, setReviewerName] = useState('Brand Governance Officer');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(draftId, targetStatus, reviewerName.trim(), notes.trim() || null);
      setNotes('');
      onClose();
    } catch (err) {
      // Handled by toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} style={{ color: '#818cf8' }} />
            <h3 className="modal-title">Transition to "{targetStatus}"</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reviewer Name *</label>
            <input
              type="text"
              className="form-input"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reviewer Feedback & Instructions</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide specific editorial feedback or instructions for the author..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${targetStatus === 'Rejected' ? 'btn-danger' : 'btn-primary'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : `Confirm ${targetStatus}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
