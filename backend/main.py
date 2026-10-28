import logging
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database import init_db
from backend.seed_data import seed_demo_data_if_empty
from backend.models import (
    BrandProfileCreate,
    BrandProfileResponse,
    BrandRuleCreate,
    BrandRuleResponse,
    BrandFactCreate,
    BrandFactResponse,
    ContentDraftCreate,
    ContentDraftUpdateText,
    ContentDraftResponse,
    AnalysisFindingResponse,
    ApplyCorrectionRequest,
    ReviewTransitionRequest,
    ReviewHistoryResponse,
    AnalysisRunResponse,
    BrandTrustReportResponse,
)
import backend.crud as crud
from backend.rules_engine import analyze_draft_with_rules
from backend.ai_engine import analyze_draft_with_gemini

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("brandproof.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed demo data
    logger.info("Initializing SQLite database...")
    init_db()
    seed_demo_data_if_empty()
    logger.info(f"BrandProof backend startup complete. AI enabled: {settings.has_ai}")
    yield
    logger.info("BrandProof backend shutting down...")

app = FastAPI(
    title="BrandProof API",
    description="AI-powered brand governance, voice compliance, and fact verification platform for CODEX-48 Round 2.",
    version="1.0.0-mvp",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- BASE & HEALTH ENDPOINTS -----------------

@app.get("/", tags=["System"])
def get_app_info():
    """Application metadata and system status."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "description": "AI-powered brand governance & fact verification web application",
        "features": [
            "Deterministic Rule Engine (Terminology, Claims, Style, Voice)",
            "Verified Brand Facts & Factual Consistency Checker",
            "Google Gemini AI Governance Auditor (Nuanced claims, tone subtleties)",
            "Interactive Correction Workflow (Accept, Edit, Reject)",
            "Governed Review State Machine (Draft -> In Review -> Changes Requested / Approved / Rejected)"
        ],
        "ai_active": settings.has_ai,
        "ai_model": settings.gemini_model if settings.has_ai else "None (Deterministic rule engine only)",
        "docs_url": "/docs"
    }

@app.get("/health", tags=["System"])
def health_check():
    """Health status endpoint."""
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "ai_configured": settings.has_ai,
    }

# ----------------- BRAND PROFILES -----------------

@app.post("/api/brands", response_model=BrandProfileResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Profiles"])
def create_brand(profile: BrandProfileCreate):
    try:
        return crud.create_brand_profile(profile)
    except Exception as e:
        logger.error(f"Error creating brand profile: {e}")
        raise HTTPException(status_code=400, detail=f"Brand profile could not be created: {str(e)}")

@app.get("/api/brands", response_model=List[BrandProfileResponse], tags=["Brand Profiles"])
def list_brands():
    return crud.list_brand_profiles()

@app.get("/api/brands/{brand_id}", response_model=BrandProfileResponse, tags=["Brand Profiles"])
def get_brand(brand_id: int):
    brand = crud.get_brand_profile(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{brand_id} not found")
    return brand

# ----------------- BRAND RULES -----------------

@app.post("/api/rules", response_model=BrandRuleResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Rules"])
def create_rule(rule: BrandRuleCreate):
    brand = crud.get_brand_profile(rule.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{rule.brand_id} not found")
    return crud.create_brand_rule(rule)

@app.get("/api/brands/{brand_id}/rules", response_model=List[BrandRuleResponse], tags=["Brand Rules"])
def list_rules(brand_id: int):
    return crud.list_brand_rules(brand_id)

@app.delete("/api/rules/{rule_id}", tags=["Brand Rules"])
def delete_rule(rule_id: int):
    deleted = crud.delete_brand_rule(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Rule #{rule_id} not found")
    return {"message": f"Rule #{rule_id} deleted successfully"}

# ----------------- BRAND FACTS -----------------

@app.post("/api/facts", response_model=BrandFactResponse, status_code=status.HTTP_201_CREATED, tags=["Brand Facts"])
def create_fact(fact: BrandFactCreate):
    brand = crud.get_brand_profile(fact.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{fact.brand_id} not found")
    return crud.create_brand_fact(fact)

@app.get("/api/brands/{brand_id}/facts", response_model=List[BrandFactResponse], tags=["Brand Facts"])
def list_facts(brand_id: int):
    return crud.list_brand_facts(brand_id)

@app.delete("/api/facts/{fact_id}", tags=["Brand Facts"])
def delete_fact(fact_id: int):
    deleted = crud.delete_brand_fact(fact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Fact #{fact_id} not found")
    return {"message": f"Fact #{fact_id} deleted successfully"}

# ----------------- CONTENT DRAFTS -----------------

@app.post("/api/drafts", response_model=ContentDraftResponse, status_code=status.HTTP_201_CREATED, tags=["Content Drafts"])
def submit_draft(draft: ContentDraftCreate):
    brand = crud.get_brand_profile(draft.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Brand profile #{draft.brand_id} not found")
    return crud.create_content_draft(draft)

@app.get("/api/drafts", response_model=List[ContentDraftResponse], tags=["Content Drafts"])
def list_drafts(brand_id: Optional[int] = Query(None)):
    return crud.list_content_drafts(brand_id)

@app.get("/api/drafts/{draft_id}", response_model=ContentDraftResponse, tags=["Content Drafts"])
def get_draft(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return draft

@app.put("/api/drafts/{draft_id}", response_model=ContentDraftResponse, tags=["Content Drafts"])
def update_draft(draft_id: int, payload: ContentDraftUpdateText):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    updated = crud.update_draft_text(draft_id, payload.current_text, payload.editor_notes)
    return updated

# ----------------- GOVERNANCE ANALYSIS -----------------

@app.post("/api/drafts/{draft_id}/analyze", response_model=AnalysisRunResponse, tags=["Analysis"])
async def run_governance_analysis(draft_id: int, run_ai: bool = Query(True)):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")

    brand_id = draft["brand_id"]
    profile = crud.get_brand_profile(brand_id)
    rules = crud.list_brand_rules(brand_id)
    facts = crud.list_brand_facts(brand_id)

    # 1. Clear prior findings for fresh run
    crud.clear_open_findings(draft_id)

    # 2. Run deterministic rule-based checks
    rule_findings = analyze_draft_with_rules(
        draft_text=draft["current_text"],
        rules=rules,
        facts=facts,
        profile=profile
    )

    all_findings = list(rule_findings)
    ai_used = False
    ai_status = "AI analysis skipped by user parameter."

    # 3. If requested and available, run AI-assisted checks
    if run_ai:
        ai_findings, ai_used, ai_status = await analyze_draft_with_gemini(
            draft_text=draft["current_text"],
            rules=rules,
            facts=facts,
            profile=profile
        )
        if ai_findings:
            # Filter duplicates if AI matched the same phrase
            existing_matches = {f.get("matched_text", "").lower() for f in rule_findings if f.get("matched_text")}
            for af in ai_findings:
                if af.get("matched_text", "").lower() not in existing_matches:
                    all_findings.append(af)

    # 4. Save findings to database
    saved = crud.save_findings(draft_id, all_findings)

    return AnalysisRunResponse(
        draft_id=draft_id,
        total_findings=len(saved),
        findings=saved,
        rules_checked=len(rules),
        facts_checked=len(facts),
        ai_assisted_used=ai_used,
        ai_status_message=ai_status
    )

@app.get("/api/drafts/{draft_id}/findings", response_model=List[AnalysisFindingResponse], tags=["Analysis"])
def get_findings(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return crud.get_draft_findings(draft_id)

@app.get("/api/drafts/{draft_id}/trust-report", response_model=BrandTrustReportResponse, tags=["Analysis"])
def get_draft_trust_report(draft_id: int):
    """
    Computes and returns the Brand Trust Report summarizing the selected draft's
    governance state: severity breakdown, category issues, resolved corrections,
    approval blockers, and transparent publication readiness.
    """
    report = crud.generate_brand_trust_report(draft_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return report


# ----------------- CORRECTION ACTIONS -----------------

@app.post("/api/findings/{finding_id}/action", tags=["Analysis"])
def apply_correction(finding_id: int, payload: ApplyCorrectionRequest):
    success, message, finding, draft = crud.apply_finding_action(
        finding_id=finding_id,
        action=payload.action,
        custom_correction=payload.custom_correction
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "finding": finding,
        "draft": draft
    }

# ----------------- REVIEW WORKFLOW & STATE TRANSITIONS -----------------

@app.post("/api/drafts/{draft_id}/review-transition", tags=["Review Workflow"])
def transition_draft_review(draft_id: int, payload: ReviewTransitionRequest):
    success, message, updated_draft = crud.transition_review_status(
        draft_id=draft_id,
        to_status=payload.to_status,
        reviewer_name=payload.reviewer_name,
        notes=payload.notes
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {
        "success": True,
        "message": message,
        "draft": updated_draft
    }

@app.get("/api/drafts/{draft_id}/review-history", response_model=List[ReviewHistoryResponse], tags=["Review Workflow"])
def get_draft_review_history(draft_id: int):
    draft = crud.get_content_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail=f"Content draft #{draft_id} not found")
    return crud.get_review_history(draft_id)

# ----------------- DEMO SEED RESET -----------------

@app.post("/api/seed", tags=["System"])
def seed_demo():
    """Seeds or resets the demo brand with rules, facts, and drafts."""
    brand_id = seed_demo_data_if_empty()
    return {"message": "Demo data seeded successfully", "brand_id": brand_id}
