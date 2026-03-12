// ============================================================
// INDUSTRY SKILLS TAXONOMY
// ============================================================
// This file defines the complete industry → skill mapping used
// across job creation, ATS screening, and AI voice interviews.
// Each industry has:
//   - hard_skills: domain-specific, testable competencies
//   - soft_skills: behavioral & situational competencies
//   - interview_context: hints for the AI interviewer persona
//   - sub_niches: optional specializations within the industry
// ============================================================

export type SkillCategory = "hard_skill" | "soft_skill";

export type SkillLevel = "basic" | "intermediate" | "advanced" | "expert";

export interface IndustrySkill {
  name: string;
  category: SkillCategory;
  /** What this skill actually means — shown to recruiters as a tooltip */
  description: string;
  /** Example interview questions the AI can draw from */
  sample_questions: string[];
  /** What "good" looks like at each level — used for scoring rubrics */
  level_descriptors: {
    basic: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
}

export interface IndustrySubNiche {
  id: string;
  label: string;
  /** Additional skills specific to this niche */
  additional_skills: string[];
  /** Extra context for the AI interviewer */
  interview_hints: string;
}

export interface IndustryDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Persona instructions for the AI voice interviewer */
  interview_context: {
    persona: string;
    tone: string;
    domain_terminology: string[];
    red_flags_to_probe: string[];
    what_great_looks_like: string;
  };
  hard_skills: IndustrySkill[];
  soft_skills: IndustrySkill[];
  sub_niches: IndustrySubNiche[];
}

// ============================================================
// INDUSTRY DEFINITIONS
// ============================================================

