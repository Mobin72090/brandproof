import os
import pytest
from fastapi.testclient import TestClient

# Use a test database file
os.environ["DATABASE_PATH"] = "test_brandproof.db"

from backend.main import app
from backend.database import init_db, get_db_path
from backend.seed_data import seed_demo_data_if_empty

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    db_path = get_db_path()
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    init_db()
    seed_demo_data_if_empty()
    yield
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass
    # Cleanup test db if desired
    db_path = get_db_path()
    if "test_brandproof" in db_path and os.path.exists(db_path):
        try:
            os.remove(db_path)
        except Exception:
            pass

client = TestClient(app)

def test_app_info():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "BrandProof"
    assert "deterministic" in data["features"][0].lower()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_brand_profile_lifecycle():
    # Create brand
    payload = {
        "name": "TestCorp Global",
        "tagline": "Next-gen enterprise software",
        "description": "Provider of secure enterprise solutions",
        "industry": "Software",
        "tone_attributes": ["Professional", "Concise", "Empathetic"]
    }
    create_res = client.post("/api/brands", json=payload)
    assert create_res.status_code == 201
    brand = create_res.json()
    brand_id = brand["id"]
    assert brand["name"] == "TestCorp Global"
    assert "Professional" in brand["tone_attributes"]

    # Retrieve brand
    get_res = client.get(f"/api/brands/{brand_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "TestCorp Global"

def test_rules_and_facts_creation():
    # Fetch demo brand
    brands = client.get("/api/brands").json()
    assert len(brands) > 0
    brand_id = brands[0]["id"]

    # Create new rule
    rule_payload = {
        "brand_id": brand_id,
        "rule_type": "terminology",
        "category": "Terminology",
        "title": "Spell AI Suite with Capitals",
        "description": "Always capitalize AI Suite",
        "pattern_or_term": "ai suite",
        "preferred_term": "AI Suite",
        "severity": "medium",
        "rationale": "Product branding guideline"
    }
    rule_res = client.post("/api/rules", json=rule_payload)
    assert rule_res.status_code == 201
    assert rule_res.json()["pattern_or_term"] == "ai suite"

    # Create new fact
    fact_payload = {
        "brand_id": brand_id,
        "fact_key": "customer_count",
        "fact_statement": "AetherCloud serves over 1,500 enterprise customers globally.",
        "verified_value": "1,500+",
        "evidence_source": "Annual Investor Report 2024"
    }
    fact_res = client.post("/api/facts", json=fact_payload)
    assert fact_res.status_code == 201
    assert fact_res.json()["fact_key"] == "customer_count"

def test_draft_submission_and_rule_engine_findings():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    draft_payload = {
        "brand_id": brand_id,
        "title": "Press Release for Cloud Engine",
        "channel": "Press Release",
        "author": "Marketer Jane",
        "original_text": "Since Aethercloud was founded in 2018, we deliver 100% guaranteed zero downtime with CloudMesh."
    }
    draft_res = client.post("/api/drafts", json=draft_payload)
    assert draft_res.status_code == 201
    draft = draft_res.json()
    draft_id = draft["id"]
    assert draft["review_status"] == "Draft"

    # Analyze draft (deterministic mode, run_ai=False to avoid external API calls)
    analysis_res = client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert analysis["total_findings"] >= 3

    # Check that seeded violations were caught:
    # 1. Terminology: 'Aethercloud' casing
    # 2. Terminology: 'CloudMesh' deprecated product
    # 3. Prohibited Claim: '100% guaranteed zero downtime'
    # 4. Factual conflict: 'founded in 2018' vs 2021
    finding_titles = [f["title"].lower() for f in analysis["findings"]]
    matched_texts = [f["matched_text"] for f in analysis["findings"] if f["matched_text"]]

    assert any("aethercloud" in m.lower() for m in matched_texts)
    assert any("cloudmesh" in m.lower() for m in matched_texts)
    assert any("100% guaranteed zero downtime" in m.lower() for m in matched_texts)
    assert any("founding year" in t for t in finding_titles)

    # Check evidence linking
    for f in analysis["findings"]:
        assert len(f["evidence"]) > 0
        assert f["severity"] in ["critical", "high", "medium", "low"]

def test_finding_correction_acceptance_and_rejection():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    draft_payload = {
        "brand_id": brand_id,
        "title": "Blog test",
        "channel": "Blog",
        "author": "Author A",
        "original_text": "We love CloudMesh because it has great synergy."
    }
    draft = client.post("/api/drafts", json=draft_payload).json()
    draft_id = draft["id"]

    # Run analysis
    client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")
    findings = client.get(f"/api/drafts/{draft_id}/findings").json()

    # Find the CloudMesh finding
    cloudmesh_finding = next((f for f in findings if "cloudmesh" in (f["matched_text"] or "").lower()), None)
    assert cloudmesh_finding is not None
    assert cloudmesh_finding["suggested_correction"] == "AetherMesh Fabric"

    # Accept the correction
    action_res = client.post(
        f"/api/findings/{cloudmesh_finding['id']}/action",
        json={"action": "accept"}
    )
    assert action_res.status_code == 200
    res_data = action_res.json()
    assert res_data["finding"]["status"] == "accepted"
    # Verify draft text was updated in SQLite!
    assert "AetherMesh Fabric" in res_data["draft"]["current_text"]
    assert "CloudMesh" not in res_data["draft"]["current_text"]

    # Test reject action on another finding (e.g. synergy)
    synergy_finding = next((f for f in findings if "synergy" in (f["matched_text"] or "").lower()), None)
    if synergy_finding:
        reject_res = client.post(
            f"/api/findings/{synergy_finding['id']}/action",
            json={"action": "reject"}
        )
        assert reject_res.status_code == 200
        assert reject_res.json()["finding"]["status"] == "rejected"
        # Content remains unchanged
        assert "synergy" in reject_res.json()["draft"]["current_text"]

def test_review_status_governance_workflow():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # Create a clean draft with no critical issues
    clean_draft_payload = {
        "brand_id": brand_id,
        "title": "Clean Press Release",
        "channel": "PR",
        "author": "Compliant Writer",
        "original_text": "AetherCloud was founded in 2021 and delivers high-performance cloud orchestration."
    }
    draft = client.post("/api/drafts", json=clean_draft_payload).json()
    draft_id = draft["id"]

    # 1. Invalid jump: Draft directly to Approved (should fail)
    bad_jump = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Boss"}
    )
    assert bad_jump.status_code == 400
    assert "Invalid transition" in bad_jump.json()["detail"]

    # 2. Valid transition: Draft -> In Review
    t1 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Writer", "notes": "Ready for editorial review"}
    )
    assert t1.status_code == 200
    assert t1.json()["draft"]["review_status"] == "In Review"

    # 3. Valid transition: In Review -> Changes Requested
    t2 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Changes Requested", "reviewer_name": "Editor", "notes": "Please verify quotes"}
    )
    assert t2.status_code == 200
    assert t2.json()["draft"]["review_status"] == "Changes Requested"

    # 4. Valid transition: Changes Requested -> In Review
    t3 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Writer", "notes": "Quotes verified"}
    )
    assert t3.status_code == 200
    assert t3.json()["draft"]["review_status"] == "In Review"

    # 5. Valid transition: In Review -> Approved
    t4 = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Compliance Officer", "notes": "All checks passed"}
    )
    assert t4.status_code == 200
    assert t4.json()["draft"]["review_status"] == "Approved"

    # 6. Check history trail
    history = client.get(f"/api/drafts/{draft_id}/review-history").json()
    assert len(history) >= 4
    assert history[-1]["to_status"] == "Approved"
    assert history[-1]["changed_by"] == "Compliance Officer"

def test_prevent_approval_with_unresolved_critical_finding():
    brands = client.get("/api/brands").json()
    brand_id = brands[0]["id"]

    # Draft with critical finding
    critical_draft = client.post("/api/drafts", json={
        "brand_id": brand_id,
        "title": "Risky Draft",
        "channel": "Ad",
        "author": "Marketer",
        "original_text": "This software is completely risk-free and CloudMesh is active."
    }).json()
    draft_id = critical_draft["id"]

    # Analyze to trigger critical finding
    client.post(f"/api/drafts/{draft_id}/analyze?run_ai=false")

    # Transition to In Review
    client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "In Review", "reviewer_name": "Editor"}
    )

    # Attempt to Approve while critical finding is still open
    approve_attempt = client.post(
        f"/api/drafts/{draft_id}/review-transition",
        json={"to_status": "Approved", "reviewer_name": "Manager"}
    )
    assert approve_attempt.status_code == 400
    assert "unresolved critical finding" in approve_attempt.json()["detail"].lower()
