import type { IndustryDefinition } from "@/lib/industry-skills";

export const operationsIndustry: IndustryDefinition = {
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
      {
        name: "Quality Management & Compliance",
        category: "hard_skill",
        description: "Implementing and maintaining quality management systems (ISO 9001, etc.), ensuring regulatory compliance, and driving continuous quality improvement",
        sample_questions: [
          "Walk me through how you'd implement a quality management system from scratch.",
          "You discover a recurring quality issue that's been slipping past inspection for months. What's your approach to fixing the root cause and preventing recurrence?",
        ],
        level_descriptors: {
          basic: "Follows established quality procedures, completes checklists, reports non-conformances",
          intermediate: "Conducts internal audits, manages corrective actions, maintains documentation for regulatory compliance",
          advanced: "Designs QMS frameworks, leads certification efforts (ISO 9001, etc.), implements statistical process control, manages external audit relationships",
          expert: "Builds quality culture across the organization, establishes multi-site quality systems, drives strategic quality initiatives that reduce costs while improving outcomes",
        },
      },
      {
        name: "Lean & Six Sigma",
        category: "hard_skill",
        description: "Applying Lean and Six Sigma methodologies — DMAIC, value stream mapping, waste elimination, and Kaizen events — to systematically improve operational performance",
        sample_questions: [
          "Walk me through a DMAIC project you led. What was the problem, what data did you collect in the Measure phase, and what was the quantified outcome?",
          "You're asked to run a Kaizen event for a process that crosses three departments and none of the department heads think there's a problem. How do you approach it?",
        ],
        level_descriptors: {
          basic: "Understands Lean fundamentals (5S, 7 wastes), participates in Kaizen events and value stream mapping exercises",
          intermediate: "Leads DMAIC projects independently, facilitates value stream mapping sessions, uses statistical tools to identify root causes, delivers measurable waste reduction",
          advanced: "Manages a portfolio of Lean Six Sigma projects, trains Green Belts, designs value stream transformations across multiple processes, integrates Lean thinking into daily management systems",
          expert: "Builds enterprise-wide continuous improvement programs, develops Master Black Belts, shapes operational strategy around Lean principles, delivers sustained multi-million dollar efficiency gains",
        },
      },
      {
        name: "Inventory & Warehouse Management",
        category: "hard_skill",
        description: "Managing warehouse operations, inventory accuracy, and stock control using WMS platforms, cycle counting, and pick/pack optimisation techniques",
        sample_questions: [
          "Your warehouse is consistently hitting 92% inventory accuracy but the business needs 99%. What's your plan to close the gap without shutting down operations for a full count?",
          "You're implementing a new WMS in a facility that's been running on spreadsheets. Walk me through your approach from selection to go-live.",
        ],
        level_descriptors: {
          basic: "Performs cycle counts, follows pick/pack procedures, uses WMS for daily tasks like receiving and putaway",
          intermediate: "Manages stock levels and reorder points, analyses inventory discrepancies, optimises warehouse layouts and pick paths, configures WMS workflows",
          advanced: "Designs inventory control strategies (ABC analysis, safety stock models), leads WMS implementations, optimises warehouse throughput across multiple shifts, builds KPI frameworks for warehouse performance",
          expert: "Architects multi-site warehouse networks, develops inventory optimisation models that balance service levels with carrying costs, leads warehouse automation strategy, builds scalable operations for rapid growth",
        },
      },
      {
        name: "Fleet & Transport Management",
        category: "hard_skill",
        description: "Managing fleet operations including route optimisation, chain of responsibility compliance, fatigue management, and GPS tracking systems",
        sample_questions: [
          "You manage a fleet of 50 vehicles and fuel costs have jumped 25% in a quarter. What levers do you pull to reduce transport costs without impacting delivery SLAs?",
          "A driver has been involved in an incident and the investigation reveals gaps in your fatigue management process. Walk me through your immediate response and longer-term fix.",
        ],
        level_descriptors: {
          basic: "Schedules deliveries, monitors GPS tracking, maintains driver compliance records and vehicle maintenance logs",
          intermediate: "Optimises routes for cost and time, manages fatigue and chain of responsibility compliance, analyses fleet utilisation data, handles incident reporting",
          advanced: "Designs fleet strategies (own vs. contract, hub-and-spoke vs. direct), implements telematics and route optimisation platforms, builds compliance frameworks, manages fleet budgets and total cost of ownership",
          expert: "Leads fleet transformation programs (electrification, autonomous vehicles), builds multi-modal transport networks, develops industry-leading safety and compliance systems, shapes transport strategy at the executive level",
        },
      },
      {
        name: "Facilities Management",
        category: "hard_skill",
        description: "Managing building maintenance, space planning, contractor coordination, and compliance with building codes and regulations",
        sample_questions: [
          "You take over a facility where maintenance has been reactive for years and equipment failures are causing production downtime. How do you transition to a preventive maintenance program?",
          "Your company is growing 30% year-on-year and you need to plan the workspace for the next 3 years. Walk me through your space planning approach.",
        ],
        level_descriptors: {
          basic: "Coordinates day-to-day maintenance requests, manages contractor access, ensures basic compliance with building regulations",
          intermediate: "Implements preventive maintenance schedules, manages space allocation and moves, oversees contractor performance against SLAs, handles facility budgets",
          advanced: "Designs facilities strategies across multiple sites, leads fit-out and refurbishment projects, builds energy efficiency programs, manages BCA compliance and certification processes",
          expert: "Develops enterprise facilities portfolio strategy, leads smart building and sustainability initiatives, builds facilities centres of excellence, manages capital works programs at scale",
        },
      },
      {
        name: "Health & Safety Management",
        category: "hard_skill",
        description: "Building and maintaining WHS management systems, conducting incident investigations, managing risk registers, and ensuring audit readiness",
        sample_questions: [
          "You arrive at a site that has had three recordable injuries in the past month. Walk me through your first 30 days to turn the safety culture around.",
          "A SafeWork audit is scheduled in 6 weeks and you've identified significant gaps in your WHS management system. How do you prioritise and remediate?",
        ],
        level_descriptors: {
          basic: "Conducts workplace inspections, reports hazards and near-misses, follows safe work procedures and participates in toolbox talks",
          intermediate: "Manages risk registers, leads incident investigations using methodologies like ICAM or 5-Whys, delivers safety training, maintains compliance documentation for audits",
          advanced: "Designs WHS management systems aligned to ISO 45001, leads safety culture transformation programs, manages SafeWork audit relationships, builds lead indicator frameworks that drive proactive safety",
          expert: "Sets enterprise safety strategy, builds safety centres of excellence across multiple sites, develops industry-leading safety programs that achieve zero-harm targets, influences regulatory standards",
        },
      },
      {
        name: "Business Continuity",
        category: "hard_skill",
        description: "Developing disaster recovery plans, leading crisis management, and conducting business impact analysis to ensure operational resilience",
        sample_questions: [
          "Your primary distribution centre has just been hit by a flood and will be offline for at least two weeks. Walk me through your first 24 hours and your plan to maintain customer commitments.",
          "You've been asked to build a business continuity program from scratch for a company that has never had one. Where do you start and how do you get executive buy-in?",
        ],
        level_descriptors: {
          basic: "Follows established emergency procedures, participates in business continuity exercises, knows escalation paths and emergency contacts",
          intermediate: "Conducts business impact analyses, develops recovery plans for their area, facilitates tabletop exercises, maintains and tests backup procedures",
          advanced: "Designs enterprise business continuity frameworks, leads crisis management teams during incidents, builds recovery strategies across multiple sites and systems, manages relationships with emergency services and insurers",
          expert: "Builds organisational resilience programs that integrate business continuity, crisis management, and disaster recovery, leads post-crisis transformation, develops industry benchmarks for recovery capability",
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
      {
        name: "Vendor Management",
        category: "soft_skill",
        description: "Selecting, managing, and holding vendors and service providers accountable for performance, cost, and quality",
        sample_questions: [
          "Your most critical vendor just informed you they're raising prices 20% and there's no alternative supplier. How do you handle the negotiation?",
          "How do you evaluate a new vendor beyond just price? Walk me through your assessment process.",
        ],
        level_descriptors: {
          basic: "Communicates requirements to vendors, escalates issues to procurement",
          intermediate: "Manages vendor relationships independently, conducts performance reviews, negotiates standard contracts",
          advanced: "Develops vendor scorecards and SLAs, manages strategic vendor partnerships, leads RFP processes, builds contingency plans for vendor failure",
          expert: "Builds vendor management programs for the organization, develops strategic sourcing strategies, manages executive-level vendor relationships across multiple categories",
        },
      },
      {
        name: "Change Management",
        category: "soft_skill",
        description: "Leading operational changes — new processes, systems, or structures — while maintaining team buy-in and minimizing disruption",
        sample_questions: [
          "You need to roll out a new warehouse management system but the floor team is resistant because they've been doing things the same way for years. How do you approach it?",
          "Tell me about an operational change that failed. What went wrong and what would you do differently?",
        ],
        level_descriptors: {
          basic: "Adapts to changes in processes and tools, helps communicate changes to peers",
          intermediate: "Plans and communicates operational changes, trains teams on new processes, manages transition timelines",
          advanced: "Leads complex change initiatives across multiple teams, builds change champions, measures adoption and addresses resistance systematically",
          expert: "Develops change management frameworks for the organization, leads large-scale transformations (new ERP, facility moves, operating model changes), builds organizational capability for continuous change",
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
  };
