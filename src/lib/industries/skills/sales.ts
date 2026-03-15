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
      {
        name: "Outbound Prospecting",
        category: "hard_skill",
        description: "Cold calling, email sequences, social selling, and list building to generate new business opportunities",
        sample_questions: [
          "Walk me through your outbound sequence for a cold account — how many touches, what channels, and what's your typical reply rate?",
          "You've been given a new territory with zero pipeline. Describe exactly how you'd build your target list and prioritise your first 50 outreaches.",
        ],
        level_descriptors: {
          basic: "Makes cold calls from a provided list, follows a basic email template",
          intermediate: "Builds targeted prospect lists, writes personalised sequences across email and LinkedIn, tracks response rates",
          advanced: "Designs multi-channel cadences with A/B testing, leverages intent data and triggers, consistently converts cold outreach into qualified pipeline",
          expert: "Architects outbound strategy for the team, selects and optimises tooling (Outreach, Apollo, Sales Nav), coaches reps on messaging and cadence design",
        },
      },
      {
        name: "Account Management",
        category: "hard_skill",
        description: "Managing existing customer relationships to drive renewals, expansion revenue, and long-term retention",
        sample_questions: [
          "Tell me about an account where you turned a potential churn into a significant upsell. What was your approach?",
          "How do you build a stakeholder map for a complex enterprise account, and how does that map inform your renewal strategy?",
        ],
        level_descriptors: {
          basic: "Maintains regular contact with key accounts, escalates renewal risks to manager",
          intermediate: "Runs QBRs, identifies upsell opportunities, manages renewals independently with strong retention rates",
          advanced: "Builds multi-threaded relationships across buying committee, drives strategic expansion plans, proactively manages at-risk accounts before churn signals appear",
          expert: "Designs account management frameworks for the business, mentors AMs on strategic account planning, drives net revenue retention above 120%",
        },
      },
      {
        name: "Sales Operations",
        category: "hard_skill",
        description: "Forecasting accuracy, territory design, compensation planning, and process optimisation that enables sales teams to perform",
        sample_questions: [
          "Your CEO asks for a board-ready forecast by Friday and your pipeline data is messy. Walk me through how you produce an accurate number.",
          "You're redesigning territories after a hiring spree doubles the team. How do you balance fairness, coverage, and revenue potential?",
        ],
        level_descriptors: {
          basic: "Pulls reports from CRM, maintains basic dashboards, supports data hygiene",
          intermediate: "Builds forecast models, designs territory maps, administers compensation plans with minimal errors",
          advanced: "Implements weighted and AI-assisted forecasting, designs quota-setting methodologies, optimises sales process bottlenecks with data",
          expert: "Builds the entire sales ops function, selects and integrates tool stacks (CRM, CPQ, BI), acts as strategic partner to CRO on go-to-market planning",
        },
      },
      {
        name: "Channel & Partner Sales",
        category: "hard_skill",
        description: "Recruiting, enabling, and co-selling with channel partners, resellers, and strategic alliances",
        sample_questions: [
          "Describe how you recruited and onboarded a new channel partner from scratch. What made them productive?",
          "A partner is bringing you into a deal but the customer wants to buy direct. How do you handle the channel conflict?",
        ],
        level_descriptors: {
          basic: "Supports existing partner relationships, passes leads to and from partners",
          intermediate: "Recruits new partners, delivers enablement sessions, manages co-sell pipeline with clear deal registration rules",
          advanced: "Designs partner programs with tiered incentives, manages complex co-selling motions across multiple partners, resolves channel conflict diplomatically",
          expert: "Builds and scales the channel strategy as a revenue engine, negotiates strategic alliance agreements, drives partner-sourced revenue as a significant percentage of total bookings",
        },
      },
      {
        name: "Solution Selling",
        category: "hard_skill",
        description: "Selling complex solutions through technical demos, POC management, and multi-stakeholder deal orchestration",
        sample_questions: [
          "Walk me through how you ran a POC that had three competing internal stakeholders with different success criteria. How did you align them?",
          "You're presenting a technical demo to a room split between a CTO who wants depth and a CFO who wants ROI. How do you structure the session?",
        ],
        level_descriptors: {
          basic: "Delivers standard product demos, answers basic technical questions with SE support",
          intermediate: "Tailors demos to buyer personas, manages POCs with clear success criteria, coordinates with solutions engineering",
          advanced: "Architects custom solutions for complex requirements, manages multi-stakeholder evaluation processes, builds compelling business cases with quantified ROI",
          expert: "Defines the solution selling methodology for the org, mentors reps on technical storytelling, closes seven-figure deals with multiple decision-makers and long evaluation cycles",
        },
      },
      {
        name: "Revenue Operations",
        category: "hard_skill",
        description: "Funnel analytics, attribution modelling, and tool stack optimisation that aligns marketing, sales, and customer success around revenue",
        sample_questions: [
          "Marketing says they're generating plenty of MQLs but sales says lead quality is poor. How do you diagnose and fix this with data?",
          "Walk me through how you'd set up attribution modelling for a company running paid, organic, outbound, and partner channels simultaneously.",
        ],
        level_descriptors: {
          basic: "Tracks basic funnel metrics (MQL, SQL, close rate), maintains dashboards in a BI tool",
          intermediate: "Builds end-to-end funnel analytics, identifies conversion bottlenecks, implements lead scoring models",
          advanced: "Designs multi-touch attribution models, optimises handoff SLAs between teams, drives data-informed decisions across marketing and sales leadership",
          expert: "Architects the entire RevOps function, integrates data across CRM/MAP/CS platforms, serves as strategic advisor to the C-suite on go-to-market efficiency",
        },
      },
      {
        name: "Sales Enablement",
        category: "hard_skill",
        description: "Training, playbook creation, competitive intelligence, and objection handling resources that make reps more effective",
        sample_questions: [
          "You've just hired 10 new AEs. Walk me through your 30-60-90 day enablement plan — what do they learn and how do you measure readiness?",
          "A new competitor has entered the market and your reps are losing deals to them. How do you build and roll out a competitive response?",
        ],
        level_descriptors: {
          basic: "Maintains sales collateral library, updates battle cards when prompted",
          intermediate: "Designs onboarding programs, creates playbooks for key sales motions, gathers and distributes competitive intelligence regularly",
          advanced: "Builds certification programs with measurable competency gates, runs win/loss analysis, produces enablement content that measurably improves rep performance",
          expert: "Leads enablement as a strategic function, aligns content with buyer journey and product launches, drives ramp-time reduction and quota attainment uplift across the org",
        },
      },
      {
        name: "Real Estate Sales (AU)",
        category: "hard_skill",
        description: "Australian real estate sales including REA/Domain listings, auction processes, vendor management, and trust accounting compliance",
        sample_questions: [
          "You've listed a property and the vendor's price expectation is $200K above comparable sales. Walk me through how you manage that conversation through to auction day.",
          "A buyer makes a pre-auction offer at a price the vendor would accept. What are the compliance steps and how do you advise the vendor while protecting all parties?",
        ],
        level_descriptors: {
          basic: "Manages property listings on REA and Domain, conducts open homes, handles basic buyer enquiries, understands trust account obligations",
          intermediate: "Runs end-to-end sales campaigns, manages vendor expectations with market evidence, coordinates auction logistics, maintains trust account compliance independently",
          advanced: "Consistently achieves above-reserve auction results, manages complex multi-party negotiations (e.g., off-market, expressions of interest), mentors junior agents, builds a referral-driven business",
          expert: "Top-performing agent with a recognised personal brand, shapes agency strategy, manages high-value portfolios, navigates complex regulatory requirements (REIV, Fair Trading) with confidence",
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
