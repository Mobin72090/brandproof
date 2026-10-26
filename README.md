# BrandProof — AI Brand Governance & Fact Verification

> **CODEX-48 Round 2 Working MVP**  
> An enterprise AI brand governance application that audits marketing and public communications before publication against approved brand guidelines, tone attributes, prohibited claims, and verified corporate facts.

---

## 1. Executive Summary & Problem Statement

Organizations risk severe brand dilution, regulatory fines, and customer mistrust when marketing content is published with:
- **Inconsistent brand tone** and off-brand writing styles.
- **Incorrect terminology** or deprecated product names.
- **Direct conflicts with verified brand facts** (e.g., misstating founding year, SLA uptime commitments, encryption standards).
- **Unsupported or prohibited promotional claims** (e.g., "100% zero downtime", "cheapest in the world", "completely risk-free").
- **Missing or violated compliance rules**.

**BrandProof** solves this by providing a dual-engine pre-publication auditor:
1. **Deterministic Rule Engine:** Delivers instantaneous, 100% reliable regex matching for terminology casing, prohibited claims, corporate buzzwords, and factual consistency checks.
2. **Google Gemini AI Auditor:** Evaluates nuanced tone, subtle exaggerations, and context-dependent voice attributes while validating against strict schema boundaries.
3. **Interactive Human-in-the-Loop Studio:** Authors and compliance reviewers can accept, edit, or reject each suggestion with single-click draft replacement.
4. **Governed State Machine:** Enforces strict editorial lifecycle transitions (`Draft` → `In Review` → `Changes Requested` / `Approved` / `Rejected`) and blocks approvals if unresolved critical findings exist.

---

## 2. Architecture & Technical Design

BrandProof is structured as a decoupled full-stack application:

```
BrandProof/
├── backend/                  # FastAPI Application
│   ├── config.py             # Environment configuration (pydantic-settings / dotenv)
│   ├── database.py           # SQLite connection pooling & schema migrations
│   ├── models.py             # Pydantic domain models & request/response schemas
│   ├── crud.py               # Data access layer & state transition guards
│   ├── rules_engine.py       # Deterministic regex, fact, and style auditor
│   ├── ai_engine.py          # Gemini AI governance auditor with graceful fallback
│   ├── seed_data.py          # Demo brand (AetherCloud), guidelines, and drafts
│   ├── main.py               # FastAPI router endpoints & CORS middleware
│   └── tests/
│       ├── __init__.py
│       └── test_api.py       # Automated pytest suite (8 passing tests)
├── frontend/                 # Vite + React 18 Application
│   ├── src/
│   │   ├── api.js            # Centralized API client with proxy support
│   │   ├── index.css         # Custom SaaS design tokens (vanilla CSS)
│   │   ├── components/
│   │   │   ├── Header.jsx    # System health, brand switcher & AI status
│   │   │   ├── Sidebar.jsx   # Navigation & compliance notification badge
│   │   │   ├── DashboardView.jsx       # KPIs, active pipeline & workflow summary
│   │   │   ├── ContentAuditView.jsx    # Dual-pane editor & governance inspector
│   │   │   ├── BrandGuidelinesView.jsx # Rules & verified facts repository
│   │   │   ├── AuditHistoryView.jsx    # Complete review audit trail
│   │   │   ├── NewDraftModal.jsx       # Content submission modal
│   │   │   ├── NewRuleModal.jsx        # Brand rule creation modal
│   │   │   ├── NewFactModal.jsx        # Verified fact creation modal
│   │   │   └── ReviewNotesModal.jsx    # Editorial notes & state transition modal
│   │   ├── App.jsx           # Application controller & state management
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # SEO meta tags, Google Fonts (Inter & Outfit)
│   ├── package.json
│   └── vite.config.js        # Dev server & API proxy
├── .env.example              # Environment template (secrets kept out of git)
├── .gitignore                # Protects .venv, .env, *.db, node_modules, dist
├── verify_e2e.py             # End-to-end integration test script
└── README.md
```

