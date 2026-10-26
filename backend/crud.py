import json
from typing import Optional, List, Dict, Any, Tuple
import sqlite3
from backend.database import get_db_connection
from backend.models import (
    BrandProfileCreate,
    BrandRuleCreate,
    BrandFactCreate,
    ContentDraftCreate,
    ReviewStatusType,
)

# ----------------- BRAND PROFILES -----------------

def create_brand_profile(profile: BrandProfileCreate) -> Dict[str, Any]:
    profile_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        tone_json = json.dumps(profile.tone_attributes or [])
        cursor.execute(
            """
            INSERT INTO brand_profiles (name, tagline, description, industry, tone_attributes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (profile.name, profile.tagline, profile.description, profile.industry, tone_json)
        )
        profile_id = cursor.lastrowid
    return get_brand_profile(profile_id)

def get_brand_profile(profile_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_profiles WHERE id = ?", (profile_id,))
        row = cursor.fetchone()
        if not row:
            return None
        data = dict(row)
        data["tone_attributes"] = json.loads(data["tone_attributes"]) if data.get("tone_attributes") else []
        return data

def list_brand_profiles() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_profiles ORDER BY name ASC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["tone_attributes"] = json.loads(d["tone_attributes"]) if d.get("tone_attributes") else []
            result.append(d)
        return result

# ----------------- BRAND RULES -----------------

def create_brand_rule(rule: BrandRuleCreate) -> Dict[str, Any]:
    rule_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO brand_rules (
                brand_id, rule_type, category, title, description,
                pattern_or_term, preferred_term, severity, rationale
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                rule.brand_id, rule.rule_type, rule.category, rule.title, rule.description,
                rule.pattern_or_term, rule.preferred_term, rule.severity, rule.rationale
            )
        )
        rule_id = cursor.lastrowid
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_rules WHERE id = ?", (rule_id,))
        return dict(cursor.fetchone())

def list_brand_rules(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_rules WHERE brand_id = ? ORDER BY severity DESC, id ASC", (brand_id,))
        return [dict(r) for r in cursor.fetchall()]

def delete_brand_rule(rule_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM brand_rules WHERE id = ?", (rule_id,))
        return cursor.rowcount > 0

# ----------------- BRAND FACTS -----------------

def create_brand_fact(fact: BrandFactCreate) -> Dict[str, Any]:
    fact_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO brand_facts (brand_id, fact_key, fact_statement, verified_value, evidence_source)
            VALUES (?, ?, ?, ?, ?)
            """,
            (fact.brand_id, fact.fact_key, fact.fact_statement, fact.verified_value, fact.evidence_source)
        )
        fact_id = cursor.lastrowid
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_facts WHERE id = ?", (fact_id,))
        return dict(cursor.fetchone())

