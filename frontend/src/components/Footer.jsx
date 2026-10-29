import React from 'react';
import { ShieldCheck, Server, ExternalLink } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({ onNavigate, isHealthy = true }) {

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-badge" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                BP
              </div>
              <span className="footer-title">BrandProof</span>
            </div>
            <p className="footer-desc">
              Autonomous brand governance, deterministic compliance verification, and fact audit platform for enterprise communications.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-nav-list">
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => onNavigate('dashboard')}>
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => onNavigate('audit')}>
                    Content Review Studio
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => onNavigate('guidelines')}>
                    Brand Rules & Facts
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => onNavigate('history')}>
                    Audit & Review Log
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">Platform & Source</h4>
              <ul className="footer-nav-list">
                <li>
                  <a
                    href="https://github.com/Mobin72090/brandproof"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link-ext"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    <span>GitHub Repository</span>
                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </a>
                </li>
                <li>
                  <div className="footer-status-pill">
                    <span className={`status-dot ${isHealthy ? 'online' : ''}`} style={{ width: '6px', height: '6px' }} />
                    <Server size={12} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                      {isHealthy ? 'FastAPI & SQLite Active' : 'Connecting to API'}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {CURRENT_YEAR} BrandProof — Team EVORA (CODEX-48). All rights reserved.
          </div>
          <div className="footer-badge">
            <ShieldCheck size={14} style={{ color: '#16a34a' }} />
            <span>Human-in-the-Loop Governance Suite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
