import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import httpx
from backend.config import settings

logger = logging.getLogger("brandproof.ai_engine")

async def analyze_draft_with_gemini(
    draft_text: str,
    rules: List[Dict[str, Any]],
    facts: List[Dict[str, Any]],
    profile: Optional[Dict[str, Any]] = None
) -> Tuple[List[Dict[str, Any]], bool, str]:
    """
    Calls Google Gemini API to identify nuanced brand governance, tone,
    subtle unsupported claims, and style issues not caught by exact regex rules.

    Returns:
        (ai_findings, ai_used, status_message)
    """
    if not settings.gemini_api_key:
        return (
            [],
            False,
            "AI analysis skipped: GEMINI_API_KEY is not configured. Running in 100% deterministic rule-based mode."
        )

    # Format brand rules & facts for context
    profile_name = profile.get("name", "The Brand") if profile else "The Brand"
    tone_attrs = ", ".join(profile.get("tone_attributes", [])) if profile else "Professional, Clear"

    rules_summary = "\n".join([
        f"- [{r.get('rule_type').upper()}] {r.get('title')}: {r.get('description')} (Severity: {r.get('severity')})"
        for r in rules
    ]) or "No custom rules defined."

    facts_summary = "\n".join([
        f"- Fact: {f.get('fact_statement')} (Verified Value: {f.get('verified_value')}, Source: {f.get('evidence_source')})"
        for f in facts
    ]) or "No custom facts defined."

    system_instruction = (
        f"You are the BrandProof Governance AI Auditor for {profile_name}. "
        f"Approved Brand Tone: {tone_attrs}. "
        "Review the draft content against the brand guidelines, voice rules, verified facts, and marketing claims policies. "
        "Only flag issues that represent genuine brand inconsistencies, unsupported claims, or voice deviations. "
        "Preserve the author's original meaning and style when suggesting corrections. "
        "You MUST respond ONLY with a valid JSON array of objects. Do not include markdown code block syntax (like ```json). "
        "Each object must have these exact keys:\n"
        "- title (string, concise issue title)\n"
        "- rule_type (string, one of: 'voice', 'prohibited_claim', 'terminology', 'fact')\n"
        "- severity (string, one of: 'critical', 'high', 'medium', 'low')\n"
        "- explanation (string, why this is an issue)\n"
        "- evidence (string, cite specific guideline or factual basis)\n"
        "- matched_text (exact substring from the draft content to highlight)\n"
        "- suggested_correction (concrete replacement wording preserving author intent)"
    )

    user_prompt = f"""
Approved Brand Rules:
{rules_summary}

Approved Brand Facts:
{facts_summary}

Marketing Draft Content to Review:
\"\"\"{draft_text}\"\"\"

Generate JSON array of governance findings:
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_instruction}\n\n{user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                logger.warning(f"Gemini API returned HTTP {response.status_code}: {response.text}")
                return (
                    [],
                    False,
                    f"Gemini API call failed with HTTP {response.status_code}. Rule-based checks succeeded."
                )

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                return ([], False, "Gemini returned empty response candidate list.")

            content_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()

            # Clean any wrapping markdown code fences if present
            if content_text.startswith("```json"):
                content_text = content_text[7:]
            if content_text.startswith("```"):
                content_text = content_text[3:]
            if content_text.endswith("```"):
                content_text = content_text[:-3]
            content_text = content_text.strip()

            parsed_data = json.loads(content_text)
            if not isinstance(parsed_data, list):
                return ([], False, "AI response was not formatted as a valid list.")

            validated_findings: List[Dict[str, Any]] = []
            for item in parsed_data:
                matched_str = str(item.get("matched_text", "")).strip()
                if not matched_str:
                    continue

                start = draft_text.find(matched_str)
                end = start + len(matched_str) if start != -1 else None

                sev = str(item.get("severity", "medium")).lower()
                if sev not in ("critical", "high", "medium", "low"):
                    sev = "medium"

                validated_findings.append({
                    "rule_id": None,
                    "fact_id": None,
                    "finding_source": "ai_assisted",
                    "rule_type": str(item.get("rule_type", "voice")),
                    "severity": sev,
                    "title": str(item.get("title", "AI Brand Governance Suggestion")),
                    "explanation": str(item.get("explanation", "")),
                    "evidence": str(item.get("evidence", "Gemini Brand Governance Model Analysis")),
                    "matched_text": matched_str,
                    "start_char": start if start != -1 else None,
                    "end_char": end if start != -1 else None,
                    "suggested_correction": str(item.get("suggested_correction", "")),
                })

            return (
                validated_findings,
                True,
                f"Successfully completed AI analysis using {settings.gemini_model} ({len(validated_findings)} AI finding(s) generated)."
            )

    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse Gemini JSON output: {e}")
        return ([], False, f"Failed to parse Gemini response as JSON: {str(e)}")
    except httpx.RequestError as e:
        logger.warning(f"Network error calling Gemini: {e}")
        return ([], False, f"Network error contacting Gemini AI service: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during AI analysis: {e}")
        return ([], False, f"Unexpected error during AI analysis: {str(e)}")
