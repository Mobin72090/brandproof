import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import DashboardView from './components/DashboardView';
import ContentAuditView from './components/ContentAuditView';
import BrandGuidelinesView from './components/BrandGuidelinesView';
import AuditHistoryView from './components/AuditHistoryView';
import NotFoundView from './components/NotFoundView';
import NewDraftModal from './components/NewDraftModal';
import NewRuleModal from './components/NewRuleModal';
import NewFactModal from './components/NewFactModal';
import ReviewNotesModal from './components/ReviewNotesModal';
import { api } from './api';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const VALID_VIEWS = ['dashboard', 'audit', 'guidelines', 'history'];

const VIEW_METADATA = {
  dashboard: {
    title: 'Dashboard | BrandProof — Intelligent Brand Governance',
    description: 'Executive overview of active marketing drafts, deterministic brand governance rules, and verified facts.'
  },
  audit: {
    title: 'Content Review Studio | BrandProof',
    description: 'Interactive pre-publication marketing draft editor with brand voice rules, terminology checks, and Brand Trust Reports.'
  },
  guidelines: {
    title: 'Brand Rules & Facts | BrandProof',
    description: 'Centralized repository of approved brand terminology, tone attributes, legal SLA claims, and verified facts.'
  },
  history: {
    title: 'Audit & Review Log | BrandProof',
    description: 'Chronological audit trail of editorial status transitions, reviewer feedback notes, and publication sign-offs.'
  },
  '404': {
    title: '404 Page Not Found | BrandProof',
    description: 'The requested section does not exist within the BrandProof governance suite.'
  }
};

