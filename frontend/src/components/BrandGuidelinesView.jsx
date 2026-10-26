import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle,
  FileCheck2,
  Tag,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function BrandGuidelinesView({
  brand,
  rules = [],
  facts = [],
  onDeleteRule,
  onDeleteFact,
  onOpenNewRuleModal,
  onOpenNewFactModal
}) {
  const [activeTab, setActiveTab] = useState('rules');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', 'Terminology', 'Claims & Compliance', 'Tone & Style', 'Legal'];

  const filteredRules = rules.filter(r => {
    if (categoryFilter === 'all') return true;
    return r.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Brand Profile Overview Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                {brand?.name}
              </h2>
              <span style={{ fontSize: '0.78rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                {brand?.industry || 'Enterprise Technology'}
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '12px' }}>
              {brand?.tagline}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', maxWidth: '750px', lineHeight: '1.5' }}>
              {brand?.description}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              Approved Tone Attributes
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '350px' }}>
              {brand?.tone_attributes?.map((tone, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {tone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'rules' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('rules')}
          >
            <ShieldCheck size={15} />
            <span>Approved Rules ({rules.length})</span>
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'facts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('facts')}
          >
            <CheckCircle size={15} />
            <span>Verified Facts ({facts.length})</span>
          </button>
        </div>

        <div>
          {activeTab === 'rules' ? (
            <button className="btn btn-primary btn-sm" onClick={onOpenNewRuleModal}>
              <Plus size={14} />
              <span>Add Brand Rule</span>
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenNewFactModal}>
              <Plus size={14} />
              <span>Add Verified Fact</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: RULES */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  background: categoryFilter === cat ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)',
                  color: categoryFilter === cat ? '#fff' : '#94a3b8',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredRules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No brand rules found under this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {filteredRules.map((rule) => (
                <div key={rule.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`badge badge-${rule.severity}`}>
                        {rule.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                        {rule.category}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                      {rule.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '12px' }}>
                      {rule.description}
                    </p>

                    {/* Target and Preferred mapping */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      marginBottom: '12px'
                    }}>
                      {rule.pattern_or_term && (
                        <div>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>FLAG TERM: </span>
                          <code style={{ color: '#fca5a5' }}>"{rule.pattern_or_term}"</code>
                        </div>
                      )}
                      {rule.preferred_term && (
                        <div>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>PREFERRED: </span>
                          <code style={{ color: '#6ee7b7' }}>"{rule.preferred_term}"</code>
                        </div>
                      )}
                    </div>

                    {rule.rationale && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginBottom: '12px' }}>
                        Rationale: {rule.rationale}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onDeleteRule(rule.id)}
                      title="Delete rule"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FACTS */}
      {activeTab === 'facts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {facts.map((fact) => (
            <div key={fact.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {fact.fact_key}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Verified Record
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500, lineHeight: '1.45', marginBottom: '12px' }}>
                  {fact.fact_statement}
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
                    Verified Value:
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ecfdf5' }}>
                    {fact.verified_value}
                  </div>
                </div>

                {fact.evidence_source && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    <strong style={{ color: '#64748b' }}>SOURCE: </strong>
                    {fact.evidence_source}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '12px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onDeleteFact(fact.id)}
                  title="Delete verified fact"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
