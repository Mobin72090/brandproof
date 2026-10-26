import sqlite3
import os
from pathlib import Path
from contextlib import contextmanager
from backend.config import settings

def get_db_path() -> str:
    db_env = os.getenv("DATABASE_PATH", settings.database_path)
    path = Path(db_env)
    if not path.is_absolute():
        path = Path(__file__).resolve().parent.parent / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return str(path)

@contextmanager
def get_db_connection():
    db_path = get_db_path()
    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Brand Profiles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                tagline TEXT,
                description TEXT,
                industry TEXT,
                tone_attributes TEXT, -- JSON array of strings
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Brand Rules
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                rule_type TEXT NOT NULL, -- 'terminology', 'voice', 'prohibited_claim', 'mandatory_rule', 'preferred_wording'
                category TEXT NOT NULL,  -- 'Terminology', 'Tone & Style', 'Claims & Compliance', 'Legal'
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                pattern_or_term TEXT,    -- Term/phrase/regex to flag
                preferred_term TEXT,     -- Preferred wording/replacement
                severity TEXT NOT NULL,  -- 'critical', 'high', 'medium', 'low'
                rationale TEXT,          -- Why the rule matters
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 3. Brand Verified Facts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                fact_key TEXT NOT NULL,
                fact_statement TEXT NOT NULL,
                verified_value TEXT NOT NULL,
                evidence_source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 4. Content Drafts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_drafts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                channel TEXT DEFAULT 'General',
                author TEXT NOT NULL,
                original_text TEXT NOT NULL,
                current_text TEXT NOT NULL,
                review_status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'In Review', 'Changes Requested', 'Approved', 'Rejected'
                reviewer_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (brand_id) REFERENCES brand_profiles(id) ON DELETE CASCADE
            );
        """)

        # 5. Analysis Findings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_findings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draft_id INTEGER NOT NULL,
                rule_id INTEGER,
                fact_id INTEGER,
                finding_source TEXT NOT NULL, -- 'rule_engine' or 'ai_assisted'
                rule_type TEXT NOT NULL,
                severity TEXT NOT NULL,       -- 'critical', 'high', 'medium', 'low'
                title TEXT NOT NULL,
                explanation TEXT NOT NULL,
                evidence TEXT NOT NULL,
                matched_text TEXT,
                start_char INTEGER,
                end_char INTEGER,
                suggested_correction TEXT,
                status TEXT NOT NULL DEFAULT 'open', -- 'open', 'accepted', 'rejected', 'edited'
                user_applied_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (draft_id) REFERENCES content_drafts(id) ON DELETE CASCADE,
                FOREIGN KEY (rule_id) REFERENCES brand_rules(id) ON DELETE SET NULL,
                FOREIGN KEY (fact_id) REFERENCES brand_facts(id) ON DELETE SET NULL
            );
        """)

        # 6. Review Status History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                draft_id INTEGER NOT NULL,
                from_status TEXT NOT NULL,
                to_status TEXT NOT NULL,
                changed_by TEXT NOT NULL,
                notes TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (draft_id) REFERENCES content_drafts(id) ON DELETE CASCADE
            );
        """)