export default function App() {
  // Navigation & Routing state
  const getInitialView = () => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (!hash) return 'dashboard';
    return VALID_VIEWS.includes(hash) ? hash : '404';
  };

  const [activeView, setActiveView] = useState(getInitialView);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data
  const [systemInfo, setSystemInfo] = useState(null);
  const [health, setHealth] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [rules, setRules] = useState([]);
  const [facts, setFacts] = useState([]);
  const [findings, setFindings] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals
  const [isNewDraftOpen, setIsNewDraftOpen] = useState(false);
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [isNewFactOpen, setIsNewFactOpen] = useState(false);
  const [notesModalData, setNotesModalData] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // URL Hash Routing synchronization
  const handleNavigate = (view) => {
    if (VALID_VIEWS.includes(view)) {
      window.location.hash = `#/${view}`;
      setActiveView(view);
    } else {
      window.location.hash = `#/404`;
      setActiveView('404');
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (!hash) {
        setActiveView('dashboard');
      } else if (VALID_VIEWS.includes(hash)) {
        setActiveView(hash);
      } else {
        setActiveView('404');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update Page Title and Meta Description dynamically
  useEffect(() => {
    const meta = VIEW_METADATA[activeView] || VIEW_METADATA['404'];
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.name = 'description';
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);
  }, [activeView]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [info, healthData, brandsData] = await Promise.all([
          api.getAppInfo().catch(() => null),
          api.getHealth().catch(() => null),
          api.getBrands().catch(() => [])
        ]);

        if (!ignore) {
          setSystemInfo(info);
          setHealth(healthData);
          setBrands(brandsData);

          if (brandsData.length > 0) {
            setSelectedBrand(brandsData[0]);
          }
        }
      } catch (err) {
        if (!ignore) {
          addToast('error', `Failed to initialize: ${err.message}`);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Fetch Brand Specific Data (Rules, Facts, Drafts)
  const fetchBrandData = useCallback(async (brandId) => {
    if (!brandId) return;
    try {
      const [rulesData, factsData, draftsData] = await Promise.all([
        api.getRules(brandId).catch(() => []),
        api.getFacts(brandId).catch(() => []),
        api.getDrafts(brandId).catch(() => [])
      ]);

      setRules(rulesData);
      setFacts(factsData);
      setDrafts(draftsData);

      if (draftsData.length > 0) {
        setSelectedDraft(draftsData[0]);
      } else {
        setSelectedDraft(null);
        setFindings([]);
        setReviewHistory([]);
      }
    } catch (err) {
      addToast('error', `Error loading brand data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const brandId = selectedBrand?.id;
    if (!brandId) return;

    let ignore = false;
    async function syncBrand() {
      try {
        const [rulesData, factsData, draftsData] = await Promise.all([
          api.getRules(brandId).catch(() => []),
          api.getFacts(brandId).catch(() => []),
          api.getDrafts(brandId).catch(() => [])
        ]);

        if (!ignore) {
          setRules(rulesData);
          setFacts(factsData);
          setDrafts(draftsData);

          if (draftsData.length > 0) {
            setSelectedDraft(draftsData[0]);
          } else {
            setSelectedDraft(null);
            setFindings([]);
            setReviewHistory([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          addToast('error', `Error loading brand data: ${err.message}`);
        }
      }
    }

    syncBrand();
    return () => {
      ignore = true;
    };
  }, [selectedBrand?.id]);

  // 3. Fetch Draft Specific Data (Findings, History)
  const fetchDraftDetails = useCallback(async (draftId) => {
    if (!draftId) {
      setFindings([]);
      setReviewHistory([]);
      return;
    }
    try {
      const [findingsData, historyData] = await Promise.all([
        api.getFindings(draftId).catch(() => []),
        api.getReviewHistory(draftId).catch(() => [])
      ]);
      setFindings(findingsData);
      setReviewHistory(historyData);
    } catch (err) {
      addToast('error', `Error loading draft details: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const draftId = selectedDraft?.id;
    if (!draftId) {
      return;
    }

    let ignore = false;
    async function syncDraft() {
      try {
        const [findingsData, historyData] = await Promise.all([
          api.getFindings(draftId).catch(() => []),
          api.getReviewHistory(draftId).catch(() => [])
        ]);
        if (!ignore) {
          setFindings(findingsData);
          setReviewHistory(historyData);
        }
      } catch (err) {
        if (!ignore) {
          addToast('error', `Error loading draft details: ${err.message}`);
        }
      }
    }

    syncDraft();
    return () => {
      ignore = true;
    };
  }, [selectedDraft?.id]);

  // Handlers
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
  };

  const handleSelectDraft = (draft) => {
    setSelectedDraft(draft);
    handleNavigate('audit');
  };

  const handleUpdateDraftText = async (draftId, newText) => {
    try {
      const updated = await api.updateDraft(draftId, newText);
      setSelectedDraft(updated);
      setDrafts(prev => prev.map(d => d.id === draftId ? updated : d));
      addToast('success', 'Draft edits saved to database.');
    } catch (err) {
      addToast('error', `Failed to save edits: ${err.message}`);
    }
  };

  const handleRunAudit = async (draftId, runAi = true) => {
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeDraft(draftId, runAi);
      setFindings(result.findings);

      const aiMsg = result.ai_assisted_used
        ? ` (${result.findings.filter(f => f.finding_source === 'ai_assisted').length} from Gemini AI)`
        : '';
      addToast('info', `Audit complete: ${result.total_findings} finding(s) detected${aiMsg}.`);
    } catch (err) {
      addToast('error', `Governance audit failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCorrection = async (findingId, action, customCorrection = null) => {
    try {
      const res = await api.applyFindingAction(findingId, action, customCorrection);
      addToast('success', res.message);

      if (res.draft) {
        setSelectedDraft(res.draft);
        setDrafts(prev => prev.map(d => d.id === res.draft.id ? res.draft : d));
      }
      if (res.finding) {
        setFindings(prev => prev.map(f => f.id === findingId ? res.finding : f));
      }
    } catch (err) {
      addToast('error', `Action failed: ${err.message}`);
    }
  };

  const handleTransitionStatus = async (draftId, toStatus, reviewerName = 'Editorial Team', notes = null) => {
    try {
      const res = await api.transitionReview(draftId, toStatus, reviewerName, notes);
      addToast('success', res.message);

      if (res.draft) {
        setSelectedDraft(res.draft);
        setDrafts(prev => prev.map(d => d.id === res.draft.id ? res.draft : d));
        fetchDraftDetails(draftId);
      }
    } catch (err) {
      addToast('error', `Review transition blocked: ${err.message}`);
    }
  };

  const handleCreateDraft = async (payload) => {
    try {
      const created = await api.createDraft(payload);
      setDrafts(prev => [created, ...prev]);
      setSelectedDraft(created);
      handleNavigate('audit');
      addToast('success', `Draft "${created.title}" submitted successfully.`);
    } catch (err) {
      addToast('error', `Could not create draft: ${err.message}`);
      throw err;
    }
  };

  const handleCreateRule = async (payload) => {
    try {
      const created = await api.createRule(payload);
      setRules(prev => [...prev, created]);
      addToast('success', `Brand Rule "${created.title}" added.`);
    } catch (err) {
      addToast('error', `Could not add rule: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.deleteRule(ruleId);
      setRules(prev => prev.filter(r => r.id !== ruleId));
      addToast('info', 'Brand rule removed.');
    } catch (err) {
      addToast('error', `Could not delete rule: ${err.message}`);
    }
  };

  const handleCreateFact = async (payload) => {
    try {
      const created = await api.createFact(payload);
      setFacts(prev => [...prev, created]);
      addToast('success', `Verified Fact "${created.fact_key}" added.`);
    } catch (err) {
      addToast('error', `Could not add fact: ${err.message}`);
      throw err;
    }
  };

  const handleDeleteFact = async (factId) => {
    try {
      await api.deleteFact(factId);
      setFacts(prev => prev.filter(f => f.id !== factId));
      addToast('info', 'Verified fact removed.');
    } catch (err) {
      addToast('error', `Could not delete fact: ${err.message}`);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await api.seedDemo();
      addToast('success', 'Demo brand and showcase data seeded.');
      await fetchInitialData();
      if (selectedBrand?.id) {
        await fetchBrandData(selectedBrand.id);
      }
    } catch (err) {
      addToast('error', `Demo seed failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const openReviewNotesModal = (draftId, targetStatus) => {
    setNotesModalData({ draftId, targetStatus });
  };

  const openFindingsCount = findings.filter(f => f.status === 'open').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation (with Mobile Drawer support) */}
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        draftsCount={drafts.length}
        rulesCount={rules.length}
        factsCount={facts.length}
        openFindingsCount={openFindingsCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-layout">
        <Header
          systemInfo={systemInfo}
          health={health}
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          onSeedDemo={handleSeedDemo}
          isSeeding={isSeeding}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="content-body" role="main">
          {activeView === 'dashboard' && (
            <DashboardView
              brand={selectedBrand}
              drafts={drafts}
              rules={rules}
              facts={facts}
              onSelectDraft={handleSelectDraft}
              onOpenNewDraftModal={() => setIsNewDraftOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'audit' && (
            <ContentAuditView
              draft={selectedDraft}
              drafts={drafts}
              onSelectDraft={setSelectedDraft}
              onUpdateDraftText={handleUpdateDraftText}
              onRunAudit={handleRunAudit}
              onApplyCorrection={handleApplyCorrection}
              onTransitionStatus={handleTransitionStatus}
              isAnalyzing={isAnalyzing}
              findings={findings}
              reviewHistory={reviewHistory}
              openReviewNotesModal={openReviewNotesModal}
            />
          )}

          {activeView === 'guidelines' && (
            <BrandGuidelinesView
              brand={selectedBrand}
              rules={rules}
              facts={facts}
              onDeleteRule={handleDeleteRule}
              onDeleteFact={handleDeleteFact}
              onOpenNewRuleModal={() => setIsNewRuleOpen(true)}
              onOpenNewFactModal={() => setIsNewFactOpen(true)}
            />
          )}

          {activeView === 'history' && (
            <AuditHistoryView
              drafts={drafts}
              reviewHistory={reviewHistory}
              onSelectDraft={handleSelectDraft}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === '404' && (
            <NotFoundView onNavigate={handleNavigate} />
          )}
        </main>

        {/* Global Application Footer */}
        <Footer
          onNavigate={handleNavigate}
          isHealthy={health?.status === 'healthy'}
        />
      </div>

      {/* Modals */}
      <NewDraftModal
        isOpen={isNewDraftOpen}
        onClose={() => setIsNewDraftOpen(false)}
        onSubmit={handleCreateDraft}
        brandId={selectedBrand?.id}
      />

      <NewRuleModal
        isOpen={isNewRuleOpen}
        onClose={() => setIsNewRuleOpen(false)}
        onSubmit={handleCreateRule}
        brandId={selectedBrand?.id}
      />

      <NewFactModal
        isOpen={isNewFactOpen}
        onClose={() => setIsNewFactOpen(false)}
        onSubmit={handleCreateFact}
        brandId={selectedBrand?.id}
      />

      {notesModalData && (
        <ReviewNotesModal
          isOpen={Boolean(notesModalData)}
          onClose={() => setNotesModalData(null)}
          onSubmit={handleTransitionStatus}
          draftId={notesModalData.draftId}
          targetStatus={notesModalData.targetStatus}
        />
      )}

      {/* Floating Toast Notifications */}
      <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={16} style={{ color: '#2563eb', flexShrink: 0 }} />}
            <span style={{ flex: 1, fontSize: '0.86rem' }}>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: 0 }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
