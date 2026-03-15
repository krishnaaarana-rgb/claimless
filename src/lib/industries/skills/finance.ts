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
      {
        name: "Financial Planning & Advice",
        category: "hard_skill",
        description: "Preparing Statements of Advice (SOAs), conducting client reviews, retirement planning, and maintaining FASEA compliance under Australian regulatory standards",
        sample_questions: [
          "Walk me through how you prepare a Statement of Advice for a client approaching retirement, including the research and compliance steps.",
          "A client has received a redundancy payout and wants to maximise their super contribution before preservation age — how do you structure your advice while meeting FASEA Code of Ethics obligations?",
          "How do you handle a situation where best-interest duty conflicts with a product your licensee recommends?",
          "Describe your process for conducting an annual client review and identifying when an SOA versus a Record of Advice is appropriate.",
        ],
        level_descriptors: {
          basic: "Prepares simple SOAs under supervision, understands FASEA Code of Ethics fundamentals and basic super contribution rules",
          intermediate: "Independently prepares compliant SOAs across insurance, super, and investments; conducts client reviews and manages ongoing service agreements",
          advanced: "Handles complex advice scenarios including SMSFs, estate planning, and Centrelink optimisation; mentors junior advisers on compliance",
          expert: "Designs advice frameworks for licensees, leads AFSL compliance programs, shapes policy on best-interest duty interpretation",
        },
      },
      {
        name: "Mortgage & Lending",
        category: "hard_skill",
        description: "Credit assessment, serviceability calculations, responsible lending obligations, and LVR analysis under Australian lending regulations including NCCP Act",
        sample_questions: [
          "A borrower has variable income from contract work and rental properties — walk me through your serviceability assessment and how you document responsible lending inquiries.",
          "How do you assess a loan application with an LVR above 80% and what risk mitigants do you consider, including LMI implications?",
          "Describe a scenario where you declined a loan application based on responsible lending obligations despite the borrower meeting basic credit criteria.",
          "How has the NCCP Act changed your approach to verifying a borrower's financial position compared to relying on declared income?",
        ],
        level_descriptors: {
          basic: "Processes straightforward PAYG applications, understands basic serviceability calculators and LVR thresholds",
          intermediate: "Assesses complex income structures (self-employed, trusts), applies NCCP responsible lending obligations, handles LMI and non-standard scenarios",
          advanced: "Structures commercial and development finance, manages broker relationships, designs credit policy within prudential guidelines",
          expert: "Leads credit risk strategy, interfaces with APRA and ASIC on lending standards, designs portfolio-level serviceability frameworks",
        },
      },
      {
        name: "Superannuation",
        category: "hard_skill",
        description: "Fund administration, member services, investment option management, and APRA regulatory reporting for Australian superannuation funds",
        sample_questions: [
          "A fund member is approaching preservation age and wants to start a transition-to-retirement pension — walk me through the administration steps and tax implications.",
          "How do you ensure accurate APRA reporting for a large super fund, and what controls do you put in place around member data and unit pricing?",
          "Describe your experience managing investment option changes within a super fund, including communication to members and regulatory notifications.",
          "A member disputes their insurance cover within super after a claim is denied — how do you investigate and resolve this while meeting SIS Act obligations?",
        ],
        level_descriptors: {
          basic: "Handles member enquiries, processes contributions and rollovers, understands basic SIS Act requirements and concessional contribution caps",
          intermediate: "Manages fund administration processes including unit pricing, benefit payments, and insurance; prepares APRA statistical returns",
          advanced: "Oversees fund operations, manages trustee reporting obligations, handles complex scenarios like death benefit nominations, binding/non-binding disputes, and SMSF compliance",
          expert: "Leads fund strategy and governance, designs member engagement programs, manages APRA prudential reviews, advises on SIS Act and superannuation reform",
        },
      },
      {
        name: "Treasury & Cash Management",
        category: "hard_skill",
        description: "Liquidity management, FX hedging, interest rate risk management, and capital markets operations within Australian regulatory and banking frameworks",
        sample_questions: [
          "How do you manage a corporate treasury function's daily cash position across multiple bank accounts and currencies, including AUD liquidity forecasting?",
          "Describe a time you implemented an FX hedging strategy for a company with significant USD or CNY exposure — what instruments did you use and how did you measure effectiveness?",
          "Walk me through how you assess and manage interest rate risk on a corporate debt portfolio, including the use of interest rate swaps under ISDA agreements.",
          "Your organisation faces a short-term liquidity crunch — what Australian money market instruments and facilities would you consider, and how do you prioritise them?",
        ],
        level_descriptors: {
          basic: "Manages daily cash positioning, executes FX spot transactions, monitors bank account balances and basic cash flow forecasts",
          intermediate: "Implements hedging strategies using forwards and swaps, manages bank relationships, produces treasury reports and covenant monitoring",
          advanced: "Designs treasury policies, manages complex derivative portfolios, oversees counterparty risk, handles debt capital market transactions",
          expert: "Leads enterprise treasury strategy, manages ALM for financial institutions, advises boards on capital structure and liquidity frameworks under APRA prudential standards",
        },
      },
      {
        name: "Tax Advisory",
        category: "hard_skill",
        description: "Australian individual and corporate tax, GST, FBT, international tax, and ATO compliance including tax disputes and private rulings",
        sample_questions: [
          "A client is restructuring from a sole trader to a company with a family trust — walk me through the CGT, stamp duty, and GST implications under Australian tax law.",
          "How do you manage FBT compliance for an organisation with a large fleet, salary packaging, and entertainment expenses — what are the key traps?",
          "Describe your experience dealing with an ATO audit or tax dispute, including the objection and private ruling process.",
          "A multinational client has transfer pricing arrangements between Australia and Singapore — how do you ensure compliance with the ATO's arm's-length principle and documentation requirements?",
        ],
        level_descriptors: {
          basic: "Prepares individual and basic company tax returns, understands GST registration requirements and BAS lodgement",
          intermediate: "Advises on tax structuring for SMEs, handles FBT returns, manages ATO correspondence, applies Division 7A and CGT provisions",
          advanced: "Manages complex tax advisory including international tax, transfer pricing, and R&D Tax Incentive claims; handles ATO audits and private ruling applications",
          expert: "Leads tax strategy for large corporates or funds, advises on M&A tax structuring, manages ATO disputes at tribunal level, shapes firm-wide technical positions",
        },
      },
      {
        name: "Forensic Accounting",
        category: "hard_skill",
        description: "Fraud investigation, litigation support, expert witness testimony, and financial crime analysis within Australian legal and regulatory frameworks",
        sample_questions: [
          "You are engaged to investigate suspected procurement fraud within an ASX-listed company — describe your approach from scoping to evidence preservation to reporting.",
          "How do you prepare an expert witness report for a commercial litigation matter in the Federal Court, and what are your obligations under the Expert Witness Code of Conduct?",
          "Describe a complex tracing exercise you performed to follow misappropriated funds across multiple entities and jurisdictions.",
          "A whistleblower alleges financial statement manipulation — walk me through how you assess the allegation, what data analytics you apply, and how you report findings to the board's audit committee.",
        ],
        level_descriptors: {
          basic: "Assists with data collection and analysis under supervision, understands basic fraud indicators and evidence handling requirements",
          intermediate: "Conducts fraud investigations independently, prepares litigation support calculations, handles evidence in accordance with Australian legal requirements",
          advanced: "Leads complex multi-entity investigations, prepares and defends expert reports, provides testimony in court or tribunal proceedings",
          expert: "Manages forensic practices, advises boards and regulators on financial crime, designs anti-fraud programs aligned with AS 8001 Fraud and Corruption Control",
        },
      },
      {
        name: "Management Accounting",
        category: "hard_skill",
        description: "Cost analysis, budgeting, variance reporting, and business partnering to support operational decision-making in Australian organisations",
        sample_questions: [
          "How do you structure a monthly management reporting pack that drives actionable decisions, and how do you tailor it for different stakeholders from ops managers to the CFO?",
          "Describe a scenario where your variance analysis uncovered an operational issue that wasn't visible to the business — how did you investigate and communicate it?",
          "Walk me through how you build an annual budget for a multi-site operation, including the process for engaging budget holders and challenging assumptions.",
          "How do you approach activity-based costing in a service business, and how have you used it to influence pricing or resource allocation decisions?",
        ],
        level_descriptors: {
          basic: "Produces standard cost reports and basic variance analysis, assists with budget preparation using established templates",
          intermediate: "Independently manages the budgeting cycle, produces insightful management reports, performs product/service costing and margin analysis",
          advanced: "Acts as a finance business partner to senior leaders, designs costing methodologies, leads rolling forecasts, identifies strategic cost improvement opportunities",
          expert: "Shapes management accounting frameworks for multi-entity groups, leads business transformation from a finance perspective, advises executives on operational performance optimisation",
        },
      },
      {
        name: "ESG & Sustainability Reporting",
        category: "hard_skill",
        description: "Climate risk assessment, TCFD-aligned reporting, sustainability frameworks (ISSB, GRI, ASRS), and green finance within the Australian regulatory landscape",
        sample_questions: [
          "Australia has introduced mandatory climate reporting under the ASRS standards — walk me through how you would prepare a company's first climate-related financial disclosure including Scope 1, 2, and 3 emissions.",
          "How do you conduct a climate scenario analysis aligned with TCFD recommendations, and how do you translate physical and transition risks into financial impacts for board reporting?",
          "Describe your experience integrating ESG metrics into investment decision-making or lending criteria — what frameworks did you use and what challenges did you encounter?",
          "A company wants to issue a green bond in the Australian market — what are the key requirements, assurance considerations, and how do you ensure alignment with the Green Bond Principles?",
        ],
        level_descriptors: {
          basic: "Understands core ESG concepts, assists with data collection for sustainability reports, familiar with GRI and TCFD terminology",
          intermediate: "Prepares sustainability disclosures, calculates carbon emissions across scopes, applies ASRS and ISSB standards to reporting",
          advanced: "Leads climate risk assessments and scenario analysis, designs ESG integration frameworks for investment or lending, manages external assurance processes",
          expert: "Shapes organisational ESG strategy, advises on sustainable finance instruments, engages with regulators on disclosure standards, leads industry working groups on climate risk",
        },
      },
      {
        name: "Payments & Fintech",
        category: "hard_skill",
        description: "Payment processing systems, open banking under CDR, digital wallets, and PCI compliance within the Australian payments ecosystem",
        sample_questions: [
          "Walk me through the end-to-end payment flow for an NPP (New Payments Platform) PayID transaction, and how you would troubleshoot a failed real-time payment.",
          "How does the Consumer Data Right (CDR) framework work in the Australian banking context, and how have you implemented or consumed open banking APIs?",
          "Describe your experience with PCI DSS compliance — how do you scope a PCI environment, and what are the key controls for a merchant processing card-not-present transactions?",
          "A fintech startup wants to offer stored-value wallets and peer-to-peer transfers in Australia — what are the licensing requirements under ASIC and APRA, and how would you design the payment architecture?",
        ],
        level_descriptors: {
          basic: "Understands core payment rails (BECS, eftpos, NPP), basic card processing flows, and fundamental PCI DSS requirements",
          intermediate: "Implements payment integrations, manages CDR data recipient obligations, maintains PCI compliance programs, handles payment reconciliation",
          advanced: "Designs payment architectures, leads open banking implementations, manages relationships with payment schemes and acquirers, oversees fraud detection systems",
          expert: "Shapes payments strategy at enterprise level, advises on new payment scheme participation, leads regulatory submissions to RBA and APRA, drives innovation in real-time payments and digital currency",
        },
      },
      {
        name: "Credit Risk",
        category: "hard_skill",
        description: "Credit scoring, portfolio analysis, provisioning under AASB 9, and stress testing within Australian prudential frameworks",
        sample_questions: [
          "Walk me through how you build and validate a credit scorecard for a retail lending portfolio, including the data inputs and performance metrics you track.",
          "How do you implement expected credit loss (ECL) provisioning under AASB 9, including staging criteria and the use of forward-looking macroeconomic scenarios?",
          "Describe a credit portfolio stress test you designed or participated in — what scenarios did you model, and how did the results inform risk appetite or capital allocation?",
          "A corporate borrower's financial position has deteriorated — walk me through your early warning process, the credit review, and the steps you take from watchlist placement through to potential provisioning or workout.",
        ],
        level_descriptors: {
          basic: "Analyses individual credit applications using established scorecards and policies, understands basic probability of default and loss given default concepts",
          intermediate: "Develops and validates credit models, manages portfolio monitoring and reporting, applies AASB 9 staging criteria and calculates ECL provisions",
          advanced: "Designs credit risk frameworks, leads stress testing programs, manages portfolio-level risk appetite, advises on provisioning methodology and APRA capital adequacy",
          expert: "Leads enterprise credit risk strategy, develops advanced modelling approaches (IRB), manages APRA supervisory interactions, shapes industry credit risk standards and macroprudential responses",
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
