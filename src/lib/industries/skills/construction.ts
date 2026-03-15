import type { IndustryDefinition } from "@/lib/industry-skills";

export const constructionIndustry: IndustryDefinition = {
    id: "construction",
    label: "Construction & Trades",
    icon: "🏗️",
    description: "Construction, building, civil engineering, and skilled trades roles",
    interview_context: {
      persona:
        "You are a seasoned construction industry hiring manager. You understand site operations, safety requirements, project delivery, and trade qualifications. You value practical experience and safety consciousness above all.",
      tone: "Direct and practical — this is an industry where getting things wrong has real consequences.",
      domain_terminology: [
        "SWMS", "WHS", "white card", "site induction", "toolbox talk",
        "take-five", "JSA", "PPE", "scaffold", "formwork", "rebar",
        "practical completion", "defects liability", "variation",
        "RFI", "ITP", "hold point", "witness point", "as-built",
      ],
      red_flags_to_probe: [
        "Vague answers about safety procedures or incident response",
        "No mention of WHS obligations or duty of care",
        "Can't describe chain of responsibility",
        "Lack of practical, hands-on examples",
        "No awareness of environmental or community impact",
      ],
      what_great_looks_like:
        "Strong candidates describe specific site scenarios, demonstrate safety-first thinking, understand chain of responsibility, can discuss project delivery challenges practically, and show trade qualifications with real-world application.",
    },
    hard_skills: [
      {
        name: "WHS & Safety Management",
        category: "hard_skill",
        description: "Workplace health and safety compliance, risk assessment, incident management",
        sample_questions: [
          "Walk me through how you'd conduct a site safety induction for a new subcontractor.",
          "Describe a time you identified a safety hazard on site. What did you do?",
        ],
        level_descriptors: {
          basic: "Holds white card, follows basic safety procedures, wears PPE correctly",
          intermediate: "Can write SWMS, conduct toolbox talks, manage site-specific risks",
          advanced: "Develops WHS management plans, leads incident investigations, manages safety across multiple trades",
          expert: "Implements company-wide safety systems, interfaces with regulators, drives cultural change around safety",
        },
      },
      {
        name: "Project Delivery",
        category: "hard_skill",
        description: "Managing construction projects from planning through practical completion",
        sample_questions: [
          "Tell me about a project that went over budget or behind schedule. How did you recover?",
          "How do you manage variations and scope changes mid-project?",
        ],
        level_descriptors: {
          basic: "Understands project phases, can follow a programme, tracks basic milestones",
          intermediate: "Manages small-medium projects, handles subcontractor coordination, manages RFIs and variations",
          advanced: "Delivers complex multi-trade projects, manages stakeholder relationships, drives programme recovery",
          expert: "Oversees portfolio of projects, sets delivery standards, mentors project managers",
        },
      },
      {
        name: "Trade Technical Skills",
        category: "hard_skill",
        description: "Hands-on trade competency — specific to the trade (electrical, plumbing, carpentry, etc.)",
        sample_questions: [
          "Walk me through a complex job you completed recently. What made it challenging?",
          "What's the most common mistake you see in your trade, and how do you prevent it?",
        ],
        level_descriptors: {
          basic: "Apprentice level, works under supervision, learning core techniques",
          intermediate: "Qualified tradesperson, works independently, handles standard jobs confidently",
          advanced: "Handles complex/non-standard work, mentors apprentices, troubleshoots difficult problems",
          expert: "Recognised specialist, consulted on complex jobs, can design solutions for unusual requirements",
        },
      },
      {
        name: "Reading Plans & Specifications",
        category: "hard_skill",
        description: "Interpreting construction drawings, specifications, and technical documentation",
        sample_questions: [
          "How do you handle a discrepancy between the drawings and the specs?",
          "Describe a time you caught an error in the plans before it became a problem on site.",
        ],
        level_descriptors: {
          basic: "Can read basic floor plans and elevations",
          intermediate: "Interprets detailed construction drawings, cross-references specs",
          advanced: "Reviews shop drawings, identifies clashes, coordinates across disciplines",
          expert: "Manages BIM coordination, reviews complex structural/services drawings",
        },
      },
      {
        name: "Budget & Cost Control",
        category: "hard_skill",
        description: "Managing project budgets, tracking costs against estimates, and controlling expenditure across the project lifecycle",
        sample_questions: [
          "Your project is trending 15% over budget at the halfway point. Walk me through your recovery plan.",
          "How do you handle a subcontractor who submits a variation claim you believe is inflated? Walk me through the conversation and process.",
        ],
        level_descriptors: {
          basic: "Tracks costs against a budget provided by others, flags overruns to supervisor",
          intermediate: "Prepares cost reports, manages variations and claims, forecasts costs to completion with reasonable accuracy",
          advanced: "Develops project budgets from first principles, negotiates subcontractor packages, implements cost-saving initiatives without compromising quality or safety",
          expert: "Manages cost control across a portfolio of projects, establishes estimating benchmarks, leads value engineering exercises, shapes commercial strategy for the business",
        },
      },
      {
        name: "Quality Management",
        category: "hard_skill",
        description: "Ensuring construction work meets specifications, standards, and client expectations through inspection, testing, and documentation",
        sample_questions: [
          "You discover a major defect that will need rework. How do you handle it with the client?",
          "Walk me through your quality assurance process for a critical structural element — from ITP to sign-off.",
        ],
        level_descriptors: {
          basic: "Follows ITPs and checklists, reports defects to supervisor, understands basic hold and witness points",
          intermediate: "Manages quality documentation independently, conducts inspections, coordinates testing, issues non-conformance reports",
          advanced: "Develops project-specific quality management plans, manages defects registers, negotiates with clients on acceptable tolerances, drives quality culture on site",
          expert: "Establishes company-wide quality systems (ISO 9001), leads quality audits, mentors teams on quality practices, manages complex defects liability periods across multiple projects",
        },
      },
    ],
    soft_skills: [
      {
        name: "Site Leadership",
        category: "soft_skill",
        description: "Leading teams on site, managing subcontractors, maintaining productivity and morale",
        sample_questions: [
          "How do you handle a subcontractor who's not meeting quality standards?",
          "Tell me about managing a difficult situation between trades on site.",
        ],
        level_descriptors: {
          basic: "Works well in a team, follows instructions, communicates clearly",
          intermediate: "Leads small crews, coordinates daily tasks, handles basic conflicts",
          advanced: "Manages multiple subcontractors, drives productivity, resolves complex disputes",
          expert: "Sets site culture, manages large teams across multiple fronts, mentors foremen",
        },
      },
      {
        name: "Problem Solving Under Pressure",
        category: "soft_skill",
        description: "Making decisions quickly when things go wrong on site",
        sample_questions: [
          "You discover a major defect that will delay the programme by 2 weeks. The client is expecting handover. What do you do?",
          "It's 6am, your crane operator calls in sick, and you have a critical lift today. Walk me through your next steps.",
        ],
        level_descriptors: {
          basic: "Escalates problems appropriately, stays calm",
          intermediate: "Develops workarounds, communicates impacts, keeps work progressing",
          advanced: "Finds creative solutions under pressure, manages stakeholder expectations during crises",
          expert: "Anticipates problems before they occur, builds contingency into plans, mentors others in crisis management",
        },
      },
      {
        name: "Subcontractor Management",
        category: "soft_skill",
        description: "Selecting, coordinating, and holding subcontractors accountable for performance, quality, and schedule",
        sample_questions: [
          "A subcontractor is consistently delivering poor quality work but they're the only one available for the next 3 months. How do you manage this?",
          "You have three trades that all need access to the same area next week. Walk me through how you coordinate the sequencing.",
        ],
        level_descriptors: {
          basic: "Communicates tasks to subcontractors clearly, reports issues to supervisor",
          intermediate: "Coordinates daily work across multiple subs, manages quality expectations, handles routine disputes",
          advanced: "Negotiates subcontractor packages, manages complex trade interfaces, holds subs accountable through contractual mechanisms while maintaining working relationships",
          expert: "Builds preferred subcontractor panels, develops subcontractor performance management systems, manages strategic trade partner relationships across multiple projects",
        },
      },
      {
        name: "Safety Culture Leadership",
        category: "soft_skill",
        description: "Going beyond compliance to build a genuine safety-first culture where workers feel empowered to stop unsafe work",
        sample_questions: [
          "How do you get a crew of experienced tradies who think safety is 'just paperwork' to genuinely buy into safety culture?",
          "A worker reports a near-miss but the foreman wants to brush it off to avoid paperwork. What do you do?",
        ],
        level_descriptors: {
          basic: "Follows safety rules personally, speaks up about obvious hazards",
          intermediate: "Leads toolbox talks, encourages others to report hazards, models safe behaviour consistently",
          advanced: "Builds safety engagement on site through positive reinforcement, investigates incidents for root causes not blame, creates an environment where workers stop unsafe work without fear",
          expert: "Transforms safety culture across projects and organisations, develops safety leadership programs, drives industry-leading safety performance metrics",
        },
      },
    ],
    sub_niches: [
      {
        id: "residential",
        label: "Residential Construction",
        additional_skills: ["NCC/BCA compliance", "Client handover", "Warranty management"],
        interview_hints: "Focus on homeowner relationship management, defects liability, and finishing quality. Ask about managing client expectations during builds.",
      },
      {
        id: "commercial",
        label: "Commercial Construction",
        additional_skills: ["Stakeholder management", "EBA/Award knowledge", "Environmental management"],
        interview_hints: "Focus on programme management, multi-trade coordination, and working within strict procurement and compliance frameworks.",
      },
      {
        id: "civil",
        label: "Civil & Infrastructure",
        additional_skills: ["Earthworks", "Survey", "Environmental approvals", "Traffic management"],
        interview_hints: "Focus on large-scale logistics, environmental management, community impact, and working with government/council stakeholders.",
      },
    ],
  };
