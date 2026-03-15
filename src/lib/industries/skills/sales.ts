import type { IndustryDefinition } from "@/lib/industry-skills";

export const salesIndustry: IndustryDefinition = {
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
  };
