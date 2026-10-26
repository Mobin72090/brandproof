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
    } catch (err) {
      // Handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#818cf8' }} />
            <h3 className="modal-title">Submit Marketing Draft</h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Marketing Channel</label>
              <select
                className="form-select"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="Blog Post">Blog Post</option>
                <option value="Press Release">Press Release</option>
                <option value="LinkedIn Post">LinkedIn Post</option>
                <option value="Landing Page">Landing Page</option>
                <option value="Email Newsletter">Email Newsletter</option>
                <option value="Product Documentation">Product Documentation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Author / Submitter *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sarah Lin (PMM)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Draft Content *</label>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste or type marketing copy to be audited..."
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
              {isSubmitting ? 'Submitting...' : 'Create & Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
