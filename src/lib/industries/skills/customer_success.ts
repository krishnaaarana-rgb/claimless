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
      {
        name: "Implementation & Onboarding",
        category: "hard_skill",
        description: "Managing end-to-end customer implementations including project planning, data migration, training delivery, and go-live support",
        sample_questions: [
          "Walk me through the most complex implementation you've managed. What made it complex and how did you keep it on track?",
          "A customer's data migration is failing halfway through go-live and the executive sponsor is losing confidence. How do you handle the next 48 hours?",
        ],
        level_descriptors: {
          basic: "Follows implementation playbooks, assists with data setup and basic configuration, delivers standard training sessions",
          intermediate: "Manages implementations independently, builds project plans with milestones and dependencies, leads data migration planning, adapts training to customer context",
          advanced: "Leads complex enterprise implementations with multiple workstreams, designs implementation methodologies, manages executive stakeholders through go-live risks, reduces time-to-value through process innovation",
          expert: "Builds scalable implementation programs across customer segments (tech-touch to white-glove), develops implementation IP and frameworks, leads post-implementation reviews that feed back into product and process improvements",
        },
      },
      {
        name: "Churn Prevention",
        category: "hard_skill",
        description: "Building early warning systems, intervention playbooks, save offers, and win-back campaigns to reduce customer churn",
        sample_questions: [
          "You inherit a portfolio with 15% annual churn and no structured save process. Walk me through how you build a churn prevention program from scratch.",
          "A strategic customer tells you they're evaluating competitors and their contract renews in 60 days. What's your playbook?",
        ],
        level_descriptors: {
          basic: "Recognises churn signals (declining usage, support escalations, missed QBRs), escalates at-risk accounts to management",
          intermediate: "Executes save plays from established playbooks, conducts churn risk assessments, leads retention conversations, documents reasons for churn to identify patterns",
          advanced: "Designs early warning systems with leading indicators, builds intervention playbooks for different churn scenarios, creates and manages save offer frameworks, analyses churn cohorts to drive systemic improvements",
          expert: "Builds enterprise churn prevention programs, develops predictive churn models, designs win-back campaigns for churned customers, shapes pricing and packaging strategy based on retention insights",
        },
      },
      {
        name: "Customer Advocacy",
        category: "hard_skill",
        description: "Building customer reference programs, producing case studies, running NPS programs, and fostering community engagement",
        sample_questions: [
          "You need to build a customer reference program but your happiest customers are tired of being asked for favours. How do you create a program that works for both sides?",
          "Your NPS dropped 15 points in a quarter. Walk me through how you investigate the root cause and what you do with the findings.",
        ],
        level_descriptors: {
          basic: "Identifies happy customers for testimonials, collects NPS responses, supports case study interviews",
          intermediate: "Manages a customer reference pipeline, produces case studies end-to-end, runs NPS programs with follow-up workflows, coordinates customer speakers for events",
          advanced: "Builds structured advocacy programs (reference boards, advisory councils, beta communities), designs NPS programs that drive action not just measurement, develops customer marketing partnerships",
          expert: "Develops enterprise advocacy strategy that feeds sales, marketing, and product, builds self-sustaining customer communities, shapes brand perception through customer voice, measures advocacy impact on pipeline and retention",
        },
      },
      {
        name: "Support Operations",
        category: "hard_skill",
        description: "Managing ticketing systems, SLA frameworks, knowledge base content, and escalation processes to deliver consistent support quality",
        sample_questions: [
          "You take over a support team that's consistently missing SLAs and the knowledge base is outdated. Where do you start and how do you prioritise?",
          "Your ticket volume has doubled but headcount is frozen. How do you maintain quality while managing the increased load?",
        ],
        level_descriptors: {
          basic: "Works within ticketing systems, follows SLA guidelines, uses knowledge base articles to resolve common issues, escalates appropriately",
          intermediate: "Manages ticket queues and triage, maintains and improves knowledge base content, tracks SLA performance, identifies recurring issues for root cause resolution",
          advanced: "Designs SLA frameworks and escalation matrices, builds knowledge base strategy and governance, implements support tooling (chatbots, auto-routing, macros), analyses support data to drive product improvements",
          expert: "Builds scalable support operations across channels and tiers, develops self-service strategies that deflect volume while improving CSAT, designs support analytics programs, leads support transformation initiatives",
        },
      },
      {
        name: "Success Planning",
        category: "hard_skill",
        description: "Collaborating with customers on goal setting, business reviews (QBR/EBR), outcome tracking, and stakeholder alignment to drive measurable value",
        sample_questions: [
          "Walk me through how you build a success plan with a new enterprise customer. How do you ensure it doesn't become a document that sits in a drawer?",
          "Your customer's executive sponsor says the QBRs feel like status updates, not strategic conversations. How do you redesign the format?",
        ],
        level_descriptors: {
          basic: "Documents customer goals, prepares basic QBR decks with usage data, tracks action items from business reviews",
          intermediate: "Co-creates success plans with customer stakeholders, runs QBRs that connect product usage to business outcomes, manages outcome tracking against agreed KPIs, aligns internal teams around customer goals",
          advanced: "Designs success planning frameworks for different customer segments, leads EBRs with C-suite that drive strategic alignment, builds outcome measurement methodologies, uses success plans to drive expansion conversations",
          expert: "Builds the success planning function for the CS org, develops frameworks that scale from SMB to enterprise, shapes how the company measures and communicates customer value, influences product strategy through aggregate outcome data",
        },
      },
      {
        name: "Product Feedback Loop",
        category: "hard_skill",
        description: "Systematically capturing feature requests, coordinating beta programs, facilitating user testing, and aligning product and CS teams on customer needs",
        sample_questions: [
          "You have 50 customers asking for different features and product can only build 3 this quarter. How do you prioritise, communicate to customers, and maintain trust with those who don't get what they want?",
          "Product says they need more customer input but your CSMs say they don't have time to run feedback sessions. How do you build a sustainable feedback loop?",
        ],
        level_descriptors: {
          basic: "Logs feature requests accurately, shares customer feedback with product in team channels, recruits customers for surveys and beta programs when asked",
          intermediate: "Categorises and prioritises feature requests with business context (revenue impact, churn risk), manages beta program logistics, facilitates user testing sessions, maintains a feedback repository",
          advanced: "Builds structured product-CS feedback processes, leads customer advisory boards, designs beta programs with clear success criteria, presents aggregated customer insights to product leadership with strategic recommendations",
          expert: "Develops the product feedback function across the CS org, builds systems that connect customer voice to product roadmap decisions at scale, shapes product strategy through customer insights, creates frameworks that align CS and product incentives",
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
