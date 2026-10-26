// API Client for BrandProof FastAPI Backend

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `Server error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch (e) {
        // fallback
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // System
  getAppInfo: () => request('/'),
  getHealth: () => request('/health'),
  seedDemo: () => request('/api/seed', { method: 'POST' }),

  // Brands
  getBrands: () => request('/api/brands'),
  getBrand: (id) => request(`/api/brands/${id}`),
  createBrand: (data) => request('/api/brands', { method: 'POST', body: JSON.stringify(data) }),

  // Rules
  getRules: (brandId) => request(`/api/brands/${brandId}/rules`),
  createRule: (data) => request('/api/rules', { method: 'POST', body: JSON.stringify(data) }),
  deleteRule: (ruleId) => request(`/api/rules/${ruleId}`, { method: 'DELETE' }),

  // Facts
  getFacts: (brandId) => request(`/api/brands/${brandId}/facts`),
  createFact: (data) => request('/api/facts', { method: 'POST', body: JSON.stringify(data) }),
  deleteFact: (factId) => request(`/api/facts/${factId}`, { method: 'DELETE' }),

  // Drafts
  getDrafts: (brandId) => request(brandId ? `/api/drafts?brand_id=${brandId}` : '/api/drafts'),
  getDraft: (draftId) => request(`/api/drafts/${draftId}`),
  createDraft: (data) => request('/api/drafts', { method: 'POST', body: JSON.stringify(data) }),
  updateDraft: (draftId, currentText, editorNotes = null) =>
    request(`/api/drafts/${draftId}`, {
      method: 'PUT',
      body: JSON.stringify({ current_text: currentText, editor_notes: editorNotes }),
    }),

  // Governance Analysis
  analyzeDraft: (draftId, runAi = true) =>
    request(`/api/drafts/${draftId}/analyze?run_ai=${runAi}`, { method: 'POST' }),
  getFindings: (draftId) => request(`/api/drafts/${draftId}/findings`),

  // Correction Action (Accept / Reject / Edit)
  applyFindingAction: (findingId, action, customCorrection = null) =>
    request(`/api/findings/${findingId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, custom_correction: customCorrection }),
    }),

  // Review Workflow
  transitionReview: (draftId, toStatus, reviewerName, notes = null) =>
    request(`/api/drafts/${draftId}/review-transition`, {
      method: 'POST',
      body: JSON.stringify({
        to_status: toStatus,
        reviewer_name: reviewerName,
        notes: notes,
      }),
    }),
  getReviewHistory: (draftId) => request(`/api/drafts/${draftId}/review-history`),
};