### Technology Stack
- **Backend:** Python 3.14, FastAPI 0.162, Uvicorn, SQLite3, Pydantic 2.14, python-dotenv, httpx, pytest.
- **Frontend:** React 18, Vite 6, Vanilla CSS (Design Tokens, Dark SaaS Theme), Lucide React.
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`), with 100% deterministic local fallback when API key is unconfigured or service is unreachable.

---

## 3. Seed Showcase: Fictional Demo Brand

To allow immediate judging without manual configuration, the platform auto-seeds a rich fictional enterprise brand: **AetherCloud Technologies**.

- **Brand:** *AetherCloud* ("Autonomous, provable enterprise cloud security")
- **Approved Tone:** `Authoritative`, `Technically Precise`, `Direct`, `Humble & Transparent`
- **Seeded Rules:**
  - `[High]` Casing: Must spell as `AetherCloud` (never `Aethercloud`).
  - `[High]` Product Casing: Must spell as `BrandProof` (never `Brandproof`).
  - `[Critical]` Deprecated Product: `CloudMesh` must be replaced with `AetherMesh Fabric`.
  - `[Critical]` Prohibited Claim: Never claim `100% guaranteed zero downtime`; replace with `99.95% financially-backed SLA`.
  - `[Critical]` Prohibited Safety Claim: Never claim `completely risk-free` or unhackable.
  - `[High]` Prohibited Superlative: Ban unverified claims like `cheapest in the world`.
  - `[Low]` Clichés & Buzzwords: Ban empty corporate filler such as `synergy`, `game-changer`, and `disrupt the industry`.
- **Verified Facts:**
  - `founded_year`: Founded in **2021** (Delaware Certificate of Incorporation #639201).
  - `sla_uptime`: Master Services Agreement enterprise commitment is **99.95%**.
  - `encryption_standard`: Standard is **AES-256-GCM** (SOC-2 Type II Audit & ISO 27001).
  - `headquarters`: Austin, Texas.
- **Showcase Drafts:**
  - Draft #1: *Q4 Product Launch Announcement* (Approved showcase with full review audit trail).
  - Draft #2: *Enterprise Cloud Migration Guide — Fall Campaign* (Fresh unreviewed draft containing seeded violations for live testing).

---

## 4. API Endpoints Reference

### System & Health
- `GET /` — Returns application metadata, active features, and AI auditor configuration.
- `GET /health` — Health check endpoint (`{"status": "healthy", "database": "sqlite_connected"}`).
- `POST /api/seed` — Seeds or resets the fictional demo brand and test drafts.

### Brand Profiles
- `GET /api/brands` — List all brand profiles.
- `POST /api/brands` — Create a new brand profile.
- `GET /api/brands/{id}` — Get profile details with tone attributes.

### Brand Rules & Facts
- `GET /api/brands/{id}/rules` — List approved brand rules for a brand.
- `POST /api/rules` — Create an approved brand rule.
- `DELETE /api/rules/{id}` — Delete a brand rule.
- `GET /api/brands/{id}/facts` — List verified brand facts.
- `POST /api/facts` — Add a verified fact with evidence citation.
- `DELETE /api/facts/{id}` — Delete a verified fact.

### Content Drafts & Audit
- `GET /api/drafts` — List marketing drafts (filterable by `brand_id`).
- `POST /api/drafts` — Submit a new draft (`brand_id`, `title`, `channel`, `author`, `original_text`).
- `GET /api/drafts/{id}` — Get draft details and current text.
- `PUT /api/drafts/{id}` — Update draft content text.
- `POST /api/drafts/{id}/analyze?run_ai=true` — Trigger governance audit against rules and facts.
- `GET /api/drafts/{id}/findings` — Retrieve findings with severity, explanation, evidence, and suggestions.
- `POST /api/findings/{id}/action` — Apply correction (`accept` replaces text, `edit` applies custom text, `reject` dismisses finding).

### Governed Review Workflow
- `POST /api/drafts/{id}/review-transition` — Transition review state (`Draft` → `In Review` → `Changes Requested` / `Approved` / `Rejected`). Blocks approval if open critical findings exist.
- `GET /api/drafts/{id}/review-history` — Full audit trail of status changes, reviewer names, and timestamps.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ and npm 9+ (tested with Node.js v24 and npm 11)
- Git

### Step 1: Environment Setup
Clone the repository and copy the environment configuration:
```bash
cp .env.example .env
```
*(Optional)* To enable Google Gemini AI analysis, set your key inside `.env`:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
*Note: BrandProof functions 100% offline in deterministic mode if no API key is provided.*

### Step 2: Backend Setup & Launch
Activate the virtual environment and start the FastAPI server:
```bash
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# On macOS/Linux:
source .venv/bin/activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Verify the backend is live at [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health). Interactive Swagger API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Step 3: Frontend Setup & Launch
In a separate terminal, start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 6. Testing & Verification

