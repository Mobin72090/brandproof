from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime

ReviewStatusType = Literal["Draft", "In Review", "Changes Requested", "Approved", "Rejected"]
SeverityType = Literal["critical", "high", "medium", "low"]
RuleType = Literal["terminology", "voice", "prohibited_claim", "mandatory_rule", "preferred_wording", "fact"]
FindingSourceType = Literal["rule_engine", "ai_assisted"]
FindingStatusType = Literal["open", "accepted", "rejected", "edited"]

# --- Brand Profile Models ---
class BrandProfileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    tagline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    tone_attributes: List[str] = Field(default_factory=list)

class BrandProfileCreate(BrandProfileBase):
    pass

class BrandProfileResponse(BrandProfileBase):
    id: int
    created_at: str
    updated_at: str

# --- Brand Rule Models ---
class BrandRuleBase(BaseModel):
    rule_type: RuleType
    category: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=150)
    description: str = Field(..., min_length=1)
    pattern_or_term: Optional[str] = None
    preferred_term: Optional[str] = None
    severity: SeverityType = "medium"
    rationale: Optional[str] = None

class BrandRuleCreate(BrandRuleBase):
    brand_id: int

class BrandRuleResponse(BrandRuleBase):
    id: int
    brand_id: int
    created_at: str

# --- Brand Fact Models ---
class BrandFactBase(BaseModel):
    fact_key: str = Field(..., min_length=1, max_length=100)
    fact_statement: str = Field(..., min_length=1)
    verified_value: str = Field(..., min_length=1)
    evidence_source: Optional[str] = None

class BrandFactCreate(BrandFactBase):
    brand_id: int

class BrandFactResponse(BrandFactBase):
    id: int
    brand_id: int
    created_at: str

# --- Content Draft Models ---
class ContentDraftCreate(BaseModel):
    brand_id: int
    title: str = Field(..., min_length=1, max_length=200)
    channel: str = Field("Blog Post", max_length=100)
    author: str = Field(..., min_length=1, max_length=100)
    original_text: str = Field(..., min_length=1)

class ContentDraftUpdateText(BaseModel):
    current_text: str = Field(..., min_length=1)
    editor_notes: Optional[str] = None

class ContentDraftResponse(BaseModel):
    id: int
    brand_id: int
    title: str
    channel: str
    author: str
    original_text: str
    current_text: str
    review_status: ReviewStatusType
    reviewer_notes: Optional[str] = None
    created_at: str
    updated_at: str

# --- Analysis Finding Models ---
class AnalysisFindingResponse(BaseModel):
    id: int
    draft_id: int
    rule_id: Optional[int] = None
    fact_id: Optional[int] = None
    finding_source: FindingSourceType
    rule_type: str
    severity: SeverityType
    title: str
    explanation: str
    evidence: str
    matched_text: Optional[str] = None
    start_char: Optional[int] = None
    end_char: Optional[int] = None
    suggested_correction: Optional[str] = None
    status: FindingStatusType
    user_applied_text: Optional[str] = None
    created_at: str

class ApplyCorrectionRequest(BaseModel):
    action: Literal["accept", "reject", "edit"]
    custom_correction: Optional[str] = None  # Used if action is 'edit'

# --- Review Workflow Models ---
class ReviewTransitionRequest(BaseModel):
    to_status: ReviewStatusType
    reviewer_name: str = Field(..., min_length=1, max_length=100)
    notes: Optional[str] = None

class ReviewHistoryResponse(BaseModel):
    id: int
    draft_id: int
    from_status: str
    to_status: str
    changed_by: str
    notes: Optional[str] = None
    timestamp: str

# --- Analysis Run Response ---
class AnalysisRunResponse(BaseModel):
    draft_id: int
    total_findings: int
    findings: List[AnalysisFindingResponse]
    rules_checked: int
    facts_checked: int
    ai_assisted_used: bool
    ai_status_message: Optional[str] = None