def list_brand_facts(brand_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM brand_facts WHERE brand_id = ? ORDER BY id ASC", (brand_id,))
        return [dict(r) for r in cursor.fetchall()]

def delete_brand_fact(fact_id: int) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM brand_facts WHERE id = ?", (fact_id,))
        return cursor.rowcount > 0

# ----------------- CONTENT DRAFTS -----------------

def create_content_draft(draft: ContentDraftCreate) -> Dict[str, Any]:
    draft_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO content_drafts (
                brand_id, title, channel, author, original_text, current_text, review_status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Draft')
            """,
            (
                draft.brand_id, draft.title, draft.channel, draft.author,
                draft.original_text, draft.original_text
            )
        )
        draft_id = cursor.lastrowid
        cursor.execute(
            """
            INSERT INTO review_history (draft_id, from_status, to_status, changed_by, notes)
            VALUES (?, 'None', 'Draft', ?, 'Initial content draft created')
            """,
            (draft_id, draft.author)
        )
    return get_content_draft(draft_id)

def get_content_draft(draft_id: int) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM content_drafts WHERE id = ?", (draft_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def list_content_drafts(brand_id: Optional[int] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if brand_id:
            cursor.execute("SELECT * FROM content_drafts WHERE brand_id = ? ORDER BY id DESC", (brand_id,))
        else:
            cursor.execute("SELECT * FROM content_drafts ORDER BY id DESC")
        return [dict(r) for r in cursor.fetchall()]

def update_draft_text(draft_id: int, new_text: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE content_drafts
            SET current_text = ?, reviewer_notes = COALESCE(?, reviewer_notes), updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (new_text, notes, draft_id)
        )
    return get_content_draft(draft_id)

# ----------------- REVIEW WORKFLOW -----------------

VALID_TRANSITIONS = {
    "Draft": ["In Review"],
    "In Review": ["Changes Requested", "Approved", "Rejected", "Draft"],
    "Changes Requested": ["Draft", "In Review"],
    "Rejected": ["Draft"],
    "Approved": ["Draft"],  # allow reopening if edits are necessary
}

def transition_review_status(
    draft_id: int,
    to_status: ReviewStatusType,
    reviewer_name: str,
    notes: Optional[str] = None
) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    draft = get_content_draft(draft_id)
    if not draft:
        return False, f"Draft with ID {draft_id} not found", None

    current_status = draft["review_status"]

    if current_status == to_status:
        return False, f"Draft is already in status '{to_status}'", draft

    allowed = VALID_TRANSITIONS.get(current_status, [])
    if to_status not in allowed:
        return (
            False,
            f"Invalid transition from '{current_status}' to '{to_status}'. Allowed transitions: {', '.join(allowed) or 'None'}",
            draft
        )

    # Check for approval guards:
    if to_status == "Approved":
        open_criticals = get_open_findings_by_severity(draft_id, ["critical"])
        if open_criticals:
            count = len(open_criticals)
            return (
                False,
                f"Cannot approve draft: There {'is' if count == 1 else 'are'} {count} unresolved critical finding(s). Please review and resolve them before final approval.",
                draft
            )

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE content_drafts
            SET review_status = ?, reviewer_notes = COALESCE(?, reviewer_notes), updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (to_status, notes, draft_id)
        )
        cursor.execute(
            """
            INSERT INTO review_history (draft_id, from_status, to_status, changed_by, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (draft_id, current_status, to_status, reviewer_name, notes)
        )

    updated_draft = get_content_draft(draft_id)
    return True, f"Successfully changed status to '{to_status}'", updated_draft

def get_review_history(draft_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM review_history WHERE draft_id = ? ORDER BY id ASC", (draft_id,))
        return [dict(r) for r in cursor.fetchall()]

# ----------------- ANALYSIS FINDINGS -----------------

def clear_open_findings(draft_id: int):
    """Clears previous findings for a draft when re-analyzing."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analysis_findings WHERE draft_id = ?", (draft_id,))

def save_findings(draft_id: int, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for f in findings:
            cursor.execute(
                """
                INSERT INTO analysis_findings (
                    draft_id, rule_id, fact_id, finding_source, rule_type,
                    severity, title, explanation, evidence, matched_text,
                    start_char, end_char, suggested_correction, status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
                """,
                (
                    draft_id,
                    f.get("rule_id"),
                    f.get("fact_id"),
                    f.get("finding_source", "rule_engine"),
                    f.get("rule_type", "rule"),
                    f.get("severity", "medium"),
                    f.get("title", ""),
                    f.get("explanation", ""),
                    f.get("evidence", ""),
                    f.get("matched_text"),
                    f.get("start_char"),
                    f.get("end_char"),
                    f.get("suggested_correction"),
                )
            )
    return get_draft_findings(draft_id)

def get_draft_findings(draft_id: int) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM analysis_findings
            WHERE draft_id = ?
            ORDER BY
                CASE severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END,
                id ASC
            """,
            (draft_id,)
        )
        return [dict(r) for r in cursor.fetchall()]

def get_open_findings_by_severity(draft_id: int, severities: List[str]) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in severities)
        cursor.execute(
            f"""
            SELECT * FROM analysis_findings
            WHERE draft_id = ? AND status = 'open' AND severity IN ({placeholders})
            """,
            (draft_id, *severities)
        )
        return [dict(r) for r in cursor.fetchall()]

def apply_finding_action(
    finding_id: int,
    action: str,  # "accept", "reject", "edit"
    custom_correction: Optional[str] = None
) -> Tuple[bool, str, Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM analysis_findings WHERE id = ?", (finding_id,))
        finding_row = cursor.fetchone()
        if not finding_row:
            return False, f"Finding {finding_id} not found", None, None

        finding = dict(finding_row)
        draft_id = finding["draft_id"]
        cursor.execute("SELECT * FROM content_drafts WHERE id = ?", (draft_id,))
        draft_row = cursor.fetchone()
        if not draft_row:
            return False, f"Draft {draft_id} not found", None, None

        draft = dict(draft_row)
        current_text = draft["current_text"]

        applied_text = None
        new_status = finding["status"]

        if action == "reject":
            new_status = "rejected"
            cursor.execute(
                "UPDATE analysis_findings SET status = ? WHERE id = ?",
                (new_status, finding_id)
            )
            finding["status"] = new_status
            return True, "Finding rejected by reviewer", finding, draft

        elif action == "accept":
            new_status = "accepted"
            correction = finding.get("suggested_correction")
            matched = finding.get("matched_text")
            if not correction or not matched:
                return False, "Finding does not have a valid matched text and suggested correction", None, None

            if matched in current_text:
                updated_text = current_text.replace(matched, correction, 1)
                cursor.execute(
                    "UPDATE content_drafts SET current_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (updated_text, draft_id)
                )
                draft["current_text"] = updated_text
                applied_text = correction
            else:
                return False, f"The original text segment '{matched}' was not found in the current draft. It may have already been modified.", None, None

        elif action == "edit":
            new_status = "edited"
            if not custom_correction:
                return False, "Custom correction text is required for 'edit' action", None, None
            matched = finding.get("matched_text")
            if matched and matched in current_text:
                updated_text = current_text.replace(matched, custom_correction, 1)
                cursor.execute(
                    "UPDATE content_drafts SET current_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (updated_text, draft_id)
                )
                draft["current_text"] = updated_text
                applied_text = custom_correction
            else:
                return False, f"The original text segment '{matched}' was not found in the current draft.", None, None

        cursor.execute(
            "UPDATE analysis_findings SET status = ?, user_applied_text = ? WHERE id = ?",
            (new_status, applied_text, finding_id)
        )
        finding["status"] = new_status
        finding["user_applied_text"] = applied_text

        return True, f"Correction successfully {new_status}ed into draft content", finding, draft
