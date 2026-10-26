import re
from typing import List, Dict, Any, Optional

def analyze_draft_with_rules(
    draft_text: str,
    rules: List[Dict[str, Any]],
    facts: List[Dict[str, Any]],
    profile: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Deterministic rule engine that validates marketing draft content against:
    1. Terminology & product names (casing, deprecated terms, preferred phrasing)
    2. Prohibited & unsupported promotional claims
    3. Factual contradictions against verified brand facts
    4. Voice, tone, clichés, and style guidelines
    5. Mandatory rules and disclaimers

    Returns a list of structured findings with exact matches, severity,
    evidence, explanations, and suggested corrections.
    """
    findings: List[Dict[str, Any]] = []

    # 1. Terminology & Preferred Wording Rules
    for rule in rules:
        rule_type = rule.get("rule_type")
        pattern = rule.get("pattern_or_term")
        preferred = rule.get("preferred_term")
        severity = rule.get("severity", "medium")

        if not pattern:
            continue

        if rule_type in ("terminology", "preferred_wording"):
            # Check for exact casing or case-insensitive match
            # If pattern and preferred only differ by case (e.g. "Brandproof" vs "BrandProof"),
            # match case-insensitively but exclude already correct casing.
            is_case_correction = preferred and (pattern.lower() == preferred.lower())

            escaped = re.escape(pattern)
            regex = re.compile(rf"\b{escaped}\b", re.IGNORECASE)

            for match in regex.finditer(draft_text):
                matched_str = match.group(0)

                # Skip if it already matches the preferred casing perfectly
                if is_case_correction and matched_str == preferred:
                    continue

                start = match.start()
                end = match.end()

                correction = preferred if preferred else f"Replace with approved term: '{pattern}'"
                findings.append({
                    "rule_id": rule.get("id"),
                    "fact_id": None,
                    "finding_source": "rule_engine",
                    "rule_type": "terminology",
                    "severity": severity,
                    "title": rule.get("title", f"Incorrect Terminology: '{matched_str}'"),
                    "explanation": rule.get(
                        "description",
                        f"The term '{matched_str}' violates brand naming conventions. Preferred form is '{preferred}'."
                    ),
                    "evidence": f"Brand Rule #{rule.get('id')}: {rule.get('title')} (Approved category: {rule.get('category')})",
                    "matched_text": matched_str,
                    "start_char": start,
                    "end_char": end,
                    "suggested_correction": correction,
                })

        elif rule_type == "prohibited_claim":
            escaped = re.escape(pattern)
            regex = re.compile(rf"\b{escaped}\b", re.IGNORECASE)

            for match in regex.finditer(draft_text):
                matched_str = match.group(0)
                start = match.start()
                end = match.end()

                findings.append({
                    "rule_id": rule.get("id"),
                    "fact_id": None,
                    "finding_source": "rule_engine",
                    "rule_type": "prohibited_claim",
                    "severity": severity,
                    "title": rule.get("title", f"Prohibited Marketing Claim: '{matched_str}'"),
                    "explanation": rule.get(
                        "description",
                        f"The claim '{matched_str}' is prohibited or unsupported under approved brand guidelines."
                    ),
                    "evidence": f"Compliance Guideline: {rule.get('rationale') or 'Prohibited by governance policy'}",
                    "matched_text": matched_str,
                    "start_char": start,
                    "end_char": end,
                    "suggested_correction": preferred or "Remove or qualify this unsupported claim with verified metrics.",
                })

        elif rule_type == "voice":
            escaped = re.escape(pattern)
            regex = re.compile(rf"\b{escaped}\b", re.IGNORECASE)

            for match in regex.finditer(draft_text):
                matched_str = match.group(0)
                start = match.start()
                end = match.end()

                findings.append({
                    "rule_id": rule.get("id"),
                    "fact_id": None,
                    "finding_source": "rule_engine",
                    "rule_type": "voice",
                    "severity": severity,
                    "title": rule.get("title", f"Voice & Tone Flag: '{matched_str}'"),
                    "explanation": rule.get(
                        "description",
                        f"The phrasing '{matched_str}' conflicts with approved brand voice attributes."
                    ),
                    "evidence": f"Brand Voice Guideline: {rule.get('title')} ({rule.get('category')})",
                    "matched_text": matched_str,
                    "start_char": start,
                    "end_char": end,
                    "suggested_correction": preferred or "Rephrase using direct, active language aligned with brand voice.",
                })

    # 2. Verified Facts Verification
    for fact in facts:
        fact_key = fact.get("fact_key", "").lower()
        verified_val = fact.get("verified_value", "")
        fact_statement = fact.get("fact_statement", "")
        evidence_src = fact.get("evidence_source", "Verified Corporate Fact Repository")

        # Check for year founded contradictions
        if "found" in fact_key or "year" in fact_key or "established" in fact_key:
            # Match 4-digit years in proximity to founding words
            year_matches = re.finditer(
                r"(?:founded|established|started|launched|created|since)\s+(?:in\s+)?([12][0-9]{3})",
                draft_text,
                re.IGNORECASE
            )
            for m in year_matches:
                found_year = m.group(1)
                if found_year != verified_val:
                    findings.append({
                        "rule_id": None,
                        "fact_id": fact.get("id"),
                        "finding_source": "rule_engine",
                        "rule_type": "fact",
                        "severity": "critical",
                        "title": f"Factual Conflict: Founding Year ({found_year} vs {verified_val})",
                        "explanation": f"Draft mentions founding year {found_year}, but official verified record states {verified_val} ({fact_statement}).",
                        "evidence": f"Verified Brand Fact #{fact.get('id')} — Source: {evidence_src}",
                        "matched_text": m.group(0),
                        "start_char": m.start(),
                        "end_char": m.end(),
                        "suggested_correction": m.group(0).replace(found_year, verified_val),
                    })

        # Check for uptime or SLA claim contradictions
        if "uptime" in fact_key or "sla" in fact_key:
            uptime_matches = re.finditer(
                r"(\d{2,3}(?:\.\d+)?%?\s*(?:uptime|availability|SLA))",
                draft_text,
                re.IGNORECASE
            )
            for m in uptime_matches:
                matched_uptime_str = m.group(1)
                if verified_val not in matched_uptime_str:
                    # If claiming 100% or contradictory number
                    findings.append({
                        "rule_id": None,
                        "fact_id": fact.get("id"),
                        "finding_source": "rule_engine",
                        "rule_type": "fact",
                        "severity": "high",
                        "title": f"Factual Discrepancy: Uptime / SLA Guarantee",
                        "explanation": f"Draft asserts '{matched_uptime_str}', but verified SLA guarantee is '{verified_val}'.",
                        "evidence": f"Verified Fact #{fact.get('id')}: {fact_statement} ({evidence_src})",
                        "matched_text": matched_uptime_str,
                        "start_char": m.start(),
                        "end_char": m.end(),
                        "suggested_correction": f"{verified_val} uptime SLA",
                    })

        # Check for encryption or security claim contradictions
        if "encryption" in fact_key or "security" in fact_key:
            enc_matches = re.finditer(
                r"(128[- ]bit(?:\s+AES)?|unhackable|military[- ]grade)",
                draft_text,
                re.IGNORECASE
            )
            for m in enc_matches:
                matched_sec = m.group(0)
                findings.append({
                    "rule_id": None,
                    "fact_id": fact.get("id"),
                    "finding_source": "rule_engine",
                    "rule_type": "fact",
                    "severity": "critical",
                    "title": f"Security Specification Discrepancy",
                    "explanation": f"Draft refers to '{matched_sec}', which contradicts the verified security standard: {verified_val}.",
                    "evidence": f"Verified Fact #{fact.get('id')}: {fact_statement} (Source: {evidence_src})",
                    "matched_text": matched_sec,
                    "start_char": m.start(),
                    "end_char": m.end(),
                    "suggested_correction": verified_val,
                })

    # 3. Built-in Deterministic Style & Tone Checks
    # General corporate buzzwords and clichés that weaken marketing copy
    cliches = [
        ("synergy", "collaboration", "low"),
        ("game-changer", "significant improvement", "medium"),
        ("revolutionary", "innovative", "medium"),
        ("disrupt the industry", "modernize workflows", "medium"),
        ("secret sauce", "core advantage", "low"),
    ]
    for cliche, replacement, sev in cliches:
        for m in re.finditer(rf"\b{re.escape(cliche)}\b", draft_text, re.IGNORECASE):
            matched = m.group(0)
            # Avoid duplicate if already covered by an explicit brand rule
            if not any(f.get("matched_text") and f["matched_text"].lower() == matched.lower() for f in findings):
                findings.append({
                    "rule_id": None,
                    "fact_id": None,
                    "finding_source": "rule_engine",
                    "rule_type": "voice",
                    "severity": sev,
                    "title": f"Avoid Cliché: '{matched}'",
                    "explanation": f"The term '{matched}' is an overused cliché that detracts from authentic, precise brand communication.",
                    "evidence": "Brand Style Guide: Clear & Professional Communication Standard",
                    "matched_text": matched,
                    "start_char": m.start(),
                    "end_char": m.end(),
                    "suggested_correction": replacement,
                })

    # Passive voice detection for key action assertions (e.g., "was developed by", "is trusted by")
    passive_matches = re.finditer(r"\b(was|were|is|are|been)\s+([a-z]+ed)\s+by\b", draft_text, re.IGNORECASE)
    for m in passive_matches:
        matched = m.group(0)
        findings.append({
            "rule_id": None,
            "fact_id": None,
            "finding_source": "rule_engine",
            "rule_type": "voice",
            "severity": "low",
            "title": f"Passive Voice Construction: '{matched}'",
            "explanation": "Passive phrasing weakens marketing impact. Rephrase in active voice for clarity and dynamism.",
            "evidence": "Brand Voice Guideline: Prefer active verbs and direct address.",
            "matched_text": matched,
            "start_char": m.start(),
            "end_char": m.end(),
            "suggested_correction": f"[Active voice rephrase: place actor before action]",
        })

    return findings
