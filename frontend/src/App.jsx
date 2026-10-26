import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ContentAuditView from './components/ContentAuditView';
import BrandGuidelinesView from './components/BrandGuidelinesView';
import AuditHistoryView from './components/AuditHistoryView';
import NewDraftModal from './components/NewDraftModal';
import NewRuleModal from './components/NewRuleModal';
import NewFactModal from './components/NewFactModal';
import ReviewNotesModal from './components/ReviewNotesModal';
import { api } from './api';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState('dashboard');

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals
  const [isNewDraftOpen, setIsNewDraftOpen] = useState(false);
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [isNewFactOpen, setIsNewFactOpen] = useState(false);
  const [notesModalData, setNotesModalData] = useState(null); // { draftId, targetStatus }

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

  // 1. Initial Load
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [info, healthData, brandsData] = await Promise.all([
        api.getAppInfo().catch(() => null),
        api.getHealth().catch(() => null),
        api.getBrands().catch(() => [])
      ]);

      setSystemInfo(info);
      setHealth(healthData);
      setBrands(brandsData);

      if (brandsData.length > 0) {
        setSelectedBrand(brandsData[0]);
      }
    } catch (err) {
      addToast('error', `Failed to initialize: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
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

      // Select first draft if none selected or if previous selected doesn't belong to this brand
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
    if (selectedBrand?.id) {
      fetchBrandData(selectedBrand.id);
    }
  }, [selectedBrand?.id, fetchBrandData]);

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
    if (selectedDraft?.id) {
      fetchDraftDetails(selectedDraft.id);
    }
  }, [selectedDraft?.id, fetchDraftDetails]);

  // Handlers
  const handleSelectBrand = (brand) => {
    setSelectedBrand(brand);
  };

  const handleSelectDraft = (draft) => {
    setSelectedDraft(draft);
    setActiveView('audit');
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

      // Update draft text and findings locally
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
        // Refresh history
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
      setActiveView('audit');
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
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        draftsCount={drafts.length}
        rulesCount={rules.length}
        factsCount={facts.length}
        openFindingsCount={openFindingsCount}
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
        />

        <main className="content-body">
          {activeView === 'dashboard' && (
            <DashboardView
              brand={selectedBrand}
              drafts={drafts}
              rules={rules}
              facts={facts}
              onSelectDraft={handleSelectDraft}
              onOpenNewDraftModal={() => setIsNewDraftOpen(true)}
              onNavigate={setActiveView}
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
              onNavigate={setActiveView}
            />
          )}
        </main>
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
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />}
            {toast.type === 'error' && <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />}
            {toast.type === 'info' && <Info size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
