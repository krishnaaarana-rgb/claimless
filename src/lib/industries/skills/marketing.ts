import type { IndustryDefinition } from "@/lib/industry-skills";

export const marketingIndustry: IndustryDefinition = {
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
      {
        name: "Go-to-Market Strategy",
        category: "hard_skill",
        description: "Planning and executing product launches, market entry strategies, and coordinated GTM motions across marketing, sales, and product",
        sample_questions: [
          "You're launching a new product in a crowded market. Walk me through your GTM plan.",
          "Tell me about a launch that didn't go as planned. What went wrong, what did you learn, and what would you do differently?",
        ],
        level_descriptors: {
          basic: "Supports GTM activities like creating launch assets and updating sales collateral",
          intermediate: "Develops launch plans with timelines, channel strategy, and messaging, coordinates across marketing sub-teams",
          advanced: "Leads cross-functional GTM strategy involving sales enablement, product positioning, pricing input, and channel selection, measures launch impact against business KPIs",
          expert: "Defines repeatable GTM frameworks for the organization, leads multi-product or multi-market launches, shapes company-wide market strategy and competitive positioning",
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
  };
