import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle
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
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {brand?.name}
              </h2>
              <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: 'var(--primary)', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600, border: '1px solid var(--primary-border)' }}>
                {brand?.industry || 'Enterprise Technology'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '10px', fontWeight: 500 }}>
              {brand?.tagline}
            </p>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.84rem', lineHeight: '1.5' }}>
              {brand?.description}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.04em' }}>
              Approved Tone Attributes
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '350px' }}>
              {brand?.tone_attributes?.map((tone, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'rules' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('rules')}
          >
            <ShieldCheck size={15} />
            <span>Approved Rules ({rules.length})</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'facts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('facts')}
          >
            <CheckCircle size={15} />
            <span>Verified Facts ({facts.length})</span>
          </button>
        </div>

        <div>
          {activeTab === 'rules' ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={onOpenNewRuleModal}>
              <Plus size={14} />
              <span>Add Brand Rule</span>
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onOpenNewFactModal}>
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
                type="button"
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  background: categoryFilter === cat ? 'var(--primary-light)' : '#ffffff',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? 'var(--primary-border)' : 'var(--border-color)',
                  color: categoryFilter === cat ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: categoryFilter === cat ? 600 : 500,
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {filteredRules.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-subtle)' }}>
              <p>No brand rules found under this category.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredRules.map((rule) => (
                <div key={rule.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className={`badge badge-${rule.severity}`}>
                        {rule.severity}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {rule.category}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      {rule.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '12px' }}>
                      {rule.description}
                    </p>

                    {/* Target and Preferred mapping */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      {rule.pattern_or_term && (
                        <div>
                          <span style={{ color: 'var(--critical)', fontWeight: 600 }}>FLAG TERM: </span>
                          <code style={{ color: 'var(--critical)', background: '#fee2e2', padding: '1px 6px', borderRadius: '3px', fontSize: '0.78rem' }}>"{rule.pattern_or_term}"</code>
                        </div>
                      )}
                      {rule.preferred_term && (
                        <div>
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>PREFERRED: </span>
                          <code style={{ color: '#16a34a', background: '#dcfce7', padding: '1px 6px', borderRadius: '3px', fontSize: '0.78rem' }}>"{rule.preferred_term}"</code>
                        </div>
                      )}
                    </div>

                    {rule.rationale && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginBottom: '12px' }}>
                        Rationale: {rule.rationale}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onDeleteRule(rule.id)}
                      title="Delete rule"
                      style={{ color: 'var(--critical)' }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {facts.map((fact) => (
            <div key={fact.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {fact.fact_key}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
                    Verified Record
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: '1.45', marginBottom: '12px' }}>
                  {fact.fact_statement}
                </div>

                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                    Verified Value:
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#15803d' }}>
                    {fact.verified_value}
                  </div>
                </div>

                {fact.evidence_source && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-subtle)' }}>SOURCE: </strong>
                    {fact.evidence_source}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onDeleteFact(fact.id)}
                  title="Delete verified fact"
                  style={{ color: 'var(--critical)' }}
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
