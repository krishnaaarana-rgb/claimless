import type { IndustryDefinition } from "@/lib/industry-skills";

export const customer_successIndustry: IndustryDefinition = {
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
      {
        name: "Revenue Expansion",
        category: "hard_skill",
        description: "Identifying and executing upsell and cross-sell opportunities within existing accounts",
        sample_questions: [
          "Tell me about a time you identified an upsell opportunity. How did you approach the conversation?",
          "How do you balance being a trusted advisor with driving expansion revenue? Walk me through a real example.",
        ],
        level_descriptors: {
          basic: "Recognises when a customer might benefit from additional products, passes leads to sales",
          intermediate: "Identifies expansion opportunities through usage data and QBRs, co-leads commercial conversations with sales",
          advanced: "Owns expansion targets for their book of business, builds business cases for customers, consistently exceeds NRR targets through strategic account growth",
          expert: "Designs expansion playbooks and frameworks for the CS org, builds commercial skills across the team, shapes pricing and packaging strategy based on customer insights",
        },
      },
      {
        name: "Metrics & Analytics",
        category: "hard_skill",
        description: "Tracking, analysing, and acting on customer health metrics and portfolio data",
        sample_questions: [
          "What health metrics do you track? How do you prioritise which accounts need attention?",
          "You notice a segment of customers has a 40% drop in product usage over 30 days. Walk me through your investigation and response.",
        ],
        level_descriptors: {
          basic: "Monitors dashboards for red flags, reports on basic metrics like CSAT and NPS",
          intermediate: "Builds health score models, analyses churn patterns, uses data to prioritise daily actions across their portfolio",
          advanced: "Designs CS metrics frameworks, connects leading indicators to churn prediction, presents portfolio analytics to leadership with actionable recommendations",
          expert: "Builds the CS analytics function, defines company-wide customer health methodology, uses predictive models to drive proactive intervention at scale",
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
      {
        name: "Executive Relationship Building",
        category: "soft_skill",
        description: "Building and maintaining relationships with customer executives and senior stakeholders",
        sample_questions: [
          "Your main champion leaves the company. How do you protect the account and rebuild relationships with the new leadership?",
          "How do you get access to a customer's C-suite when your day-to-day contact is mid-level and protective of the relationship?",
        ],
        level_descriptors: {
          basic: "Communicates professionally with senior contacts when introduced by others",
          intermediate: "Builds rapport with directors and VPs, prepares executive-ready QBR materials, earns trust through reliability",
          advanced: "Develops multi-threaded executive relationships, engages C-suite in strategic conversations about value and roadmap, navigates political dynamics within customer organizations",
          expert: "Serves as a strategic advisor to customer executives, facilitates exec-to-exec relationships between companies, influences customer strategy through deep partnership",
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
  };