### Automated Backend Unit & Contract Tests
Run the automated pytest suite:
```bash
.venv\Scripts\pytest backend/tests/test_api.py -v
```
**Test Results (8 passed in 1.03s):**
- `test_app_info` — Verified root metadata and feature flags.
- `test_health` — Verified database connectivity and health status.
- `test_brand_profile_lifecycle` — Verified brand creation, tone attributes, and retrieval.
- `test_rules_and_facts_creation` — Verified rule and fact persistence.
- `test_draft_submission_and_rule_engine_findings` — Verified seeded detection of casing errors, deprecated products, prohibited claims, and factual conflicts.
- `test_finding_correction_acceptance_and_rejection` — Verified that accepting a correction updates the draft in SQLite, while rejecting preserves text.
- `test_review_status_governance_workflow` — Verified lifecycle transitions and audit trail logging.
- `test_prevent_approval_with_unresolved_critical_finding` — Verified that transitioning to `Approved` is strictly blocked when unresolved critical findings exist.

### End-to-End Integration Test
Execute the comprehensive integration script:
```bash
python verify_e2e.py
```
This script exercises the complete end-to-end lifecycle across the live backend and frontend server.

---

## 7. Public Deployment Instructions

### Backend (FastAPI on Render / Railway / Fly.io)
1. **Container / Procfile:** Add a `Procfile` containing:
   ```
   web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
2. **Environment Variables:** Set `ENVIRONMENT=production`, `CORS_ORIGINS=https://your-frontend.vercel.app`, and optional `GEMINI_API_KEY`.
3. **Database:** SQLite works out of the box with persistent volume mounts, or point `DATABASE_PATH` to a mounted volume path.

### Frontend (React + Vite on Vercel / Netlify / Cloudflare Pages)
1. **Root Directory:** `frontend/`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Environment Variables:** `VITE_API_BASE_URL=https://your-backend-api.onrender.com`

---

## 8. CODEX-48 Round 2 Hackathon Governance Record

### Features Actually Completed
1. Full CRUD for Brand Profiles, Governance Rules, and Verified Facts in SQLite.
2. Deterministic governance rule engine with exact term, casing, regex, and proximity contradiction matching.
3. Verified factual integrity auditor (flags founding year, encryption standards, and SLA guarantees).
4. Google Gemini AI Governance Auditor integration with strict JSON schema validation and graceful fallback.
5. Interactive human-in-the-loop review studio with real-time text editor and word/character counters.
6. One-click correction workflow (Accept replaces text in SQLite; Edit allows custom wording; Reject dismisses).
7. Review state machine with approval guards (`Draft` → `In Review` → `Changes Requested` / `Approved` / `Rejected`).
8. Full chronological audit history log tracking all review transitions and notes.
9. Responsive SaaS dashboard with custom typography, status badges, and severity indicators.

### Architecture & Technical Decisions
- **Deterministic First:** We prioritized deterministic regex and fact verification before AI. This guarantees that critical trademark, SLA, and legal compliance rules never suffer from LLM hallucinations or latency.
- **SQLite Single-File Persistence:** Zero external database server dependencies; lightweight, reliable, and instant setup for judges and local evaluation.
- **Vanilla CSS Tokens:** Chosen over Tailwind to provide complete aesthetic control, zero build-step purge conflicts, and a cohesive, tailored enterprise dark theme.

### Libraries & External Services Used
- `FastAPI`, `Uvicorn`, `Pydantic v2`, `SQLite3`, `python-dotenv`, `httpx`, `pytest`.
- `React 18`, `Vite 6`, `Lucide React`.
- `Google Gemini API` (`gemini-2.5-flash`).

### Current Limitations
- Single-organization local workspace (multi-tenant organization auth with SSO/SAML is earmarked for production).
- Rule pattern matching currently operates on individual marketing drafts rather than full multi-page PDF document sets.
- Reviewer roles are labeled locally (role-based access control with cryptographic signatures is planned for enterprise tiers).

### Disclosures
- Built with AI assistance (Google Gemini model in pair programming mode).
- No proprietary templates or unlicensed code libraries used. All CSS and components were custom engineered for BrandProof.

### Three Meaningful Improvements Planned for Round 3
1. **Multi-Modal Asset & Layout Governance:** Expand audit capabilities to evaluate image brand colors, logos, typography hierarchy, and slide deck exports.
2. **CMS & Headless Integrations:** Direct webhook and plugin integrations with WordPress, Contentful, Webflow, and HubSpot to gate publication directly at the CMS publish button.
3. **Automated Brand Voice Fine-Tuning:** Ingest historical high-performing brand assets to train custom enterprise tone embeddings and provide personalized style scoring.
