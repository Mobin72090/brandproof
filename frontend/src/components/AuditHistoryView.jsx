import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  FileText,
  ArrowRight,
  RefreshCw,
  X,
  Layers
} from 'lucide-react';
import { api } from '../api';

const SUPPORTED_STATUSES = ['Draft', 'In Review', 'Changes Requested', 'Approved', 'Rejected'];

/**
 * Consistently format database timestamps without mutating or assuming inaccurate timezones.
 * Handles both SQLite standard UTC strings ("YYYY-MM-DD HH:MM:SS") and ISO strings.
 */
function formatAuditDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const isoString = dateStr.includes('T')
      ? dateStr
      : dateStr.replace(' ', 'T') + (dateStr.endsWith('Z') ? '' : 'Z');
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? dateStr : fallback.toLocaleString();
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export default function AuditHistoryView({
  drafts = [],
  onSelectDraft,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Review history per draft state: { [draftId: number]: ReviewHistoryItem[] }
  const [histories, setHistories] = useState({});
  const [loadingHistories, setLoadingHistories] = useState({});
  const [historyErrors, setHistoryErrors] = useState({});

  // Which drafts have their history timeline unfolded
  const [expandedDrafts, setExpandedDrafts] = useState({});

  // Fetch review history for a given draft
  const fetchHistoryForDraft = useCallback(async (draftId, force = false) => {
    if (!force && histories[draftId] !== undefined) return;

    setLoadingHistories(prev => ({ ...prev, [draftId]: true }));
    setHistoryErrors(prev => ({ ...prev, [draftId]: null }));

    try {
      const events = await api.getReviewHistory(draftId);
      setHistories(prev => ({ ...prev, [draftId]: events }));
    } catch (err) {
      setHistoryErrors(prev => ({
        ...prev,
        [draftId]: err.message || 'Failed to load review history'
      }));
    } finally {
      setLoadingHistories(prev => ({ ...prev, [draftId]: false }));
    }
  }, [histories]);

  // Load history for drafts on mount or when drafts change
  useEffect(() => {
    drafts.forEach(d => {
      fetchHistoryForDraft(d.id);
    });
  }, [drafts, fetchHistoryForDraft]);

  const toggleExpand = (draftId) => {
    setExpandedDrafts(prev => {
      const nextState = !prev[draftId];
      if (nextState && histories[draftId] === undefined) {
        fetchHistoryForDraft(draftId);
      }
      return { ...prev, [draftId]: nextState };
    });
  };

  const handleExpandAll = () => {
    const allExpanded = drafts.every(d => expandedDrafts[d.id]);
    const newState = {};
    drafts.forEach(d => {
      newState[d.id] = !allExpanded;
      if (!allExpanded && histories[d.id] === undefined) {
        fetchHistoryForDraft(d.id);
      }
    });
    setExpandedDrafts(newState);
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = { ALL: drafts.length };
    SUPPORTED_STATUSES.forEach(s => {
      counts[s] = drafts.filter(d => d.review_status === s).length;
    });
    return counts;
  }, [drafts]);

  // Filtered and Sorted Drafts
  const filteredAndSortedDrafts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = drafts.filter(draft => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && draft.review_status !== statusFilter) {
        return false;
      }

      // 2. Search Filter (title, author, channel)
      if (query) {
        const titleMatch = (draft.title || '').toLowerCase().includes(query);
        const authorMatch = (draft.author || '').toLowerCase().includes(query);
        const channelMatch = (draft.channel || '').toLowerCase().includes(query);
        return titleMatch || authorMatch || channelMatch;
      }

      return true;
    });

    // 3. Sorting
    return filtered.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime() || 0;
      const dateB = new Date(b.updated_at || b.created_at).getTime() || 0;

      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [drafts, searchQuery, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSortBy('newest');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 size={13} style={{ color: '#16a34a' }} />;
      case 'In Review':
        return <Clock size={13} style={{ color: '#2563eb' }} />;
      case 'Changes Requested':
        return <AlertTriangle size={13} style={{ color: '#d97706' }} />;
      case 'Rejected':
        return <XCircle size={13} style={{ color: '#dc2626' }} />;
      default:
        return <FileText size={13} style={{ color: '#64748b' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <History size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Governance Audit & Review Log
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Immutable audit trail tracking state transitions, editorial sign-offs, and reviewer notes
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '6px 14px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700 }}>Total Drafts</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{drafts.length}</span>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '6px 14px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#16a34a', fontWeight: 700 }}>Approved</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16a34a' }}>{statusCounts['Approved'] || 0}</span>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '6px 14px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700 }}>In Review</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2563eb' }}>{statusCounts['In Review'] || 0}</span>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '6px 14px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#d97706', fontWeight: 700 }}>Revisions</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#d97706' }}>{statusCounts['Changes Requested'] || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter drafts by title, author, or channel..."
              style={{ paddingLeft: '36px', paddingRight: searchQuery ? '32px' : '12px', width: '100%', fontSize: '0.88rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '2px' }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <ArrowUpDown size={15} style={{ color: 'var(--text-subtle)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.84rem' }}
              aria-label="Sort drafts list"
            >
              <option value="newest">Last Modified (Newest First)</option>
              <option value="oldest">Last Modified (Oldest First)</option>
              <option value="title-asc">Title (A → Z)</option>
              <option value="title-desc">Title (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              <span>All Statuses</span>
              <span className="badge" style={{ background: statusFilter === 'ALL' ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: statusFilter === 'ALL' ? '#ffffff' : 'var(--text-muted)' }}>
                {statusCounts.ALL}
              </span>
            </button>

            {SUPPORTED_STATUSES.map(status => {
              const count = statusCounts[status] || 0;
              const isSelected = statusFilter === status;
              return (
                <button
                  type="button"
                  key={status}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {getStatusIcon(status)}
                  <span>{status}</span>
                  <span className="badge" style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: isSelected ? '#ffffff' : 'var(--text-muted)' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={resetFilters}
                style={{ color: 'var(--primary)', borderColor: 'var(--primary-border)' }}
              >
                <X size={13} />
                <span>Reset Filters</span>
              </button>
            )}

            {filteredAndSortedDrafts.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExpandAll}
                title="Expand or collapse all draft audit trails"
              >
                <Layers size={13} />
                <span>Toggle All History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drafts List Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Drafts Review Log & Editorial Trails
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredAndSortedDrafts.length} of {drafts.length} drafts in governance repository
            </p>
          </div>
        </div>

        {/* Global Empty State */}
        {drafts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
            <FileText size={44} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--primary)' }} />
            <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>No Content Drafts in System</h4>
            <p style={{ fontSize: '0.84rem', marginTop: '4px', maxWidth: '400px', margin: '4px auto 0' }}>
              Submit a marketing copy draft through the Dashboard or Content Studio to initiate automated governance audits and review history tracking.
            </p>
          </div>
        ) : filteredAndSortedDrafts.length === 0 ? (
          /* Filter Empty State */
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <Filter size={36} style={{ margin: '0 auto 12px', color: 'var(--text-subtle)' }} />
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.98rem', fontWeight: 600 }}>No Drafts Match Criteria</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              No marketing drafts found matching search query "{searchQuery}" under status filter "{statusFilter}".
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
              style={{ marginTop: '14px' }}
            >
              Clear Search & Status Filters
            </button>
          </div>
        ) : (
          /* Drafts & Review History Timeline */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAndSortedDrafts.map((d) => {
              const statusClass = d.review_status.toLowerCase().replace(' ', '-');
              const isExpanded = Boolean(expandedDrafts[d.id]);
              const draftHistory = histories[d.id] || [];
              const isLoadingHist = Boolean(loadingHistories[d.id]);
              const historyError = historyErrors[d.id];
              const historyCount = draftHistory.length;

              return (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Card Header Row: Title, Metadata, Current Status & Action */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: '1 1 300px', minWidth: '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word', margin: 0 }}>
                          {d.title}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                          {d.channel}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          ID #{d.id}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} style={{ color: 'var(--text-subtle)' }} />
                          Author: <strong style={{ color: 'var(--text-main)' }}>{d.author}</strong>
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} style={{ color: 'var(--text-subtle)' }} />
                          Last Modified: <strong style={{ color: 'var(--text-main)' }}>{formatAuditDate(d.updated_at)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right side: Clear Current Status badge and Studio Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Prominent Current Status Indicator */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)' }}>
                          Current Status
                        </span>
                        <span className={`status-badge ${statusClass}`} style={{ fontSize: '0.82rem' }}>
                          {getStatusIcon(d.review_status)}
                          <span>{d.review_status}</span>
                        </span>
                      </div>

                      {/* Audit in Studio Button */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          onSelectDraft(d);
                          onNavigate('audit');
                        }}
                        title={`Open draft #${d.id} in Content Review Studio`}
                      >
                        <span>Audit Draft</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Reviewer Note Callout if present on draft */}
                  {d.reviewer_notes && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: '#92400e' }}>Latest Reviewer Instruction:</strong> "{d.reviewer_notes}"
                      </div>
                    </div>
                  )}

                  {/* Toggle Review History Accordion Button */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleExpand(d.id)}
                      style={{
                        background: isExpanded ? '#eff6ff' : '#ffffff',
                        borderColor: isExpanded ? 'var(--primary-border)' : 'var(--border-color)',
                        color: isExpanded ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: 600
                      }}
                    >
                      <History size={13} style={{ color: isExpanded ? 'var(--primary)' : 'var(--text-subtle)' }} />
                      <span>
                        {isExpanded ? 'Hide Review Trail' : 'View Review History Trail'}
                        {historyCount > 0 && ` (${historyCount} event${historyCount === 1 ? '' : 's'})`}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Original Submission: {formatAuditDate(d.created_at)}
                    </span>
                  </div>

                  {/* Expanded Review History Trail Timeline */}
                  {isExpanded && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <History size={15} style={{ color: 'var(--primary)' }} />
                          <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                            Editorial Audit Trail for Draft #{d.id}
                          </h5>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => fetchHistoryForDraft(d.id, true)}
                          disabled={isLoadingHist}
                          style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                          title="Refresh history for this draft"
                        >
                          <RefreshCw size={11} className={isLoadingHist ? 'spin' : ''} />
                          <span>Refresh</span>
                        </button>
                      </div>

                      {/* Loading State */}
                      {isLoadingHist && historyCount === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                          <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                          <p>Fetching persisted review events from database...</p>
                        </div>
                      )}

                      {/* Error State with Retry */}
                      {historyError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{historyError}</span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => fetchHistoryForDraft(d.id, true)}
                            style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Zero Events State */}
                      {!isLoadingHist && !historyError && historyCount === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                          <FileText size={20} style={{ margin: '0 auto 6px', opacity: 0.5 }} />
                          <p>No historical review events recorded for this draft yet.</p>
                          <p style={{ marginTop: '2px' }}>Current state: <strong>Draft</strong> (Initial creation).</p>
                        </div>
                      )}

                      {/* Chronological Event Stepper */}
                      {historyCount > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {draftHistory.map((event, idx) => {
                            const isLatest = idx === draftHistory.length - 1;
                            const fromClass = (event.from_status || 'draft').toLowerCase().replace(' ', '-');
                            const toClass = (event.to_status || 'draft').toLowerCase().replace(' ', '-');

                            return (
                              <div
                                key={event.id || idx}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid',
                                  borderColor: isLatest ? 'var(--primary-border)' : 'var(--border-color)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '12px 14px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  position: 'relative'
                                }}
                              >
                                {/* Step number + Transition details */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: isLatest ? 'var(--primary)' : '#e2e8f0',
                                      color: isLatest ? '#ffffff' : 'var(--text-muted)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      flexShrink: 0
                                    }}>
                                      {idx + 1}
                                    </span>

                                    {/* Status transition stepper: from -> to */}
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <span className={`status-badge ${fromClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                        {event.from_status}
                                      </span>
                                      <ArrowRight size={13} style={{ color: 'var(--primary)' }} />
                                      <span className={`status-badge ${toClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px', fontWeight: 700 }}>
                                        {event.to_status}
                                      </span>
                                    </div>

                                    {isLatest && (
                                      <span className="badge" style={{ background: '#dbeafe', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: '0.68rem' }}>
                                        Current Transition
                                      </span>
                                    )}
                                  </div>

                                  {/* Timestamp */}
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                                    {formatAuditDate(event.timestamp)}
                                  </div>
                                </div>

                                {/* Performed By & Notes */}
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '28px' }}>
                                  <div>
                                    Recorded by: <strong style={{ color: 'var(--text-main)' }}>{event.changed_by}</strong>
                                  </div>
                                  {event.notes && (
                                    <div style={{
                                      background: '#f8fafc',
                                      borderLeft: '3px solid var(--primary)',
                                      padding: '6px 10px',
                                      borderRadius: '0 4px 4px 0',
                                      fontSize: '0.78rem',
                                      color: 'var(--text-main)',
                                      fontStyle: 'italic',
                                      marginTop: '2px'
                                    }}>
                                      "{event.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
  );
}
