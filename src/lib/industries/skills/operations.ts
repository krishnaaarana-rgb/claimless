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
