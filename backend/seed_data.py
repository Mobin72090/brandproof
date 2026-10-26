from backend.crud import (
    create_brand_profile,
    create_brand_rule,
    create_brand_fact,
    create_content_draft,
    list_brand_profiles
)
from backend.models import (
    BrandProfileCreate,
    BrandRuleCreate,
    BrandFactCreate,
    ContentDraftCreate
)

def seed_demo_data_if_empty():
    existing = list_brand_profiles()
    if existing:
        return existing[0]["id"]

    # 1. Create Demo Brand Profile: "AetherCloud"
    profile_data = BrandProfileCreate(
        name="AetherCloud",
        tagline="Autonomous, provable enterprise cloud security.",
        description="AetherCloud provides zero-trust governance and infrastructure orchestration for enterprise engineering teams.",
        industry="Enterprise Cloud Infrastructure & Cybersecurity",
        tone_attributes=["Authoritative", "Technically Precise", "Direct", "Humble & Transparent"]
    )
    profile = create_brand_profile(profile_data)
    brand_id = profile["id"]

    # 2. Approved Brand Rules
    rules = [
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Brand Casing: AetherCloud",
            description="Always spell AetherCloud with camel case 'AetherCloud'. Never use 'Aethercloud', 'aethercloud', or 'Aether Cloud'.",
            pattern_or_term="Aethercloud",
            preferred_term="AetherCloud",
            severity="high",
            rationale="Consistent capitalization builds recognized enterprise brand equity."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Brand Casing: BrandProof",
            description="The governance suite is named 'BrandProof' (intercapped P). Do not spell as 'Brandproof' or 'brand proof'.",
            pattern_or_term="Brandproof",
            preferred_term="BrandProof",
            severity="high",
            rationale="Protects trademark and official product naming integrity."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="terminology",
            category="Terminology",
            title="Deprecated Product Name: Legacy CloudMesh",
            description="'CloudMesh' is our decommissioned 2022 product. Use 'AetherMesh Fabric' for current architecture.",
            pattern_or_term="CloudMesh",
            preferred_term="AetherMesh Fabric",
            severity="critical",
            rationale="CloudMesh has been officially retired; customer contracts now reference AetherMesh Fabric."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="No Absolute Uptime Guarantees",
            description="Never claim '100% guaranteed zero downtime' or 'unbreakable reliability'. All SLAs have maintenance windows.",
            pattern_or_term="100% guaranteed zero downtime",
            preferred_term="industry-leading 99.95% financially-backed SLA",
            severity="critical",
            rationale="Legal and SLA commitments: No cloud system can guarantee absolute 100% perpetual uptime."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="Prohibited Superlative: 'Cheapest in the world'",
            description="AetherCloud does not compete on bottom-tier pricing. Prohibit unverified price superiority claims.",
            pattern_or_term="cheapest in the world",
            preferred_term="most cost-effective enterprise TCO",
            severity="high",
            rationale="Positions brand as cheap rather than enterprise-tier premium value."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="prohibited_claim",
            category="Claims & Compliance",
            title="Prohibited Safety Claim: 'Completely risk-free'",
            description="Compliance disallows claiming cybersecurity software is 'completely risk-free' or '100% unhackable'.",
            pattern_or_term="completely risk-free",
            preferred_term="architected with defence-in-depth risk mitigation",
            severity="critical",
            rationale="Regulatory compliance prevents unverified absolute security claims."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="voice",
            category="Tone & Style",
            title="Ban Empty Buzzwords: 'Synergy'",
            description="Avoid empty corporate buzzwords like 'synergy' or 'synergistic'. Speak directly about architectural integration.",
            pattern_or_term="synergy",
            preferred_term="seamless interoperability",
            severity="low",
            rationale="Enterprise engineers value technical clarity over empty corporate rhetoric."
        ),
        BrandRuleCreate(
            brand_id=brand_id,
            rule_type="voice",
            category="Tone & Style",
            title="Avoid Cliché: 'Game-changer'",
            description="Replace hyperbolic marketing tropes like 'game-changer' with concrete performance metrics.",
            pattern_or_term="game-changer",
            preferred_term="high-impact architectural leap",
            severity="medium",
            rationale="Brand tone must remain humble, authoritative, and fact-focused."
        ),
    ]
    for r in rules:
        create_brand_rule(r)

    # 3. Approved Brand Facts
    facts = [
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="founded_year",
            fact_statement="AetherCloud was founded in 2021 by a team of distributed systems engineers.",
            verified_value="2021",
            evidence_source="Delaware Certificate of Incorporation #639201"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="sla_uptime",
            fact_statement="Official enterprise uptime commitment under Master Services Agreement is 99.95%.",
            verified_value="99.95%",
            evidence_source="AetherCloud Master Services Agreement SLA Addendum v4"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="encryption_standard",
            fact_statement="All data at rest and in transit is encrypted using AES-256-GCM and TLS 1.3.",
            verified_value="AES-256-GCM",
            evidence_source="SOC-2 Type II Audit Report & ISO 27001 Certification"
        ),
        BrandFactCreate(
            brand_id=brand_id,
            fact_key="headquarters",
            fact_statement="AetherCloud global headquarters is located in Austin, Texas.",
            verified_value="Austin, Texas",
            evidence_source="Official Corporate Registry 2024"
        )
    ]
    for f in facts:
        create_brand_fact(f)

    # 4. Create Sample Marketing Draft with Seeded Violations
    sample_draft = ContentDraftCreate(
        brand_id=brand_id,
        title="Q4 Product Launch Announcement & Whitepaper Summary",
        channel="Press Release & Blog",
        author="Sarah Lin (Product Marketing Lead)",
        original_text="""We are thrilled to unveil our latest security innovation! Since Aethercloud was founded in 2018, our mission has been to disrupt the industry with revolutionary technology.

Our new CloudMesh orchestration engine provides 100% guaranteed zero downtime for mission-critical Kubernetes workloads. Unlike competitors, our platform is completely risk-free and the cheapest in the world.

With military-grade 128-bit encryption, your data is completely protected. This release represents tremendous synergy across our infrastructure stack, and our engineers are confident that this release is a true game-changer for DevOps teams worldwide."""
    )
    create_content_draft(sample_draft)

    return brand_id
