import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

export default function NewDraftModal({
  isOpen,
  onClose,
  onSubmit,
  brandId
}) {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Blog Post');
  const [author, setAuthor] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !originalText.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        brand_id: brandId,
        title: title.trim(),
        channel,
        author: author.trim(),
        original_text: originalText.trim()
      });
      setTitle('');
      setAuthor('');
      setOriginalText('');
      onClose();
    } catch {
      // Handled by parent toast, input preserved in state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-draft-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h3 id="modal-draft-title" className="modal-title">Submit Marketing Draft</h3>
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
            <label className="form-label">Draft Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Q4 Cloud Security Whitepaper Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Channel / Medium</label>
              <select
                className="form-select"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="Blog Post">Blog Post</option>
                <option value="Press Release">Press Release</option>
                <option value="Technical Whitepaper">Technical Whitepaper</option>
                <option value="Landing Page">Landing Page</option>
                <option value="Social Media Copy">Social Media Copy</option>
                <option value="Email Campaign">Email Campaign</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Author Name & Role *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Lin (Product Marketing Lead)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Draft Content / Copy *</label>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste or type marketing copy to be audited against brand voice, product terms, and verified facts..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Draft for Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
