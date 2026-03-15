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
      {
        name: "Social Media Management",
        category: "hard_skill",
        description: "Developing platform-specific strategies, managing communities, running paid social campaigns, and building influencer partnerships to grow brand presence and engagement",
        sample_questions: [
          "Your brand's organic social reach has dropped 40% over six months despite consistent posting. Walk me through how you'd diagnose the issue and rebuild the strategy across platforms.",
          "A mid-tier influencer with a highly engaged audience in your niche approaches you for a partnership. How do you evaluate the opportunity, structure the deal, and measure ROI?",
        ],
        level_descriptors: {
          basic: "Creates and schedules social content using tools like Later or Hootsuite, monitors comments and messages, and reports on basic engagement metrics (likes, reach, followers)",
          intermediate: "Develops platform-specific content strategies, manages community engagement and moderation, runs paid social campaigns with targeting and budget management, and identifies and briefs influencer partnerships",
          advanced: "Leads social media strategy across all platforms, builds and manages influencer programs at scale, integrates social with broader marketing campaigns, manages social during crisis situations, and ties social performance to business KPIs",
          expert: "Shapes the organisation's social media and community strategy at executive level, pioneers new platform adoption, builds social commerce capabilities, develops creator economy partnerships, and leads social listening and insights programs that inform product and brand decisions",
        },
      },
      {
        name: "Email Marketing",
        category: "hard_skill",
        description: "Designing segmented email campaigns, building automation flows, managing deliverability, running A/B tests, and orchestrating lifecycle campaigns to drive engagement and revenue",
        sample_questions: [
          "Your email open rates have dropped from 35% to 18% over the past quarter and unsubscribe rates are climbing. Walk me through your diagnostic process and recovery plan.",
          "You're building a lifecycle email program for a SaaS product from scratch — onboarding through renewal. Describe your approach to segmentation, cadence, and measuring success.",
        ],
        level_descriptors: {
          basic: "Creates and sends email campaigns using platforms like Mailchimp or HubSpot, maintains subscriber lists, and tracks open and click rates",
          intermediate: "Builds segmented campaigns based on behaviour and demographics, designs multi-step automation flows (welcome series, re-engagement), runs A/B tests on subject lines and content, and manages list hygiene and deliverability",
          advanced: "Architects lifecycle email programs across the full customer journey, implements advanced personalisation and dynamic content, manages sender reputation and deliverability infrastructure, and builds attribution models linking email to revenue",
          expert: "Leads email and CRM strategy at the organisational level, designs cross-channel orchestration (email, SMS, push, in-app), builds predictive segmentation using machine learning, optimises for LTV-based outcomes, and mentors teams on email best practices",
        },
      },
      {
        name: "Event Marketing",
        category: "hard_skill",
        description: "Planning and executing conferences, trade shows, virtual events, and sponsorship programs with measurable ROI aligned to marketing and sales objectives",
        sample_questions: [
          "You're responsible for your company's presence at a major industry conference with a $150K budget. Walk me through your planning process from goal-setting to post-event ROI reporting.",
          "Your annual customer conference needs to pivot to a hybrid format. How do you design the experience to deliver value for both in-person and virtual attendees without doubling the budget?",
        ],
        level_descriptors: {
          basic: "Supports event logistics including venue coordination, registration management, collateral preparation, and on-the-day operations",
          intermediate: "Plans and manages events end-to-end, develops event marketing campaigns to drive attendance, manages sponsor relationships, coordinates speakers, and reports on attendee engagement and lead generation",
          advanced: "Designs the event marketing strategy across the annual calendar, manages large-budget conferences and trade show programs, builds sponsorship packages and revenue models, and measures event ROI against pipeline and revenue targets",
          expert: "Leads the organisation's event and experiential marketing strategy, designs innovative event formats (hybrid, immersive, community-led), builds scalable event operations for global execution, and drives executive alignment on event investment and outcomes",
        },
      },
      {
        name: "Public Relations",
        category: "hard_skill",
        description: "Managing media relations, crafting press releases, handling crisis communications, and training spokespeople to shape brand narrative and reputation",
        sample_questions: [
          "A product defect has gone viral on social media and journalists are calling for comment. You have two hours before the story breaks on a major news site. Walk me through your crisis response.",
          "Your CEO is about to do a live TV interview about a controversial company decision. How do you prepare them, and what guardrails do you put in place?",
        ],
        level_descriptors: {
          basic: "Drafts press releases and media alerts, maintains media contact lists, monitors media coverage, and supports PR events and launches",
          intermediate: "Manages media relationships and pitches stories proactively, coordinates press conferences and media briefings, handles inbound media enquiries, and measures PR impact through coverage analysis and AVE or equivalent metrics",
          advanced: "Develops PR strategy aligned with brand and business objectives, manages crisis communication plans and incident response, trains executives and spokespeople for media appearances, and builds thought leadership programs through earned media",
          expert: "Leads organisational reputation strategy at executive level, manages high-stakes crisis situations with board-level visibility, shapes public policy narratives, builds and manages agency relationships, and integrates PR with content, social, and brand strategy",
        },
      },
      {
        name: "Copywriting & Content Creation",
        category: "hard_skill",
        description: "Creating compelling copy across formats including brand voice development, UX writing, long-form content, video scripts, and multi-channel content production",
        sample_questions: [
          "You join a company with no documented brand voice or tone guidelines. How do you develop them, get buy-in across the organisation, and ensure consistent adoption?",
          "A product team asks you to rewrite the onboarding flow copy — completion rates are 40% and drop-off is highest at step 3. Walk me through your UX writing process.",
        ],
        level_descriptors: {
          basic: "Writes clear copy for standard formats (social posts, blog articles, email), follows existing brand guidelines, and adapts messaging for different audiences",
          intermediate: "Develops content across multiple formats (web copy, video scripts, case studies, white papers), applies brand voice consistently, writes UX copy for product interfaces, and adapts tone for different channels and customer journey stages",
          advanced: "Defines and evolves brand voice and messaging frameworks, produces high-impact content that drives measurable business outcomes, leads content production across teams and agencies, and mentors junior writers on craft and strategy",
          expert: "Shapes organisational content and messaging strategy, builds and leads content teams, creates content systems and processes for scale, pioneers new content formats and channels, and sets the standard for copywriting quality across the business",
        },
      },
      {
        name: "Conversion Rate Optimisation",
        category: "hard_skill",
        description: "Improving conversion rates through landing page optimisation, A/B testing, funnel analysis, and user behaviour analytics to maximise marketing ROI",
        sample_questions: [
          "Your main landing page converts at 2.1% and the industry benchmark is 4.5%. Walk me through your systematic approach to diagnosing the problems and running an optimisation program.",
          "You've been running A/B tests for three months but none have reached statistical significance despite decent traffic. What's going wrong and how do you fix your testing program?",
        ],
        level_descriptors: {
          basic: "Builds landing pages using tools like Unbounce or Instapage, sets up basic A/B tests, uses Google Analytics to review page performance, and implements changes based on best-practice guidelines",
          intermediate: "Conducts funnel analysis to identify drop-off points, designs hypothesis-driven A/B and multivariate tests, uses heatmaps and session recordings (Hotjar, FullStory) to diagnose UX issues, and calculates statistical significance before declaring winners",
          advanced: "Leads a structured CRO program with a prioritised testing roadmap, builds experimentation frameworks (ICE, PIE scoring), integrates qualitative and quantitative research (surveys, user testing, analytics), and ties conversion improvements to revenue impact",
          expert: "Builds and leads the organisation's experimentation culture, designs personalisation and dynamic content strategies, implements server-side testing for complex scenarios, mentors teams on experimentation methodology, and drives a data-informed approach to all customer-facing experiences",
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
