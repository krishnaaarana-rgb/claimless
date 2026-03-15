import type { IndustryDefinition } from "@/lib/industry-skills";

export const financeIndustry: IndustryDefinition = {
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
  };