export const INDUSTRIES: Record<string, IndustryDefinition> = {
  // ──────────────────────────────────────────────────────
  // HEALTHCARE / MEDICAL
  // ──────────────────────────────────────────────────────
  healthcare: {
    id: "healthcare",
    label: "Healthcare & Medical",
    icon: "🏥",
    description: "Clinical, pharmaceutical, health IT, and medical device roles",
    interview_context: {
      persona:
        "You are an experienced healthcare hiring manager. You understand clinical workflows, patient safety protocols, and regulatory requirements. Probe for real-world patient care scenarios, not textbook answers.",
      tone: "Empathetic but thorough — patient safety is non-negotiable.",
      domain_terminology: [
        "HIPAA", "EMR/EHR", "patient outcomes", "clinical protocols",
        "care coordination", "formulary", "ICD-10", "CPT codes",
        "evidence-based practice", "patient acuity", "discharge planning",
      ],
      red_flags_to_probe: [
        "Vague answers about patient safety protocols",
        "No mention of compliance or documentation",
        "Inability to describe handling adverse events",
        "Lack of team-based care experience",
      ],
      what_great_looks_like:
        "Strong candidates describe specific patient scenarios, demonstrate understanding of regulatory requirements, show empathy balanced with clinical rigor, and can articulate how they handle high-pressure situations.",
    },
    hard_skills: [
      {
        name: "Clinical Documentation",
        category: "hard_skill",
        description: "Accurate medical record-keeping, charting, and clinical note writing",
        sample_questions: [
          "Walk me through how you document a complex patient encounter.",
          "How do you ensure accuracy when charting under time pressure?",
        ],
        level_descriptors: {
          basic: "Can complete standard forms and templates with supervision",
          intermediate: "Independently documents encounters with proper terminology",
          advanced: "Creates thorough, legally defensible documentation efficiently",
          expert: "Trains others, develops documentation standards and templates",
        },
      },
      {
        name: "HIPAA Compliance",
        category: "hard_skill",
        description: "Understanding and adherence to patient privacy regulations",
        sample_questions: [
          "Describe a situation where you had to navigate a HIPAA gray area.",
          "How do you handle requests for patient information from family members?",
        ],
        level_descriptors: {
          basic: "Understands basic privacy rules and follows established procedures",
          intermediate: "Applies HIPAA to complex scenarios, reports violations",
          advanced: "Designs compliant workflows, conducts training",
          expert: "Leads compliance programs, handles breach response",
        },
      },
      {
        name: "EMR/EHR Systems",
        category: "hard_skill",
        description: "Proficiency with electronic medical record systems (Epic, Cerner, etc.)",
        sample_questions: [
          "Which EMR systems have you used, and how did you adapt to new ones?",
          "How do you leverage EMR data to improve patient outcomes?",
        ],
        level_descriptors: {
          basic: "Can navigate and enter data in one system",
          intermediate: "Proficient in multiple systems, uses templates efficiently",
          advanced: "Customizes workflows, generates reports, trains staff",
          expert: "Leads EMR implementations, optimizes system-wide workflows",
        },
      },
      {
        name: "Patient Assessment",
        category: "hard_skill",
        description: "Clinical evaluation, triage, and patient monitoring skills",
        sample_questions: [
          "Describe your approach to assessing a patient with multiple co-morbidities.",
          "How do you prioritize when multiple patients need attention simultaneously?",
        ],
        level_descriptors: {
          basic: "Performs routine assessments with guidance",
          intermediate: "Independently assesses and identifies key findings",
          advanced: "Handles complex cases, recognizes subtle clinical changes",
          expert: "Mentors others, develops assessment protocols",
        },
      },
      {
        name: "Medication Management",
        category: "hard_skill",
        description: "Safe medication administration, pharmacology knowledge, drug interactions",
        sample_questions: [
          "How do you verify medication orders for safety?",
          "Describe a time you caught a potential medication error.",
        ],
        level_descriptors: {
          basic: "Follows the five rights of medication administration",
          intermediate: "Understands common interactions, adjusts for patient factors",
          advanced: "Manages complex regimens, educates patients and staff",
          expert: "Develops formulary guidelines, leads medication safety initiatives",
        },
      },
      {
        name: "Infection Control",
        category: "hard_skill",
        description: "Prevention and management of healthcare-associated infections",
        sample_questions: [
          "Walk me through your infection control practices in daily workflow.",
          "How have you responded to an outbreak situation?",
        ],
        level_descriptors: {
          basic: "Follows standard precautions consistently",
          intermediate: "Applies transmission-based precautions, monitors compliance",
          advanced: "Investigates infection patterns, implements control measures",
          expert: "Leads infection control programs, develops institutional policies",
        },
      },
      {
        name: "Medical Coding & Billing",
        category: "hard_skill",
        description: "ICD-10, CPT coding, claims processing, revenue cycle knowledge",
        sample_questions: [
          "How do you ensure coding accuracy for complex procedures?",
          "Describe your experience with claim denials and appeals.",
        ],
        level_descriptors: {
          basic: "Assigns common codes with reference materials",
          intermediate: "Codes independently with high accuracy",
          advanced: "Handles complex coding scenarios, audits others' work",
          expert: "Develops coding guidelines, leads compliance audits",
        },
      },
      {
        name: "Regulatory Compliance (FDA/CMS)",
        category: "hard_skill",
        description: "Knowledge of healthcare regulations, accreditation standards, and government agency requirements",
        sample_questions: [
          "How do you stay current with changing healthcare regulations?",
          "Describe your experience preparing for a regulatory audit.",
        ],
        level_descriptors: {
          basic: "Aware of major regulations affecting their role",
          intermediate: "Applies regulations to daily work, participates in audits",
          advanced: "Leads compliance efforts, interprets regulatory changes",
          expert: "Shapes institutional compliance strategy, interfaces with regulators",
        },
      },
    ],
    soft_skills: [
      {
        name: "Patient Communication",
        category: "soft_skill",
        description: "Ability to explain complex medical information clearly and empathetically",
        sample_questions: [
          "How do you explain a difficult diagnosis to a patient with limited health literacy?",
          "Describe a time you had to deliver bad news. How did you approach it?",
        ],
        level_descriptors: {
          basic: "Communicates routine information clearly",
          intermediate: "Adapts communication style to patient needs",
          advanced: "Handles emotionally charged conversations with skill",
          expert: "Trains others in patient communication, develops scripts",
        },
      },
      {
        name: "Crisis Management",
        category: "soft_skill",
        description: "Staying calm and effective during medical emergencies",
        sample_questions: [
          "Describe the most high-pressure clinical situation you've faced and how you handled it.",
          "How do you maintain composure when multiple emergencies happen simultaneously?",
        ],
        level_descriptors: {
          basic: "Follows emergency protocols with guidance",
          intermediate: "Responds effectively to common emergencies",
          advanced: "Leads emergency response, makes rapid clinical decisions",
          expert: "Develops emergency protocols, trains teams, debriefs effectively",
        },
      },
      {
        name: "Interdisciplinary Collaboration",
        category: "soft_skill",
        description: "Working effectively across healthcare teams (doctors, nurses, specialists, social workers)",
        sample_questions: [
          "How do you handle disagreements with a physician about a care plan?",
          "Describe a time when cross-team collaboration improved a patient outcome.",
        ],
        level_descriptors: {
          basic: "Communicates with immediate team members",
          intermediate: "Coordinates across departments effectively",
          advanced: "Leads multidisciplinary rounds, resolves conflicts",
          expert: "Builds collaborative culture, designs team-based care models",
        },
      },
      {
        name: "Ethical Decision-Making",
        category: "soft_skill",
        description: "Navigating complex ethical situations in patient care",
        sample_questions: [
          "Describe an ethical dilemma you faced in patient care. How did you resolve it?",
          "How do you balance patient autonomy with clinical recommendations?",
        ],
        level_descriptors: {
          basic: "Recognizes ethical issues and seeks guidance",
          intermediate: "Applies ethical frameworks to common scenarios",
          advanced: "Navigates complex ethical situations independently",
          expert: "Serves on ethics committees, mentors on ethical practice",
        },
      },
      {
        name: "Cultural Competency",
        category: "soft_skill",
        description: "Providing respectful, effective care across diverse patient populations",
        sample_questions: [
          "How do you adapt your care approach for patients from different cultural backgrounds?",
          "Describe a situation where cultural factors affected a patient's care plan.",
        ],
        level_descriptors: {
          basic: "Shows awareness of cultural differences",
          intermediate: "Adapts care practices for cultural needs",
          advanced: "Advocates for culturally responsive care policies",
          expert: "Develops cultural competency training and programs",
        },
      },
    ],
    sub_niches: [
      {
        id: "nursing",
        label: "Nursing",
        additional_skills: ["IV Therapy", "Wound Care", "Care Planning", "Patient Advocacy"],
        interview_hints: "Focus on clinical judgment scenarios, shift handoff practices, and patient advocacy examples.",
      },
      {
        id: "pharma",
        label: "Pharmaceutical",
        additional_skills: ["Drug Development", "Clinical Trials", "GxP Compliance", "Pharmacovigilance"],
        interview_hints: "Probe for regulatory knowledge, research methodology, and drug safety awareness.",
      },
      {
        id: "health_it",
        label: "Health IT",
        additional_skills: ["HL7/FHIR", "Clinical Informatics", "Interoperability", "Health Data Analytics"],
        interview_hints: "Balance technical depth with understanding of clinical workflows and user needs.",
      },
      {
        id: "medical_devices",
        label: "Medical Devices",
        additional_skills: ["510(k) Process", "Design Controls", "Quality Systems (ISO 13485)", "Biocompatibility"],
        interview_hints: "Focus on regulatory pathway knowledge, risk management, and cross-functional collaboration.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // FINANCE & ACCOUNTING
  // ──────────────────────────────────────────────────────
  finance: {
    id: "finance",
    label: "Finance & Accounting",
    icon: "💰",
    description: "Banking, investment, accounting, fintech, and financial services roles",
    interview_context: {
      persona:
        "You are a senior finance hiring manager. You understand financial modeling, regulatory environments, and risk management. Probe for analytical rigor and attention to detail.",
      tone: "Professional and precise — accuracy matters in finance.",
      domain_terminology: [
        "GAAP", "IFRS", "SOX compliance", "P&L", "balance sheet",
        "cash flow", "DCF", "EBITDA", "risk-adjusted returns", "AML/KYC",
        "Basel III", "fiduciary duty", "portfolio allocation",
      ],
      red_flags_to_probe: [
        "Inability to explain financial concepts simply",
        "No mention of controls or compliance",
        "Vague answers about quantitative analysis",
        "Lack of attention to accuracy and reconciliation",
      ],
      what_great_looks_like:
        "Strong candidates quantify their impact, demonstrate analytical rigor, understand regulatory requirements, and can explain complex financial concepts clearly.",
    },
    hard_skills: [
      {
        name: "Financial Modeling",
        category: "hard_skill",
        description: "Building and maintaining financial models (DCF, LBO, comparables)",
        sample_questions: [
          "Walk me through building a three-statement financial model.",
          "How do you stress-test assumptions in your models?",
        ],
        level_descriptors: {
          basic: "Can build simple models from templates",
          intermediate: "Builds models independently, handles multiple scenarios",
          advanced: "Creates complex integrated models, validates with sensitivity analysis",
          expert: "Designs modeling frameworks, reviews and audits models",
        },
      },
      {
        name: "GAAP/IFRS Accounting",
        category: "hard_skill",
        description: "Knowledge of accounting standards and their practical application",
        sample_questions: [
          "Explain a complex accounting treatment you've dealt with recently.",
          "How do you handle differences between GAAP and IFRS for multinational reporting?",
        ],
        level_descriptors: {
          basic: "Understands fundamental accounting principles",
          intermediate: "Applies standards to common transactions independently",
          advanced: "Handles complex accounting treatments, technical research",
          expert: "Advises on novel transactions, shapes accounting policy",
        },
      },
      {
        name: "Risk Management",
        category: "hard_skill",
        description: "Identifying, assessing, and mitigating financial risks",
        sample_questions: [
          "Describe a risk you identified that others missed. How did you handle it?",
          "What framework do you use for assessing portfolio risk?",
        ],
        level_descriptors: {
          basic: "Identifies obvious risks, follows established frameworks",
          intermediate: "Assesses and quantifies risks independently",
          advanced: "Designs risk mitigation strategies, models tail risks",
          expert: "Leads enterprise risk management, develops risk frameworks",
        },
      },
      {
        name: "Regulatory Compliance (SOX/AML/KYC)",
        category: "hard_skill",
        description: "Understanding of financial regulations and compliance requirements",
        sample_questions: [
          "How have you ensured SOX compliance in your previous roles?",
          "Describe your experience with AML investigations or suspicious activity reporting.",
        ],
        level_descriptors: {
          basic: "Follows established compliance procedures",
          intermediate: "Implements compliance controls, handles routine reporting",
          advanced: "Designs compliance programs, manages audits",
          expert: "Shapes compliance strategy, interfaces with regulators",
        },
      },
      {
        name: "Data Analysis & Visualization",
        category: "hard_skill",
        description: "Using tools (Excel, SQL, Python, Tableau) to analyze and present financial data",
        sample_questions: [
          "What tools do you use for financial analysis and why?",
          "Describe a time when data analysis changed a business decision.",
        ],
        level_descriptors: {
          basic: "Uses Excel for basic analysis and charts",
          intermediate: "Proficient with advanced Excel, basic SQL/BI tools",
          advanced: "Uses SQL/Python for complex analysis, builds dashboards",
          expert: "Automates analysis pipelines, leads data-driven decision-making",
        },
      },
      {
        name: "Audit & Internal Controls",
        category: "hard_skill",
        description: "Designing and executing audit procedures, evaluating internal controls",
        sample_questions: [
          "Walk me through your approach to planning an audit engagement.",
          "Describe a significant control deficiency you identified and how it was remediated.",
        ],
        level_descriptors: {
          basic: "Performs testing procedures with supervision",
          intermediate: "Plans and executes audit sections independently",
          advanced: "Manages audit engagements, evaluates complex controls",
          expert: "Designs control frameworks, leads audit functions",
        },
      },
    ],
    soft_skills: [
      {
        name: "Stakeholder Communication",
        category: "soft_skill",
        description: "Explaining financial information to non-finance stakeholders",
        sample_questions: [
          "How do you present financial results to a non-financial audience?",
          "Describe a time you had to push back on a budget request with data.",
        ],
        level_descriptors: {
          basic: "Can explain basic financial concepts",
          intermediate: "Tailors financial presentations to audience",
          advanced: "Influences decisions through financial storytelling",
          expert: "Presents to boards and investors, shapes strategic narrative",
        },
      },
      {
        name: "Attention to Detail",
        category: "soft_skill",
        description: "Accuracy and thoroughness in financial work products",
        sample_questions: [
          "Describe your process for ensuring accuracy in financial reports.",
          "Tell me about a time when a small error could have had large consequences.",
        ],
        level_descriptors: {
          basic: "Catches obvious errors with checklists",
          intermediate: "Consistently produces accurate work, self-reviews effectively",
          advanced: "Designs review processes, catches systemic issues",
          expert: "Creates quality assurance frameworks for teams",
        },
      },
      {
        name: "Ethical Judgment",
        category: "soft_skill",
        description: "Navigating ethical gray areas in financial decision-making",
        sample_questions: [
          "Describe a situation where you were pressured to bend financial rules.",
          "How do you handle conflicts of interest?",
        ],
        level_descriptors: {
          basic: "Follows ethical guidelines and escalates concerns",
          intermediate: "Navigates common ethical scenarios independently",
          advanced: "Makes judgment calls in gray areas, influences culture",
          expert: "Sets ethical standards, leads by example in complex situations",
        },
      },
      {
        name: "Deadline Management",
        category: "soft_skill",
        description: "Managing multiple financial deadlines (close, reporting, audits)",
        sample_questions: [
          "How do you manage competing priorities during month-end close?",
          "Describe a time when you had to deliver critical work under extreme time pressure.",
        ],
        level_descriptors: {
          basic: "Meets deadlines with reminders and oversight",
          intermediate: "Self-manages deadlines, prioritizes effectively",
          advanced: "Manages team deadlines, anticipates bottlenecks",
          expert: "Optimizes organizational workflows, reduces close cycles",
        },
      },
    ],
    sub_niches: [
      {
        id: "investment_banking",
        label: "Investment Banking",
        additional_skills: ["M&A Analysis", "Capital Markets", "Pitch Book Creation", "Deal Structuring"],
        interview_hints: "Focus on deal experience, modeling speed, and ability to work under pressure.",
      },
      {
        id: "corporate_finance",
        label: "Corporate Finance / FP&A",
        additional_skills: ["Budgeting & Forecasting", "Variance Analysis", "Business Partnering", "ERP Systems"],
        interview_hints: "Probe for business acumen, forecast accuracy, and influence on business decisions.",
      },
      {
        id: "fintech",
        label: "Fintech",
        additional_skills: ["Payment Systems", "Blockchain/DeFi", "API Integration", "Product Analytics"],
        interview_hints: "Balance financial knowledge with tech literacy and startup/product mindset.",
      },
      {
        id: "wealth_management",
        label: "Wealth Management",
        additional_skills: ["Portfolio Construction", "Tax Planning", "Estate Planning", "Client Relationship Management"],
        interview_hints: "Focus on client-facing skills, fiduciary understanding, and holistic planning.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // SALES & BUSINESS DEVELOPMENT
  // ──────────────────────────────────────────────────────
  sales: {
    id: "sales",
    label: "Sales & Business Development",
    icon: "📈",
    description: "Sales, account management, business development, and revenue roles",
    interview_context: {
      persona:
        "You are a VP of Sales evaluating talent. You care about process, metrics, and real results — not just charisma. Probe for specific numbers, deal stories, and how they handle rejection.",
      tone: "Direct and results-oriented, but warm enough to let personality shine.",
      domain_terminology: [
        "pipeline", "quota attainment", "ARR/MRR", "CAC", "LTV",
        "discovery call", "BANT", "MEDDIC", "champion", "close rate",
        "churn", "upsell", "expansion revenue", "territory",
      ],
      red_flags_to_probe: [
        "No specific numbers or metrics",
        "Blaming external factors for missed targets",
        "No structured sales process description",
        "Inability to articulate their ideal customer profile",
      ],
      what_great_looks_like:
        "Strong candidates quantify everything (quota attainment %, deal sizes, pipeline generated), describe their process systematically, handle objections gracefully, and show genuine curiosity about the customer's problem.",
    },
    hard_skills: [
      {
        name: "Pipeline Management",
        category: "hard_skill",
        description: "Building, managing, and accurately forecasting a sales pipeline",
        sample_questions: [
          "Walk me through your current pipeline. How do you prioritize?",
          "How do you forecast and what's your typical accuracy?",
        ],
        level_descriptors: {
          basic: "Tracks deals in CRM, follows up when reminded",
          intermediate: "Maintains organized pipeline, forecasts with reasonable accuracy",
          advanced: "Builds repeatable pipeline generation systems, forecasts within 10%",
          expert: "Designs pipeline methodology for teams, drives forecasting discipline",
        },
      },
      {
        name: "Discovery & Qualification",
        category: "hard_skill",
        description: "Identifying customer needs, qualifying opportunities (BANT, MEDDIC, etc.)",
        sample_questions: [
          "Walk me through your discovery process on a recent deal.",
          "How do you determine if a deal is worth pursuing?",
        ],
        level_descriptors: {
          basic: "Asks basic qualifying questions from a script",
          intermediate: "Conducts structured discovery, identifies pain points",
          advanced: "Uncovers latent needs, multi-threads within accounts",
          expert: "Coaches teams on discovery, develops qualification frameworks",
        },
      },
      {
        name: "Negotiation & Closing",
        category: "hard_skill",
        description: "Structuring deals, handling objections, and closing effectively",
        sample_questions: [
          "Tell me about a complex negotiation. What was your strategy?",
          "How do you handle the 'we need to think about it' objection?",
        ],
        level_descriptors: {
          basic: "Closes straightforward deals with pricing guidance",
          intermediate: "Navigates common objections, negotiates within parameters",
          advanced: "Structures complex deals, creates urgency naturally",
          expert: "Coaches on negotiation strategy, handles enterprise-level deals",
        },
      },
      {
        name: "CRM Proficiency",
        category: "hard_skill",
        description: "Effective use of CRM tools (Salesforce, HubSpot) for tracking and reporting",
        sample_questions: [
          "How do you use your CRM beyond basic deal tracking?",
          "What data do you track that helps you sell more effectively?",
        ],
        level_descriptors: {
          basic: "Logs basic deal information",
          intermediate: "Maintains detailed records, uses reports",
          advanced: "Leverages CRM data for strategic insights",
          expert: "Designs CRM processes and dashboards for teams",
        },
      },
      {
        name: "Product Knowledge",
        category: "hard_skill",
        description: "Deep understanding of the product/service being sold and competitive landscape",
        sample_questions: [
          "How do you stay current on product changes and competitive moves?",
          "How do you position against your top competitor?",
        ],
        level_descriptors: {
          basic: "Knows core product features and pricing",
          intermediate: "Understands use cases, handles technical questions",
          advanced: "Positions strategically against competitors, shapes product feedback",
          expert: "Influences product roadmap, serves as product expert for the team",
        },
      },
    ],
    soft_skills: [
      {
        name: "Resilience & Grit",
        category: "soft_skill",
        description: "Handling rejection, maintaining motivation through dry spells",
        sample_questions: [
          "Tell me about a quarter where you were behind. What did you do?",
          "How do you stay motivated after a string of lost deals?",
        ],
        level_descriptors: {
          basic: "Bounces back from individual rejections",
          intermediate: "Maintains consistent effort through tough periods",
          advanced: "Uses setbacks as learning opportunities, stays positive",
          expert: "Lifts team morale during difficult periods, leads by example",
        },
      },
      {
        name: "Active Listening",
        category: "soft_skill",
        description: "Truly understanding customer needs beyond surface-level statements",
        sample_questions: [
          "Give me an example of when listening carefully changed the outcome of a deal.",
          "How do you ensure you're understanding the customer's real problem?",
        ],
        level_descriptors: {
          basic: "Lets customers finish speaking before responding",
          intermediate: "Asks clarifying questions, paraphrases to confirm understanding",
          advanced: "Reads between the lines, identifies unstated needs",
          expert: "Models exceptional listening for the team, coaches on techniques",
        },
      },
      {
        name: "Relationship Building",
        category: "soft_skill",
        description: "Developing trust and long-term relationships with customers and internal teams",
        sample_questions: [
          "How do you build trust with a skeptical buyer?",
          "Describe a customer relationship that led to significant expansion revenue.",
        ],
        level_descriptors: {
          basic: "Maintains positive rapport with contacts",
          intermediate: "Builds genuine relationships that generate referrals",
          advanced: "Develops executive-level relationships, becomes a trusted advisor",
          expert: "Creates relationship-building culture across the organization",
        },
      },
      {
        name: "Storytelling & Persuasion",
        category: "soft_skill",
        description: "Using narratives and data to influence buying decisions",
        sample_questions: [
          "How do you tailor your pitch to different buyer personas?",
          "Give me an example of a compelling story you use in sales conversations.",
        ],
        level_descriptors: {
          basic: "Delivers standard presentations clearly",
          intermediate: "Customizes narratives to audience, uses social proof",
          advanced: "Creates compelling business cases, influences at C-level",
          expert: "Develops messaging frameworks, trains on persuasion techniques",
        },
      },
    ],
    sub_niches: [
      {
        id: "saas_sales",
        label: "SaaS / Tech Sales",
        additional_skills: ["SaaS Metrics", "Demo Skills", "Technical Discovery", "PLG Understanding"],
        interview_hints: "Focus on ARR/MRR metrics, sales cycle management, and product-led growth awareness.",
      },
      {
        id: "enterprise_sales",
        label: "Enterprise Sales",
        additional_skills: ["Multi-threading", "Executive Alignment", "RFP Response", "Complex Deal Architecture"],
        interview_hints: "Probe for long-cycle deal management, stakeholder mapping, and champion building.",
      },
      {
        id: "real_estate",
        label: "Real Estate Sales",
        additional_skills: ["Market Analysis", "Property Valuation", "Contract Negotiation", "Client Portfolio Management"],
        interview_hints: "Focus on local market knowledge, transaction management, and client trust-building.",
      },
      {
        id: "bdr_sdr",
        label: "SDR / BDR",
        additional_skills: ["Cold Outreach", "Sequence Building", "Lead Scoring", "Objection Handling at Top of Funnel"],
        interview_hints: "Focus on volume metrics, creativity in outreach, and ability to qualify quickly.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // LEGAL
  // ──────────────────────────────────────────────────────
  legal: {
    id: "legal",
    label: "Legal",
    icon: "⚖️",
    description: "Law firms, in-house legal, compliance, and regulatory roles",
    interview_context: {
      persona:
        "You are a senior legal hiring manager. You value precision, analytical reasoning, and practical judgment. Probe for how candidates handle ambiguity and make risk-based decisions.",
      tone: "Precise and measured — detail matters in legal work.",
      domain_terminology: [
        "due diligence", "contract lifecycle", "litigation hold",
        "regulatory filing", "privilege", "discovery", "injunction",
        "indemnification", "force majeure", "jurisdiction",
      ],
      red_flags_to_probe: [
        "Inability to articulate risk-benefit tradeoffs",
        "No experience with actual legal judgment calls",
        "Vague answers about handling confidential information",
        "Lack of attention to contractual detail",
      ],
      what_great_looks_like:
        "Strong candidates demonstrate precise reasoning, provide structured analysis of legal issues, show good judgment about when to escalate, and balance legal risk with business needs.",
    },
    hard_skills: [
      {
        name: "Contract Drafting & Review",
        category: "hard_skill",
        description: "Drafting, reviewing, and negotiating legal agreements",
        sample_questions: [
          "Walk me through your process for reviewing a complex commercial contract.",
          "What are the most critical clauses you focus on and why?",
        ],
        level_descriptors: {
          basic: "Reviews simple contracts with templates and checklists",
          intermediate: "Drafts and negotiates standard agreements independently",
          advanced: "Handles complex, high-value contracts with strategic awareness",
          expert: "Creates contract frameworks, negotiates novel deal structures",
        },
      },
      {
        name: "Legal Research & Analysis",
        category: "hard_skill",
        description: "Researching case law, statutes, and regulations to support legal positions",
        sample_questions: [
          "Describe a research project where the answer wasn't straightforward.",
          "How do you stay current on regulatory changes in your practice area?",
        ],
        level_descriptors: {
          basic: "Conducts basic searches in legal databases",
          intermediate: "Performs thorough research with well-organized memos",
          advanced: "Handles complex, multi-jurisdictional research independently",
          expert: "Develops legal positions on novel issues, publishes thought leadership",
        },
      },
      {
        name: "Regulatory Compliance",
        category: "hard_skill",
        description: "Ensuring organizational compliance with applicable laws and regulations",
        sample_questions: [
          "How do you approach building a compliance program from scratch?",
          "Describe how you've handled a regulatory investigation or inquiry.",
        ],
        level_descriptors: {
          basic: "Follows compliance procedures, flags issues",
          intermediate: "Implements compliance controls, handles routine reporting",
          advanced: "Designs compliance programs, manages regulatory relationships",
          expert: "Shapes regulatory strategy, handles enforcement actions",
        },
      },
      {
        name: "Litigation Management",
        category: "hard_skill",
        description: "Managing litigation matters including discovery, depositions, and trial preparation",
        sample_questions: [
          "Walk me through your approach to managing a complex litigation matter.",
          "How do you assess whether to settle or proceed to trial?",
        ],
        level_descriptors: {
          basic: "Assists with discovery and document review",
          intermediate: "Manages litigation tasks independently, drafts motions",
          advanced: "Leads litigation strategy, handles depositions and hearings",
          expert: "Manages complex multi-party litigation, tries cases",
        },
      },
      {
        name: "Data Privacy & Governance",
        category: "hard_skill",
        description: "GDPR, CCPA, and data protection compliance",
        sample_questions: [
          "How do you approach a cross-border data transfer assessment?",
          "Describe your experience with data breach response.",
        ],
        level_descriptors: {
          basic: "Understands basic privacy principles and regulations",
          intermediate: "Conducts privacy impact assessments, handles DSARs",
          advanced: "Designs privacy programs, manages cross-border issues",
          expert: "Leads privacy strategy, interfaces with regulators globally",
        },
      },
    ],
    soft_skills: [
      {
        name: "Analytical Reasoning",
        category: "soft_skill",
        description: "Breaking down complex legal issues into structured analysis",
        sample_questions: [
          "How do you approach a legal issue you've never encountered before?",
          "Describe a situation where you had to balance competing legal arguments.",
        ],
        level_descriptors: {
          basic: "Identifies key issues with guidance",
          intermediate: "Structures analysis independently, considers alternatives",
          advanced: "Handles multi-faceted issues with nuanced reasoning",
          expert: "Develops analytical frameworks, mentors on legal reasoning",
        },
      },
      {
        name: "Business Acumen",
        category: "soft_skill",
        description: "Understanding how legal advice impacts business outcomes",
        sample_questions: [
          "Describe a time you balanced legal risk with business needs.",
          "How do you ensure your legal advice is practical, not just technically correct?",
        ],
        level_descriptors: {
          basic: "Understands basic business context of legal work",
          intermediate: "Provides practical legal advice with business awareness",
          advanced: "Proactively identifies legal issues from business strategy",
          expert: "Serves as strategic business advisor, shapes business decisions",
        },
      },
      {
        name: "Written Communication",
        category: "soft_skill",
        description: "Clear, precise legal writing for various audiences",
        sample_questions: [
          "How do you tailor legal writing for non-lawyer stakeholders?",
          "Describe your approach to writing a brief or legal memo.",
        ],
        level_descriptors: {
          basic: "Writes clearly with standard legal formatting",
          intermediate: "Produces polished, well-organized legal documents",
          advanced: "Adapts style for audience, writes persuasively",
          expert: "Sets writing standards, mentors on legal writing",
        },
      },
      {
        name: "Professional Judgment",
        category: "soft_skill",
        description: "Knowing when to escalate, when to advise caution, and when to take calculated risks",
        sample_questions: [
          "Describe a situation where you had to make a judgment call without perfect information.",
          "How do you decide when to involve outside counsel?",
        ],
        level_descriptors: {
          basic: "Seeks guidance appropriately on judgment calls",
          intermediate: "Makes sound judgment on routine matters",
          advanced: "Handles high-stakes decisions with good risk calibration",
          expert: "Trusted advisor on the most sensitive matters",
        },
      },
    ],
    sub_niches: [
      {
        id: "corporate_law",
        label: "Corporate & M&A",
        additional_skills: ["M&A Due Diligence", "Securities Law", "Corporate Governance", "Entity Management"],
        interview_hints: "Focus on deal experience, board interaction, and ability to manage complex transactions.",
      },
      {
        id: "ip_law",
        label: "Intellectual Property",
        additional_skills: ["Patent Prosecution", "Trademark Management", "IP Licensing", "Trade Secret Protection"],
        interview_hints: "Probe for technical understanding, portfolio strategy, and enforcement experience.",
      },
      {
        id: "employment_law",
        label: "Employment Law",
        additional_skills: ["Workplace Investigations", "Benefits Compliance", "Labor Relations", "Accommodations"],
        interview_hints: "Focus on employee relations scenarios, investigation methodology, and preventive counseling.",
      },
      {
        id: "legal_ops",
        label: "Legal Operations",
        additional_skills: ["Legal Tech (CLM, eDiscovery)", "Legal Spend Management", "Process Optimization", "Vendor Management"],
        interview_hints: "Balance legal knowledge with operational efficiency and technology adoption.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // TECHNOLOGY / SOFTWARE ENGINEERING
  // ──────────────────────────────────────────────────────
  technology: {
    id: "technology",
    label: "Technology & Engineering",
    icon: "💻",
    description: "Software engineering, DevOps, data engineering, and IT roles",
    interview_context: {
      persona:
        "You are a senior engineering manager. You evaluate candidates on their ability to solve real problems, not trivia. Probe for system design thinking, debugging approach, and collaboration.",
      tone: "Technical but conversational — focus on problem-solving approach over memorized answers.",
      domain_terminology: [
        "microservices", "CI/CD", "distributed systems", "API design",
        "database indexing", "caching", "load balancing", "observability",
        "version control", "agile", "technical debt", "code review",
      ],
      red_flags_to_probe: [
        "Cannot explain their own code or architecture decisions",
        "No mention of testing or quality practices",
        "Inability to discuss tradeoffs in technical decisions",
        "No experience with production systems or debugging",
      ],
      what_great_looks_like:
        "Strong candidates articulate tradeoffs, show depth in their domain, describe real debugging stories, and demonstrate they build for maintainability and team productivity — not just cleverness.",
    },
    hard_skills: [
      {
        name: "System Design",
        category: "hard_skill",
        description: "Designing scalable, reliable software systems and architectures",
        sample_questions: [
          "How would you design a system that needs to handle 10x your current load?",
          "Walk me through an architecture decision you made and the tradeoffs involved.",
        ],
        level_descriptors: {
          basic: "Understands basic client-server architecture",
          intermediate: "Designs simple systems with appropriate patterns",
          advanced: "Architects complex distributed systems with resilience",
          expert: "Designs systems at massive scale, makes organization-wide technical decisions",
        },
      },
      {
        name: "Code Quality & Testing",
        category: "hard_skill",
        description: "Writing clean, tested, maintainable code",
        sample_questions: [
          "What's your testing strategy? How do you decide what to test?",
          "Describe a time when your tests caught a critical bug before production.",
        ],
        level_descriptors: {
          basic: "Writes basic unit tests, follows coding standards",
          intermediate: "Writes comprehensive tests, practices code review",
          advanced: "Designs testing strategies, improves team code quality",
          expert: "Defines quality standards and practices for the organization",
        },
      },
      {
        name: "Database Design",
        category: "hard_skill",
        description: "Schema design, query optimization, and data modeling",
        sample_questions: [
          "How do you approach schema design for a new feature?",
          "Describe a query performance issue you diagnosed and fixed.",
        ],
        level_descriptors: {
          basic: "Creates basic schemas, writes simple queries",
          intermediate: "Designs normalized schemas, optimizes common queries",
          advanced: "Handles complex data models, sharding, replication strategies",
          expert: "Architects data platforms, makes database technology decisions",
        },
      },
      {
        name: "DevOps & Infrastructure",
        category: "hard_skill",
        description: "CI/CD, cloud infrastructure, containerization, monitoring",
        sample_questions: [
          "Describe your ideal CI/CD pipeline and why.",
          "How do you approach debugging a production incident?",
        ],
        level_descriptors: {
          basic: "Uses existing CI/CD pipelines, basic cloud familiarity",
          intermediate: "Sets up CI/CD, manages cloud resources, basic monitoring",
          advanced: "Designs infrastructure as code, implements observability",
          expert: "Architects cloud-native platforms, leads SRE practices",
        },
      },
      {
        name: "API Design",
        category: "hard_skill",
        description: "Designing clean, well-documented, versioned APIs",
        sample_questions: [
          "What principles guide your API design decisions?",
          "How do you handle backward compatibility when evolving an API?",
        ],
        level_descriptors: {
          basic: "Consumes APIs, builds simple endpoints",
          intermediate: "Designs RESTful APIs with proper error handling",
          advanced: "Designs API platforms with versioning, rate limiting, auth",
          expert: "Defines API strategy and governance for the organization",
        },
      },
      {
        name: "Security Practices",
        category: "hard_skill",
        description: "Application security, authentication, authorization, and secure coding",
        sample_questions: [
          "How do you approach security in your development process?",
          "Describe a security vulnerability you discovered or addressed.",
        ],
        level_descriptors: {
          basic: "Follows OWASP basics, uses parameterized queries",
          intermediate: "Implements auth/authz, handles secrets properly",
          advanced: "Designs security architecture, conducts threat modeling",
          expert: "Leads security strategy, responds to incidents",
        },
      },
    ],
    soft_skills: [
      {
        name: "Technical Communication",
        category: "soft_skill",
        description: "Explaining complex technical concepts to various audiences",
        sample_questions: [
          "How do you explain a technical decision to a non-technical stakeholder?",
          "Describe a time when clear communication prevented a technical problem.",
        ],
        level_descriptors: {
          basic: "Can explain their own work to teammates",
          intermediate: "Writes clear documentation, presents to broader teams",
          advanced: "Communicates effectively to executives and non-technical stakeholders",
          expert: "Defines technical communication standards, represents engineering externally",
        },
      },
      {
        name: "Collaboration & Code Review",
        category: "soft_skill",
        description: "Working effectively with teammates, giving and receiving feedback",
        sample_questions: [
          "How do you approach giving feedback in a code review?",
          "Describe a disagreement with a teammate about a technical approach.",
        ],
        level_descriptors: {
          basic: "Participates in code reviews, accepts feedback",
          intermediate: "Gives constructive reviews, collaborates on design",
          advanced: "Mentors others, resolves technical disagreements productively",
          expert: "Builds collaborative engineering culture, coaches on feedback",
        },
      },
      {
        name: "Problem Decomposition",
        category: "soft_skill",
        description: "Breaking complex problems into manageable, shippable pieces",
        sample_questions: [
          "How do you approach a large ambiguous project?",
          "Describe a time you had to simplify scope without sacrificing the core value.",
        ],
        level_descriptors: {
          basic: "Can break down assigned tasks into subtasks",
          intermediate: "Decomposes features into shippable increments",
          advanced: "Breaks down complex systems into phased rollouts",
          expert: "Defines decomposition strategies for org-level initiatives",
        },
      },
      {
        name: "Ownership & Reliability",
        category: "soft_skill",
        description: "Taking responsibility for outcomes, following through on commitments",
        sample_questions: [
          "Tell me about a time something you built broke in production. What did you do?",
          "How do you handle on-call responsibilities?",
        ],
        level_descriptors: {
          basic: "Completes assigned work reliably",
          intermediate: "Owns features end-to-end including monitoring",
          advanced: "Takes ownership of systems, proactively addresses issues",
          expert: "Drives accountability culture, owns critical systems",
        },
      },
    ],
    sub_niches: [
      {
        id: "frontend",
        label: "Frontend Engineering",
        additional_skills: ["UI/UX Sensibility", "Performance Optimization", "Accessibility (a11y)", "Design Systems"],
        interview_hints: "Focus on user experience thinking, performance awareness, and component architecture.",
      },
      {
        id: "backend",
        label: "Backend Engineering",
        additional_skills: ["Distributed Systems", "Message Queues", "Caching Strategies", "Data Pipelines"],
        interview_hints: "Probe for system design depth, production debugging stories, and scalability thinking.",
      },
      {
        id: "data_engineering",
        label: "Data Engineering",
        additional_skills: ["ETL/ELT Pipelines", "Data Warehousing", "Streaming (Kafka)", "Data Quality"],
        interview_hints: "Focus on pipeline reliability, data modeling decisions, and handling data at scale.",
      },
      {
        id: "devops_sre",
        label: "DevOps / SRE",
        additional_skills: ["Infrastructure as Code", "Incident Management", "SLO/SLI Design", "Chaos Engineering"],
        interview_hints: "Focus on incident response stories, reliability engineering practices, and automation mindset.",
      },
      {
        id: "mobile",
        label: "Mobile Development",
        additional_skills: ["Platform Guidelines (iOS/Android)", "App Performance", "Offline-first Design", "Push Notifications"],
        interview_hints: "Focus on platform-specific knowledge, performance optimization, and UX sensibility.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // MARKETING
  // ──────────────────────────────────────────────────────
  marketing: {
    id: "marketing",
    label: "Marketing",
    icon: "📣",
    description: "Digital marketing, content, brand, growth, and communications roles",
    interview_context: {
      persona:
        "You are a CMO evaluating marketing talent. You care about results tied to business metrics, creative thinking backed by data, and the ability to work cross-functionally.",
      tone: "Creative yet analytical — great marketers combine both.",
      domain_terminology: [
        "CAC", "ROAS", "conversion rate", "funnel", "attribution",
        "brand positioning", "content strategy", "SEO", "paid media",
        "A/B testing", "customer journey", "go-to-market",
      ],
      red_flags_to_probe: [
        "No metrics or data to back up campaign results",
        "Inability to connect marketing activities to business outcomes",
        "Only tactical execution, no strategic thinking",
        "No understanding of the target audience",
      ],
      what_great_looks_like:
        "Strong candidates tie marketing activities to revenue or growth metrics, show both creative and analytical thinking, understand the full funnel, and demonstrate customer empathy.",
    },
    hard_skills: [
      {
        name: "Digital Advertising",
        category: "hard_skill",
        description: "Managing paid campaigns across platforms (Google, Meta, LinkedIn, etc.)",
        sample_questions: [
          "Walk me through how you'd allocate a $50K monthly ad budget across channels.",
          "How do you optimize campaigns that aren't hitting their ROAS targets?",
        ],
        level_descriptors: {
          basic: "Sets up and monitors basic campaigns",
          intermediate: "Optimizes campaigns across channels, manages budgets",
          advanced: "Develops multi-channel strategies, handles complex attribution",
          expert: "Leads paid media strategy, innovates on new channels",
        },
      },
      {
        name: "SEO & Content Strategy",
        category: "hard_skill",
        description: "Search engine optimization, content planning, and organic growth",
        sample_questions: [
          "How do you decide what content to create? Walk me through your process.",
          "Describe an SEO win you achieved. What was your approach?",
        ],
        level_descriptors: {
          basic: "Understands basic SEO principles, writes content",
          intermediate: "Develops content calendars, conducts keyword research",
          advanced: "Builds comprehensive SEO strategies, drives significant organic growth",
          expert: "Leads content operations, develops scalable content systems",
        },
      },
      {
        name: "Marketing Analytics",
        category: "hard_skill",
        description: "Measuring, analyzing, and reporting on marketing performance",
        sample_questions: [
          "What metrics do you track and why? How do you decide what's a vanity metric?",
          "Describe a time when data changed your marketing strategy.",
        ],
        level_descriptors: {
          basic: "Reads dashboards, tracks basic KPIs",
          intermediate: "Builds reports, analyzes trends, makes data-driven recommendations",
          advanced: "Designs attribution models, runs experiments",
          expert: "Builds marketing data infrastructure, leads analytics teams",
        },
      },
      {
        name: "Brand & Positioning",
        category: "hard_skill",
        description: "Developing and maintaining brand identity, messaging, and positioning",
        sample_questions: [
          "How would you approach repositioning a product in a crowded market?",
          "Describe your process for developing brand messaging.",
        ],
        level_descriptors: {
          basic: "Follows existing brand guidelines",
          intermediate: "Contributes to brand messaging, maintains consistency",
          advanced: "Develops brand strategy and positioning frameworks",
          expert: "Leads brand transformations, shapes market perception",
        },
      },
      {
        name: "Marketing Automation",
        category: "hard_skill",
        description: "Building and managing automated marketing workflows (email, nurture, etc.)",
        sample_questions: [
          "Walk me through a lead nurture sequence you've built.",
          "How do you segment audiences for personalized marketing?",
        ],
        level_descriptors: {
          basic: "Uses email tools for basic campaigns",
          intermediate: "Builds automated sequences with segmentation",
          advanced: "Designs complex multi-channel automation with scoring",
          expert: "Architects marketing technology stack and operations",
        },
      },
    ],
    soft_skills: [
      {
        name: "Creative Thinking",
        category: "soft_skill",
        description: "Generating innovative marketing ideas and campaigns",
        sample_questions: [
          "Tell me about a marketing campaign you're most proud of creatively.",
          "How do you generate new ideas when you feel stuck?",
        ],
        level_descriptors: {
          basic: "Contributes ideas in brainstorms",
          intermediate: "Develops creative campaign concepts independently",
          advanced: "Creates innovative campaigns that break through noise",
          expert: "Leads creative vision, inspires creative excellence across teams",
        },
      },
      {
        name: "Customer Empathy",
        category: "soft_skill",
        description: "Deeply understanding the target audience's needs, pain points, and motivations",
        sample_questions: [
          "How do you stay close to your customers? What methods do you use?",
          "Describe a time when customer insight fundamentally changed your approach.",
        ],
        level_descriptors: {
          basic: "Understands basic customer demographics",
          intermediate: "Develops personas, uses customer feedback in planning",
          advanced: "Conducts primary research, builds deep customer understanding",
          expert: "Champions voice of customer across the organization",
        },
      },
      {
        name: "Cross-functional Collaboration",
        category: "soft_skill",
        description: "Working effectively with sales, product, design, and leadership",
        sample_questions: [
          "How do you align marketing efforts with the sales team?",
          "Describe a successful cross-functional project you led.",
        ],
        level_descriptors: {
          basic: "Coordinates with adjacent teams when asked",
          intermediate: "Proactively aligns with sales and product",
          advanced: "Drives cross-functional go-to-market initiatives",
          expert: "Builds integrated GTM processes across the organization",
        },
      },
    ],
    sub_niches: [
      {
        id: "growth",
        label: "Growth Marketing",
        additional_skills: ["Experimentation (A/B)", "Funnel Optimization", "Product-Led Growth", "Retention Marketing"],
        interview_hints: "Focus on experiment methodology, metrics rigor, and growth loop thinking.",
      },
      {
        id: "content",
        label: "Content Marketing",
        additional_skills: ["Editorial Strategy", "Thought Leadership", "Video/Podcast Production", "Distribution Strategy"],
        interview_hints: "Focus on content strategy rationale, distribution thinking, and measuring content impact.",
      },
      {
        id: "product_marketing",
        label: "Product Marketing",
        additional_skills: ["Competitive Intelligence", "Launch Management", "Sales Enablement", "Messaging Frameworks"],
        interview_hints: "Focus on positioning methodology, cross-functional alignment, and impact on revenue.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // HUMAN RESOURCES
  // ──────────────────────────────────────────────────────
  human_resources: {
    id: "human_resources",
    label: "Human Resources",
    icon: "👥",
    description: "HR, talent acquisition, people operations, and organizational development roles",
    interview_context: {
      persona:
        "You are a CHRO evaluating HR talent. You care about both compliance and culture — someone who can balance legal requirements with building a great employee experience.",
      tone: "People-focused but business-minded.",
      domain_terminology: [
        "employee engagement", "total rewards", "HRIS", "talent pipeline",
        "succession planning", "DEI", "onboarding", "performance management",
        "retention", "employer branding", "labor law", "comp benchmarking",
      ],
      red_flags_to_probe: [
        "Policy-focused without people awareness",
        "No metrics or business impact orientation",
        "Inability to handle sensitive employee situations",
        "Lack of knowledge about employment law basics",
      ],
      what_great_looks_like:
        "Strong candidates balance empathy with business results, can navigate sensitive situations diplomatically, use data to influence decisions, and build programs that scale.",
    },
    hard_skills: [
      {
        name: "Employment Law & Compliance",
        category: "hard_skill",
        description: "Knowledge of labor laws, regulations, and workplace compliance",
        sample_questions: [
          "How do you stay current on employment law changes?",
          "Describe a compliance challenge you navigated.",
        ],
        level_descriptors: {
          basic: "Understands basic employment laws",
          intermediate: "Applies laws to common workplace scenarios",
          advanced: "Handles complex compliance issues, advises leadership",
          expert: "Designs compliance programs, manages regulatory interactions",
        },
      },
      {
        name: "Talent Acquisition",
        category: "hard_skill",
        description: "End-to-end recruiting from sourcing to offer negotiation",
        sample_questions: [
          "How do you build a pipeline for hard-to-fill roles?",
          "What metrics do you use to measure recruiting effectiveness?",
        ],
        level_descriptors: {
          basic: "Posts jobs, screens resumes, schedules interviews",
          intermediate: "Sources proactively, manages full recruitment cycles",
          advanced: "Builds recruiting strategies, manages employer brand",
          expert: "Designs talent acquisition functions, leads TA teams",
        },
      },
      {
        name: "Compensation & Benefits",
        category: "hard_skill",
        description: "Designing and managing total rewards programs",
        sample_questions: [
          "How do you approach building a comp structure for a growing company?",
          "Describe your experience with pay equity analysis.",
        ],
        level_descriptors: {
          basic: "Administers existing comp programs",
          intermediate: "Conducts market benchmarking, manages annual cycles",
          advanced: "Designs comp strategies, handles executive compensation",
          expert: "Leads total rewards strategy, manages equity programs",
        },
      },
      {
        name: "HRIS & People Analytics",
        category: "hard_skill",
        description: "Using HR technology and data to drive decisions",
        sample_questions: [
          "How do you use data to identify retention risks?",
          "What HR metrics do you track regularly and why?",
        ],
        level_descriptors: {
          basic: "Uses HRIS for basic record-keeping and reports",
          intermediate: "Builds dashboards, analyzes workforce trends",
          advanced: "Designs analytics programs, predicts workforce needs",
          expert: "Builds people analytics functions, influences strategy with data",
        },
      },
    ],
    soft_skills: [
      {
        name: "Conflict Resolution",
        category: "soft_skill",
        description: "Mediating disputes and navigating sensitive employee situations",
        sample_questions: [
          "Describe a difficult employee conflict you helped resolve.",
          "How do you approach a conversation with an underperforming manager?",
        ],
        level_descriptors: {
          basic: "Facilitates basic discussions between parties",
          intermediate: "Mediates conflicts independently, de-escalates effectively",
          advanced: "Handles complex, high-stakes employee situations",
          expert: "Develops conflict resolution programs, coaches leaders",
        },
      },
      {
        name: "Confidentiality & Trust",
        category: "soft_skill",
        description: "Maintaining confidentiality and building organizational trust",
        sample_questions: [
          "How do you handle a situation where maintaining confidentiality conflicts with transparency?",
          "Describe how you've built trust with skeptical employees.",
        ],
        level_descriptors: {
          basic: "Maintains confidentiality as instructed",
          intermediate: "Navigates confidentiality boundaries independently",
          advanced: "Builds trust across the organization, handles sensitive information wisely",
          expert: "Sets confidentiality standards, advises on the most sensitive matters",
        },
      },
      {
        name: "Change Management",
        category: "soft_skill",
        description: "Leading organizational change initiatives effectively",
        sample_questions: [
          "Describe a major organizational change you helped implement.",
          "How do you manage resistance to change?",
        ],
        level_descriptors: {
          basic: "Supports change efforts as directed",
          intermediate: "Manages communication and rollout for changes",
          advanced: "Leads complex change initiatives, influences adoption",
          expert: "Designs change management frameworks, leads transformations",
        },
      },
    ],
    sub_niches: [
      {
        id: "recruiting",
        label: "Recruiting / TA",
        additional_skills: ["Sourcing Techniques", "ATS Management", "Candidate Experience", "Offer Negotiation"],
        interview_hints: "Focus on sourcing creativity, pipeline metrics, and candidate experience approach.",
      },
      {
        id: "people_ops",
        label: "People Operations",
        additional_skills: ["Onboarding Design", "Employee Lifecycle Management", "HR Tech Stack", "Process Automation"],
        interview_hints: "Focus on operational efficiency, scalability, and employee experience design.",
      },
      {
        id: "l_and_d",
        label: "Learning & Development",
        additional_skills: ["Training Design", "Leadership Development", "LMS Management", "ROI Measurement"],
        interview_hints: "Focus on program design methodology, measuring learning impact, and needs assessment.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // EDUCATION
  // ──────────────────────────────────────────────────────
  education: {
    id: "education",
    label: "Education",
    icon: "🎓",
    description: "Teaching, academic administration, EdTech, and training roles",
    interview_context: {
      persona:
        "You are an experienced academic administrator or school leader. You care about pedagogical skill, student outcomes, and the ability to engage diverse learners.",
      tone: "Warm and supportive, but probing for real classroom/program impact.",
      domain_terminology: [
        "curriculum", "pedagogy", "differentiated instruction", "assessment",
        "IEP", "scaffolding", "formative assessment", "student outcomes",
        "classroom management", "learning objectives", "accreditation",
      ],
      red_flags_to_probe: [
        "No evidence of student outcome measurement",
        "One-size-fits-all teaching approach",
        "Inability to describe handling struggling students",
        "No mention of professional development or growth",
      ],
      what_great_looks_like:
        "Strong candidates describe specific student impact, demonstrate adaptability in teaching methods, show passion for learning, and can articulate how they measure and improve outcomes.",
    },
    hard_skills: [
      {
        name: "Curriculum Design",
        category: "hard_skill",
        description: "Developing learning objectives, lesson plans, and educational content",
        sample_questions: [
          "Walk me through your process for designing a new unit of study.",
          "How do you align curriculum with standards while keeping it engaging?",
        ],
        level_descriptors: {
          basic: "Follows existing curriculum with minor adaptations",
          intermediate: "Designs units and lessons aligned to standards",
          advanced: "Creates comprehensive curricula with differentiation",
          expert: "Develops curriculum frameworks, leads curriculum adoption",
        },
      },
      {
        name: "Assessment Design",
        category: "hard_skill",
        description: "Creating and using assessments to measure and improve learning",
        sample_questions: [
          "How do you use formative assessments to guide instruction?",
          "Describe your approach to creating fair, meaningful assessments.",
        ],
        level_descriptors: {
          basic: "Uses provided assessments, grades accurately",
          intermediate: "Creates aligned assessments, analyzes results",
          advanced: "Designs comprehensive assessment systems, uses data to inform instruction",
          expert: "Leads assessment strategy, develops rubrics and evaluation frameworks",
        },
      },
      {
        name: "Educational Technology",
        category: "hard_skill",
        description: "Leveraging technology to enhance learning outcomes",
        sample_questions: [
          "How do you decide which technology tools to use in your teaching?",
          "Describe a time technology significantly improved student engagement or outcomes.",
        ],
        level_descriptors: {
          basic: "Uses basic edtech tools (LMS, presentation software)",
          intermediate: "Integrates multiple tools effectively, troubleshoots",
          advanced: "Leads edtech adoption, evaluates new tools",
          expert: "Shapes institutional technology strategy for learning",
        },
      },
      {
        name: "Classroom Management",
        category: "hard_skill",
        description: "Creating and maintaining productive learning environments",
        sample_questions: [
          "Describe your classroom management philosophy and how it plays out in practice.",
          "How do you handle a consistently disruptive student?",
        ],
        level_descriptors: {
          basic: "Maintains order with established systems",
          intermediate: "Develops effective management strategies independently",
          advanced: "Creates positive learning environments, handles complex behaviors",
          expert: "Mentors others on management, develops school-wide behavior systems",
        },
      },
    ],
    soft_skills: [
      {
        name: "Student Engagement",
        category: "soft_skill",
        description: "Motivating and engaging diverse learners",
        sample_questions: [
          "How do you reach a student who's disengaged or struggling?",
          "Describe your most effective strategy for making content accessible to all learners.",
        ],
        level_descriptors: {
          basic: "Uses standard engagement techniques",
          intermediate: "Adapts approach for different learner needs",
          advanced: "Creates innovative, highly engaging learning experiences",
          expert: "Inspires a culture of engagement across the institution",
        },
      },
      {
        name: "Parent & Family Communication",
        category: "soft_skill",
        description: "Building productive relationships with families and guardians",
        sample_questions: [
          "How do you handle a difficult conversation with a parent about their child's performance?",
          "Describe your approach to keeping families informed and involved.",
        ],
        level_descriptors: {
          basic: "Communicates through standard channels",
          intermediate: "Proactively engages families, handles concerns diplomatically",
          advanced: "Builds strong family partnerships, navigates conflict",
          expert: "Develops family engagement programs and strategies",
        },
      },
      {
        name: "Adaptability",
        category: "soft_skill",
        description: "Adjusting teaching approach based on student needs, feedback, and context",
        sample_questions: [
          "Describe a time you had to completely change your plan mid-lesson or mid-unit.",
          "How do you differentiate instruction for a wide range of ability levels?",
        ],
        level_descriptors: {
          basic: "Adjusts when prompted",
          intermediate: "Reads the room and adapts in real-time",
          advanced: "Systematically differentiates for diverse needs",
          expert: "Develops adaptive teaching frameworks for others",
        },
      },
    ],
    sub_niches: [
      {
        id: "k12",
        label: "K-12 Education",
        additional_skills: ["IEP Implementation", "State Standards Alignment", "Student Behavior Plans", "Standardized Test Prep"],
        interview_hints: "Focus on differentiation, student growth measurement, and collaboration with specialists.",
      },
      {
        id: "higher_ed",
        label: "Higher Education",
        additional_skills: ["Research Methodology", "Grant Writing", "Academic Advising", "Accreditation"],
        interview_hints: "Probe for teaching philosophy, research integration, and student mentorship.",
      },
      {
        id: "edtech",
        label: "EdTech",
        additional_skills: ["Learning Design", "User Research with Educators", "Gamification", "Analytics for Learning"],
        interview_hints: "Balance educational expertise with product/technical thinking.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // OPERATIONS & LOGISTICS
  // ──────────────────────────────────────────────────────
  operations: {
    id: "operations",
    label: "Operations & Logistics",
    icon: "🏭",
    description: "Supply chain, manufacturing, logistics, project management, and operations roles",
    interview_context: {
      persona:
        "You are a COO or VP of Operations. You value efficiency, process thinking, and data-driven decision-making. Probe for how candidates optimize, measure, and improve.",
      tone: "Practical and process-oriented — show me the numbers.",
      domain_terminology: [
        "throughput", "lead time", "cycle time", "inventory turns",
        "lean", "six sigma", "kaizen", "OEE", "WMS", "TMS",
        "supply chain", "procurement", "capacity planning",
      ],
      red_flags_to_probe: [
        "No metrics or KPIs to describe performance",
        "Inability to describe process improvement methodology",
        "No experience with cross-functional coordination",
        "Reactive rather than proactive approach",
      ],
      what_great_looks_like:
        "Strong candidates quantify improvements, demonstrate systematic problem-solving, show they think about end-to-end processes, and can balance efficiency with quality.",
    },
    hard_skills: [
      {
        name: "Process Improvement",
        category: "hard_skill",
        description: "Identifying and eliminating waste, improving efficiency (Lean, Six Sigma)",
        sample_questions: [
          "Walk me through a process improvement you led from problem identification to results.",
          "How do you decide which processes to optimize first?",
        ],
        level_descriptors: {
          basic: "Identifies obvious inefficiencies, suggests improvements",
          intermediate: "Leads improvement projects using structured methodology",
          advanced: "Drives significant operational improvements, coaches teams",
          expert: "Builds continuous improvement culture, leads transformation programs",
        },
      },
      {
        name: "Supply Chain Management",
        category: "hard_skill",
        description: "Managing the end-to-end supply chain from sourcing to delivery",
        sample_questions: [
          "How do you manage supplier relationships to ensure reliability?",
          "Describe a supply chain disruption you navigated and what you learned.",
        ],
        level_descriptors: {
          basic: "Manages routine supplier orders and logistics",
          intermediate: "Optimizes supply chain operations, manages relationships",
          advanced: "Designs supply chain strategies, handles global complexity",
          expert: "Leads supply chain transformation, builds resilient networks",
        },
      },
      {
        name: "Project Management",
        category: "hard_skill",
        description: "Planning, executing, and delivering projects on time and budget",
        sample_questions: [
          "How do you handle a project that's falling behind schedule?",
          "Describe your approach to stakeholder management on complex projects.",
        ],
        level_descriptors: {
          basic: "Manages simple projects with established plans",
          intermediate: "Plans and executes projects independently, manages risks",
          advanced: "Leads complex, cross-functional projects",
          expert: "Develops PMO practices, manages portfolio of programs",
        },
      },
      {
        name: "Data-Driven Operations",
        category: "hard_skill",
        description: "Using metrics, dashboards, and analytics to drive operational decisions",
        sample_questions: [
          "What KPIs do you track daily and why?",
          "Describe how data analysis led to a significant operational improvement.",
        ],
        level_descriptors: {
          basic: "Reads reports, tracks assigned KPIs",
          intermediate: "Builds dashboards, analyzes trends, makes recommendations",
          advanced: "Designs measurement frameworks, drives data-driven culture",
          expert: "Builds analytics-driven operations functions",
        },
      },
    ],
    soft_skills: [
      {
        name: "Cross-functional Coordination",
        category: "soft_skill",
        description: "Working across teams and departments to deliver operational outcomes",
        sample_questions: [
          "Describe a time you had to align multiple departments around an operational change.",
          "How do you handle competing priorities from different teams?",
        ],
        level_descriptors: {
          basic: "Communicates needs across teams",
          intermediate: "Coordinates cross-functional efforts effectively",
          advanced: "Leads complex cross-functional initiatives",
          expert: "Builds organizational alignment mechanisms",
        },
      },
      {
        name: "Problem-Solving Under Pressure",
        category: "soft_skill",
        description: "Making good decisions quickly when things go wrong",
        sample_questions: [
          "Describe an operational crisis and how you handled it.",
          "How do you balance speed with thoroughness in urgent situations?",
        ],
        level_descriptors: {
          basic: "Follows escalation procedures under pressure",
          intermediate: "Resolves common issues quickly and effectively",
          advanced: "Leads incident response, makes high-stakes decisions",
          expert: "Develops crisis response frameworks, trains teams",
        },
      },
    ],
    sub_niches: [
      {
        id: "manufacturing",
        label: "Manufacturing",
        additional_skills: ["Production Scheduling", "Quality Control", "Equipment Maintenance", "Safety Compliance (OSHA)"],
        interview_hints: "Focus on production metrics, quality systems, and safety record.",
      },
      {
        id: "logistics",
        label: "Logistics & Distribution",
        additional_skills: ["Route Optimization", "Warehouse Management", "Last Mile Delivery", "Freight Management"],
        interview_hints: "Focus on cost optimization, delivery performance, and technology adoption.",
      },
      {
        id: "procurement",
        label: "Procurement & Sourcing",
        additional_skills: ["Vendor Evaluation", "Contract Negotiation", "Category Management", "Cost Reduction"],
        interview_hints: "Focus on negotiation outcomes, supplier development, and cost savings achieved.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // DESIGN & CREATIVE
  // ──────────────────────────────────────────────────────
  design: {
    id: "design",
    label: "Design & Creative",
    icon: "🎨",
    description: "UX/UI design, graphic design, product design, and creative direction roles",
    interview_context: {
      persona:
        "You are a Head of Design evaluating creative talent. You care about process, user empathy, and craft. Probe for their design thinking approach, not just visual skills.",
      tone: "Curious and exploratory — great designers love talking about their process.",
      domain_terminology: [
        "user research", "wireframe", "prototype", "design system",
        "usability testing", "information architecture", "accessibility",
        "visual hierarchy", "interaction design", "design critique",
      ],
      red_flags_to_probe: [
        "Designs without user research or validation",
        "Cannot articulate design rationale beyond aesthetics",
        "No mention of collaboration with engineering/product",
        "Portfolio without process documentation",
      ],
      what_great_looks_like:
        "Strong candidates walk through their design process clearly, demonstrate user empathy backed by research, show they iterate based on feedback, and collaborate well with engineering and product.",
    },
    hard_skills: [
      {
        name: "User Research",
        category: "hard_skill",
        description: "Conducting and synthesizing user research to inform design decisions",
        sample_questions: [
          "How do you decide what research methods to use for a project?",
          "Describe a time when research completely changed your design direction.",
        ],
        level_descriptors: {
          basic: "Conducts basic interviews and surveys",
          intermediate: "Plans and executes research independently, synthesizes findings",
          advanced: "Designs research programs, uses mixed methods",
          expert: "Builds research practices for organizations, innovates on methods",
        },
      },
      {
        name: "Prototyping & Interaction Design",
        category: "hard_skill",
        description: "Creating interactive prototypes to test and communicate design ideas",
        sample_questions: [
          "What's your prototyping process? When do you go low-fi vs high-fi?",
          "How do you balance prototyping speed with fidelity?",
        ],
        level_descriptors: {
          basic: "Creates basic wireframes and mockups",
          intermediate: "Builds interactive prototypes, uses design tools proficiently",
          advanced: "Creates complex prototypes with micro-interactions and animations",
          expert: "Pushes the boundaries of prototyping tools, develops interaction patterns",
        },
      },
      {
        name: "Design Systems",
        category: "hard_skill",
        description: "Building and maintaining consistent, scalable design systems",
        sample_questions: [
          "How do you approach building a design system from scratch?",
          "How do you balance consistency with flexibility in a design system?",
        ],
        level_descriptors: {
          basic: "Uses existing design systems and component libraries",
          intermediate: "Contributes components, maintains documentation",
          advanced: "Builds design systems, defines standards and governance",
          expert: "Leads design system strategy, drives adoption across organizations",
        },
      },
      {
        name: "Visual Design & Typography",
        category: "hard_skill",
        description: "Creating aesthetically excellent designs with strong visual hierarchy",
        sample_questions: [
          "How do you make typography decisions for a project?",
          "Describe your approach to creating visual hierarchy in a complex interface.",
        ],
        level_descriptors: {
          basic: "Applies basic design principles consistently",
          intermediate: "Creates polished designs with clear hierarchy",
          advanced: "Develops sophisticated visual languages and brand aesthetics",
          expert: "Sets creative direction, innovates on visual design",
        },
      },
    ],
    soft_skills: [
      {
        name: "Design Thinking",
        category: "soft_skill",
        description: "Applying human-centered design process to solve problems",
        sample_questions: [
          "Walk me through how you approach a new design challenge from scratch.",
          "How do you balance user needs with business goals and technical constraints?",
        ],
        level_descriptors: {
          basic: "Follows design thinking frameworks with guidance",
          intermediate: "Applies design thinking independently to projects",
          advanced: "Leads design thinking for complex, ambiguous problems",
          expert: "Evangelizes and teaches design thinking across the organization",
        },
      },
      {
        name: "Giving & Receiving Critique",
        category: "soft_skill",
        description: "Participating constructively in design reviews and feedback",
        sample_questions: [
          "How do you handle feedback you disagree with?",
          "Describe your approach to leading a design critique.",
        ],
        level_descriptors: {
          basic: "Accepts feedback gracefully, gives basic input",
          intermediate: "Gives constructive feedback, incorporates critique well",
          advanced: "Leads productive critiques, balances perspectives",
          expert: "Builds feedback culture, mentors on giving critique",
        },
      },
      {
        name: "Stakeholder Management",
        category: "soft_skill",
        description: "Communicating design decisions and managing expectations",
        sample_questions: [
          "How do you present design work to non-design stakeholders?",
          "Describe a time you had to push back on a stakeholder's design request.",
        ],
        level_descriptors: {
          basic: "Presents work clearly to immediate team",
          intermediate: "Manages stakeholder expectations, justifies decisions",
          advanced: "Influences at leadership level, drives design decisions",
          expert: "Shapes organizational design culture and strategy",
        },
      },
    ],
    sub_niches: [
      {
        id: "ux_design",
        label: "UX Design",
        additional_skills: ["Usability Testing", "Information Architecture", "Journey Mapping", "Accessibility (WCAG)"],
        interview_hints: "Focus on research-driven decisions, usability testing results, and iteration process.",
      },
      {
        id: "product_design",
        label: "Product Design",
        additional_skills: ["Product Strategy", "Metrics-Informed Design", "Cross-functional Collaboration", "Prioritization"],
        interview_hints: "Probe for product thinking, metrics awareness, and end-to-end ownership.",
      },
      {
        id: "brand_design",
        label: "Brand & Graphic Design",
        additional_skills: ["Brand Identity Systems", "Print Production", "Motion Graphics", "Art Direction"],
        interview_hints: "Focus on creative vision, brand consistency, and execution craft.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // CUSTOMER SUCCESS & SUPPORT
  // ──────────────────────────────────────────────────────
  customer_success: {
    id: "customer_success",
    label: "Customer Success & Support",
    icon: "🤝",
    description: "Customer success, support, account management, and service roles",
    interview_context: {
      persona:
        "You are a VP of Customer Success. You care about retention, expansion, and genuine customer impact. Probe for how candidates balance customer advocacy with business needs.",
      tone: "Empathetic but focused on outcomes and metrics.",
      domain_terminology: [
        "NRR", "churn", "health score", "QBR", "time to value",
        "onboarding", "adoption", "expansion", "renewal", "escalation",
        "CSAT", "NPS", "first response time", "resolution time",
      ],
      red_flags_to_probe: [
        "No metrics for customer outcomes",
        "Cannot describe handling a difficult customer situation",
        "Reactive approach without proactive engagement",
        "No process for identifying at-risk accounts",
      ],
      what_great_looks_like:
        "Strong candidates describe proactive customer engagement, quantify retention and expansion impact, show empathy balanced with business awareness, and demonstrate structured approaches to customer health management.",
    },
    hard_skills: [
      {
        name: "Customer Onboarding",
        category: "hard_skill",
        description: "Guiding new customers from purchase to time-to-value",
        sample_questions: [
          "Walk me through your ideal onboarding process.",
          "How do you measure onboarding success?",
        ],
        level_descriptors: {
          basic: "Follows onboarding playbooks",
          intermediate: "Manages onboarding independently, adapts to customer needs",
          advanced: "Designs onboarding programs, optimizes for time-to-value",
          expert: "Builds scalable onboarding frameworks across segments",
        },
      },
      {
        name: "Account Health Management",
        category: "hard_skill",
        description: "Monitoring and managing customer health scores and risk indicators",
        sample_questions: [
          "How do you identify an at-risk account before they ask to cancel?",
          "What signals do you track to measure customer health?",
        ],
        level_descriptors: {
          basic: "Monitors assigned health scores, escalates red flags",
          intermediate: "Manages portfolio health, takes proactive action",
          advanced: "Designs health scoring models, builds save playbooks",
          expert: "Leads customer health strategy across the organization",
        },
      },
      {
        name: "Technical Troubleshooting",
        category: "hard_skill",
        description: "Diagnosing and resolving product/technical issues for customers",
        sample_questions: [
          "Describe your process for troubleshooting a complex customer issue.",
          "How do you handle a problem you can't solve yourself?",
        ],
        level_descriptors: {
          basic: "Resolves common issues with documentation",
          intermediate: "Diagnoses and resolves complex issues independently",
          advanced: "Identifies systemic issues, contributes to product fixes",
          expert: "Leads technical support strategy, builds knowledge systems",
        },
      },
    ],
    soft_skills: [
      {
        name: "Empathy & De-escalation",
        category: "soft_skill",
        description: "Handling frustrated customers with care and turning situations around",
        sample_questions: [
          "Tell me about a time you turned an angry customer into an advocate.",
          "How do you stay patient during a particularly difficult interaction?",
        ],
        level_descriptors: {
          basic: "Maintains composure during complaints",
          intermediate: "De-escalates effectively, shows genuine empathy",
          advanced: "Turns negative experiences into positive outcomes consistently",
          expert: "Develops de-escalation training, builds customer-centric culture",
        },
      },
      {
        name: "Proactive Communication",
        category: "soft_skill",
        description: "Reaching out before problems arise, keeping customers informed",
        sample_questions: [
          "How do you decide when and how to reach out to customers proactively?",
          "Describe a time proactive outreach prevented a churn event.",
        ],
        level_descriptors: {
          basic: "Responds promptly when contacted",
          intermediate: "Reaches out proactively based on health signals",
          advanced: "Designs proactive engagement programs",
          expert: "Builds proactive customer engagement culture and systems",
        },
      },
    ],
    sub_niches: [
      {
        id: "cs_management",
        label: "Customer Success Management",
        additional_skills: ["QBR Execution", "Expansion Revenue", "Executive Relationships", "Success Planning"],
        interview_hints: "Focus on NRR contribution, strategic account management, and executive engagement.",
      },
      {
        id: "technical_support",
        label: "Technical Support",
        additional_skills: ["Ticket Triage", "Knowledge Base Management", "SLA Management", "Root Cause Analysis"],
        interview_hints: "Focus on troubleshooting methodology, resolution metrics, and knowledge sharing.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // DATA & ANALYTICS
  // ──────────────────────────────────────────────────────
  data_analytics: {
    id: "data_analytics",
    label: "Data & Analytics",
    icon: "📊",
    description: "Data science, analytics, machine learning, and business intelligence roles",
    interview_context: {
      persona:
        "You are a Head of Data evaluating analytical talent. You care about statistical rigor, practical impact, and communication — not just technical skills.",
      tone: "Analytical but practical — the best data people bridge data and business.",
      domain_terminology: [
        "A/B testing", "statistical significance", "feature engineering",
        "data pipeline", "ETL", "ML model", "precision/recall",
        "data warehouse", "dashboarding", "cohort analysis",
      ],
      red_flags_to_probe: [
        "Cannot explain their models or findings to non-technical people",
        "No awareness of bias or data quality issues",
        "Solutions looking for problems rather than business-driven analysis",
        "No experience with production data systems",
      ],
      what_great_looks_like:
        "Strong candidates connect analysis to business impact, demonstrate statistical rigor, communicate findings clearly, and show awareness of data quality and ethical considerations.",
    },
    hard_skills: [
      {
        name: "Statistical Analysis",
        category: "hard_skill",
        description: "Applying statistical methods to draw valid conclusions from data",
        sample_questions: [
          "How do you design and evaluate an A/B test?",
          "Describe a time when your statistical analysis changed a business decision.",
        ],
        level_descriptors: {
          basic: "Applies basic statistical tests with guidance",
          intermediate: "Designs experiments, interprets results independently",
          advanced: "Handles complex statistical modeling, Bayesian methods",
          expert: "Develops statistical frameworks, leads experimentation programs",
        },
      },
      {
        name: "SQL & Data Querying",
        category: "hard_skill",
        description: "Writing efficient queries to extract and transform data",
        sample_questions: [
          "How do you approach optimizing a slow query?",
          "Describe the most complex SQL analysis you've written.",
        ],
        level_descriptors: {
          basic: "Writes basic SELECT, JOIN, GROUP BY queries",
          intermediate: "Handles window functions, CTEs, complex joins",
          advanced: "Optimizes queries at scale, designs efficient data models",
          expert: "Architects data access patterns, mentors on query optimization",
        },
      },
      {
        name: "Machine Learning",
        category: "hard_skill",
        description: "Building and deploying ML models to solve business problems",
        sample_questions: [
          "Walk me through an ML model you built from problem definition to deployment.",
          "How do you decide if a problem needs ML or a simpler approach?",
        ],
        level_descriptors: {
          basic: "Applies standard ML algorithms to clean datasets",
          intermediate: "Builds and evaluates models independently, handles feature engineering",
          advanced: "Deploys production models, handles complex pipelines",
          expert: "Leads ML strategy, develops novel approaches, manages ML systems",
        },
      },
      {
        name: "Data Visualization",
        category: "hard_skill",
        description: "Creating clear, insightful visualizations that drive understanding",
        sample_questions: [
          "How do you decide how to visualize a dataset?",
          "Describe a dashboard you built that drove real business action.",
        ],
        level_descriptors: {
          basic: "Creates basic charts and reports",
          intermediate: "Builds insightful dashboards, chooses appropriate visualizations",
          advanced: "Designs visualization systems, tells compelling data stories",
          expert: "Sets data visualization standards, builds self-service analytics",
        },
      },
    ],
    soft_skills: [
      {
        name: "Business Translation",
        category: "soft_skill",
        description: "Translating business questions into analytical problems and back",
        sample_questions: [
          "How do you ensure your analysis addresses the actual business question?",
          "Describe a time you had to translate a vague request into a concrete analysis plan.",
        ],
        level_descriptors: {
          basic: "Works on well-defined analytical tasks",
          intermediate: "Translates business questions into analyses independently",
          advanced: "Proactively identifies analytical opportunities from business context",
          expert: "Shapes business strategy through analytical leadership",
        },
      },
      {
        name: "Data Storytelling",
        category: "soft_skill",
        description: "Presenting data findings in compelling, actionable narratives",
        sample_questions: [
          "How do you present complex findings to a non-technical audience?",
          "Describe a presentation where your data storytelling changed a decision.",
        ],
        level_descriptors: {
          basic: "Presents findings with basic structure",
          intermediate: "Creates clear narratives with appropriate context",
          advanced: "Delivers compelling data stories that drive action",
          expert: "Builds data-driven decision culture through storytelling",
        },
      },
    ],
    sub_niches: [
      {
        id: "data_science",
        label: "Data Science",
        additional_skills: ["Deep Learning", "NLP", "Computer Vision", "MLOps"],
        interview_hints: "Focus on model selection rationale, feature engineering, and production deployment.",
      },
      {
        id: "analytics_engineering",
        label: "Analytics Engineering",
        additional_skills: ["dbt", "Data Modeling", "Data Quality Testing", "Semantic Layer Design"],
        interview_hints: "Focus on data modeling decisions, transformation logic, and data quality approaches.",
      },
      {
        id: "business_intelligence",
        label: "Business Intelligence",
        additional_skills: ["BI Tools (Tableau/Looker/PowerBI)", "Self-service Analytics", "KPI Framework Design"],
        interview_hints: "Focus on dashboard design philosophy, self-service enablement, and stakeholder management.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────
  // GENERAL / OTHER
  // ──────────────────────────────────────────────────────
  general: {
    id: "general",
    label: "General / Other",
    icon: "🔧",
    description: "Roles that don't fit a specific industry category",
    interview_context: {
      persona:
        "You are a thoughtful hiring manager conducting a well-rounded interview. Adapt your approach based on the specific job description and requirements provided.",
      tone: "Professional, warm, and adaptive to the role.",
      domain_terminology: [],
      red_flags_to_probe: [
        "Vague answers without specific examples",
        "No evidence of measurable impact",
        "Inability to describe growth or learning",
        "Poor self-awareness about strengths and weaknesses",
      ],
      what_great_looks_like:
        "Strong candidates provide specific examples, quantify their impact, demonstrate self-awareness and growth mindset, and show genuine interest in the role.",
    },
    hard_skills: [],
    soft_skills: [
      {
        name: "Communication",
        category: "soft_skill",
        description: "Clear, effective communication across formats and audiences",
        sample_questions: [
          "Describe a situation where clear communication was critical to the outcome.",
          "How do you adapt your communication style for different audiences?",
        ],
        level_descriptors: {
          basic: "Communicates routine information clearly",
          intermediate: "Adapts communication to audience, handles difficult conversations",
          advanced: "Influences through communication, presents at senior levels",
          expert: "Sets communication standards, represents the organization externally",
        },
      },
      {
        name: "Problem-Solving",
        category: "soft_skill",
        description: "Analytical and creative approach to solving challenges",
        sample_questions: [
          "Walk me through how you approach a problem you've never seen before.",
          "Describe the most complex problem you've solved at work.",
        ],
        level_descriptors: {
          basic: "Solves well-defined problems with guidance",
          intermediate: "Tackles ambiguous problems independently",
          advanced: "Solves complex, multi-faceted problems systematically",
          expert: "Develops problem-solving frameworks for organizations",
        },
      },
      {
        name: "Leadership",
        category: "soft_skill",
        description: "Influencing, motivating, and guiding others toward shared goals",
        sample_questions: [
          "Describe a time you led without formal authority.",
          "How do you handle underperforming team members?",
        ],
        level_descriptors: {
          basic: "Contributes positively to team dynamics",
          intermediate: "Takes initiative, influences peers",
          advanced: "Leads teams and projects effectively",
          expert: "Shapes organizational culture and direction",
        },
      },
      {
        name: "Time Management",
        category: "soft_skill",
        description: "Prioritizing effectively and managing multiple responsibilities",
        sample_questions: [
          "How do you prioritize when everything is urgent?",
          "Describe your approach to managing competing deadlines.",
        ],
        level_descriptors: {
          basic: "Meets deadlines with structure and reminders",
          intermediate: "Self-manages priorities effectively",
          advanced: "Manages complex workloads, helps team prioritize",
          expert: "Designs organizational prioritization frameworks",
        },
      },
      {
        name: "Adaptability",
        category: "soft_skill",
        description: "Adjusting to changing conditions, roles, and requirements",
        sample_questions: [
          "Describe a major change at work and how you adapted.",
          "How do you approach learning something completely new?",
        ],
        level_descriptors: {
          basic: "Adjusts to changes when supported",
          intermediate: "Embraces change, learns new skills proactively",
          advanced: "Leads through change, helps others adapt",
          expert: "Drives organizational change, builds adaptive culture",
        },
      },
    ],
    sub_niches: [],
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get sorted list of industries for dropdowns */
export function getIndustryList(): { id: string; label: string; icon: string }[] {
  return Object.values(INDUSTRIES)
    .filter((i) => i.id !== "general")
    .sort((a, b) => a.label.localeCompare(b.label))
    .concat([INDUSTRIES.general]);
}

/** Get all skills (hard + soft) for an industry */
export function getIndustrySkills(industryId: string): IndustrySkill[] {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];
  return [...industry.hard_skills, ...industry.soft_skills];
}

/** Get skills for an industry including sub-niche additions */
export function getIndustrySkillsWithNiche(
  industryId: string,
  nicheId?: string
): { hard_skills: IndustrySkill[]; soft_skills: IndustrySkill[]; niche_skills: string[] } {
  const industry = INDUSTRIES[industryId];
  if (!industry) return { hard_skills: [], soft_skills: [], niche_skills: [] };

  const niche = nicheId
    ? industry.sub_niches.find((n) => n.id === nicheId)
    : undefined;

  return {
    hard_skills: industry.hard_skills,
    soft_skills: industry.soft_skills,
    niche_skills: niche?.additional_skills || [],
  };
}

/** Build interview context for a specific industry + niche combination */
export function buildIndustryInterviewContext(
  industryId: string,
  nicheId?: string
): string {
  const industry = INDUSTRIES[industryId];
  if (!industry) return "";

  const niche = nicheId
    ? industry.sub_niches.find((n) => n.id === nicheId)
    : undefined;

  let context = `INDUSTRY CONTEXT: ${industry.label}\n`;
  context += `${industry.interview_context.persona}\n\n`;
  context += `TONE: ${industry.interview_context.tone}\n\n`;

  if (industry.interview_context.domain_terminology.length > 0) {
    context += `DOMAIN TERMINOLOGY (use naturally in conversation): ${industry.interview_context.domain_terminology.join(", ")}\n\n`;
  }

  context += `RED FLAGS TO PROBE:\n${industry.interview_context.red_flags_to_probe.map((r) => `- ${r}`).join("\n")}\n\n`;
  context += `WHAT GREAT LOOKS LIKE: ${industry.interview_context.what_great_looks_like}\n`;

  if (niche) {
    context += `\nSPECIALIZATION: ${niche.label}\n`;
    context += `${niche.interview_hints}\n`;
    context += `Additional skills to probe: ${niche.additional_skills.join(", ")}\n`;
  }

  return context;
}

/** Build skill assessment rubric for post-interview scoring */
export function buildSkillRubrics(
  skills: { name: string; level: SkillLevel }[],
  industryId: string
): { skill: string; expected_level: string; rubric: string }[] {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];

  const allSkills = [...industry.hard_skills, ...industry.soft_skills];

  return skills.map((req) => {
    const skillDef = allSkills.find(
      (s) => s.name.toLowerCase() === req.name.toLowerCase()
    );
    if (!skillDef) {
      return {
        skill: req.name,
        expected_level: req.level,
        rubric: `Assess the candidate's ${req.name} at the ${req.level} level.`,
      };
    }
    return {
      skill: req.name,
      expected_level: req.level,
      rubric: `Expected: ${skillDef.level_descriptors[req.level]}`,
    };
  });
}
