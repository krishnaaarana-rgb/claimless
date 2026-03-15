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
      {
        name: "Estimating & Tendering",
        category: "hard_skill",
        description: "Quantity takeoffs, cost estimation, tender preparation, and margin analysis for construction projects",
        sample_questions: [
          "You're preparing a tender for a $15M commercial fit-out and the submission deadline is in two weeks. Walk me through your estimating process from receiving the documents to submitting the price.",
          "Your tender came in 20% above the client's budget. They ask you to value-engineer. How do you identify savings without compromising quality or transferring risk to subcontractors?",
        ],
        level_descriptors: {
          basic: "Performs basic quantity takeoffs from drawings, obtains subcontractor and supplier quotes, assembles estimates under supervision",
          intermediate: "Prepares complete tenders independently, applies appropriate margins, analyses subcontractor pricing for gaps, presents tenders to clients",
          advanced: "Estimates complex multi-trade projects accurately, leads value engineering, develops estimating databases with historical benchmarks, manages tender risk registers",
          expert: "Sets estimating strategy for the business, mentors estimators, analyses win/loss trends to refine pricing, leads design-and-construct pricing with integrated risk modelling",
        },
      },
      {
        name: "Contract Administration",
        category: "hard_skill",
        description: "Managing progress claims, variations, extensions of time (EOT), and dispute resolution under standard-form contracts (AS 4000, AS 2124, NEC, etc.)",
        sample_questions: [
          "A subcontractor submits a variation claim for $250K citing differing site conditions. Walk me through how you assess the entitlement under the contract and manage the commercial outcome.",
          "The client rejects your EOT claim despite documented wet weather delays. What steps do you take under an AS 4000 contract to protect your position?",
        ],
        level_descriptors: {
          basic: "Understands basic contract structure (AS 2124 / AS 4000), prepares progress claims with supporting documentation, tracks variations in a register",
          intermediate: "Administers contracts independently, assesses variation entitlements, prepares and responds to EOT claims, manages payment schedules under the Building and Construction Industry Security of Payment Act",
          advanced: "Manages commercial strategy across a project portfolio, negotiates complex disputes, drafts and assesses delay claims with detailed programme analysis, understands interplay between head contract and subcontract terms",
          expert: "Leads contractual disputes at adjudication or expert determination level, advises on contract selection and amendment strategy, trains project teams on contractual rights and obligations",
        },
      },
      {
        name: "Environmental Management",
        category: "hard_skill",
        description: "Environmental management plans, erosion and sediment control, waste management, and regulatory compliance on construction sites",
        sample_questions: [
          "A significant rain event is forecast for tonight and your sediment controls are borderline. Walk me through your response plan and the regulatory obligations you're managing.",
          "You discover unexpected contaminated soil during excavation. What are your immediate actions and notification obligations under the relevant EPA guidelines?",
        ],
        level_descriptors: {
          basic: "Installs and maintains basic erosion and sediment controls (silt fences, sediment basins), follows waste segregation requirements, understands site environmental rules",
          intermediate: "Prepares Construction Environmental Management Plans (CEMPs), conducts environmental inspections, manages waste tracking registers, maintains compliance with EPA licence conditions",
          advanced: "Manages complex environmental approvals (REFs, EIS conditions), designs erosion and sediment control plans per the Blue Book (NSW) or equivalent state guidelines, leads environmental incident response and regulatory notifications",
          expert: "Develops company-wide environmental management systems (ISO 14001), interfaces with regulators and community stakeholders, leads environmental audits, drives sustainability initiatives across projects",
        },
      },
      {
        name: "Building Services Coordination",
        category: "hard_skill",
        description: "Coordinating electrical, plumbing, HVAC, fire services, and Building Management Systems (BMS) across a construction project",
        sample_questions: [
          "You're coordinating ceiling space for mechanical ductwork, electrical cable trays, fire sprinklers, and hydraulic pipes — and they all clash. Walk me through your resolution process.",
          "The BMS contractor says they can't commission until all other services are complete, but your programme has them running in parallel. How do you resolve this?",
        ],
        level_descriptors: {
          basic: "Understands the major building services disciplines, reads services drawings, coordinates basic access and sequencing on site",
          intermediate: "Manages services coordination meetings, reviews shop drawings for clashes, coordinates commissioning schedules, understands AS/NZS standards for electrical (AS/NZS 3000) and plumbing (AS/NZS 3500)",
          advanced: "Leads BIM-based clash detection across all services disciplines, manages complex commissioning programmes, resolves multi-trade interface issues, coordinates integrated systems testing (IST)",
          expert: "Oversees building services strategy from design through to defects liability, drives adoption of digital coordination tools, manages services across multiple concurrent projects, advises on smart building and BMS integration strategies",
        },
      },
      {
        name: "Demolition & Remediation",
        category: "hard_skill",
        description: "Asbestos management, contamination assessment, safe demolition practices, and site remediation in accordance with SafeWork and EPA requirements",
        sample_questions: [
          "You're demolishing a 1970s commercial building and suspect asbestos-containing materials in the ceiling tiles and pipe lagging. Walk me through your management plan from assessment to clearance.",
          "During remediation works, monitoring detects contamination levels above the site audit criteria. What are your obligations and how do you manage the programme impact?",
        ],
        level_descriptors: {
          basic: "Understands asbestos awareness obligations (non-licensed work), recognises potential hazardous materials, follows safe demolition procedures under supervision",
          intermediate: "Prepares demolition work plans per AS 2601, manages licensed asbestos removal subcontractors, coordinates hazardous materials surveys, maintains waste tracking and disposal records",
          advanced: "Leads complex demolition projects involving structural engineering input, manages site contamination assessments and Remedial Action Plans (RAPs), coordinates with occupational hygienists and environmental consultants, ensures SafeWork NSW (or equivalent state regulator) compliance",
          expert: "Designs remediation strategies for complex contaminated sites, manages EPA site audit processes, leads Class A asbestos removal oversight, advises on brownfield redevelopment feasibility",
        },
      },
      {
        name: "Formwork & Concrete",
        category: "hard_skill",
        description: "Formwork design and erection, concrete placement, curing regimes, and strength testing for structural elements",
        sample_questions: [
          "You're pouring a large suspended slab in 38-degree heat. Walk me through your concrete placement plan, including how you manage workability, curing, and crack control.",
          "The 7-day concrete test results come back below the specified characteristic strength. What do you do before the 28-day results are available, and what are your options if they also fail?",
        ],
        level_descriptors: {
          basic: "Assists with formwork erection under supervision, understands basic concrete placement procedures, can read a concrete docket and check slump",
          intermediate: "Erects standard formwork systems (e.g., Peri, Doka), manages concrete pours including pump coordination, understands curing requirements per AS 3600, coordinates NATA-accredited testing",
          advanced: "Designs complex formwork solutions (jump forms, slip forms), manages large-scale concrete pours with detailed methodology, interprets test results and manages non-conformances, optimises pour sequences for programme efficiency",
          expert: "Leads formwork engineering and concrete technology strategy for major projects, specifies advanced concrete mixes (SCC, high-strength, geopolymer), drives innovation in formwork systems, manages post-tensioning and precast coordination",
        },
      },
      {
        name: "Surveying & Set-out",
        category: "hard_skill",
        description: "Site surveys, set-out procedures, use of laser levels, total stations, and GPS/GNSS equipment for construction control",
        sample_questions: [
          "You arrive on site to set out footings and discover the survey control points have been disturbed by earthworks. What's your process to re-establish control before the concreters arrive tomorrow?",
          "The as-built survey shows a column is 40mm off the grid line. Walk me through how you assess the impact and what options you have before it becomes a bigger problem.",
        ],
        level_descriptors: {
          basic: "Uses laser levels and tape measures for basic set-out, reads survey plans, understands benchmarks and grid references",
          intermediate: "Operates total stations and GPS/GNSS equipment, performs set-out for standard structural elements, checks levels and alignments, maintains survey records",
          advanced: "Manages survey control networks across large sites, performs complex set-out (curved structures, multi-level transfers), coordinates with registered surveyors, interprets as-built data for compliance checks",
          expert: "Leads survey strategy for major infrastructure projects, specifies and implements machine-control systems, integrates survey data with BIM models, manages cadastral and engineering survey interfaces",
        },
      },
      {
        name: "Scaffolding & Working at Heights",
        category: "hard_skill",
        description: "Scaffolding inspection, safe working at heights, edge protection, and rescue planning in compliance with SafeWork regulations and AS/NZS 1576",
        sample_questions: [
          "You're inspecting a scaffold that was erected over the weekend and notice the scaffold tag is missing and several standards appear to be on uneven ground. Walk me through your actions.",
          "A worker needs to access a location where scaffold isn't feasible and an EWP can't reach. How do you develop a safe system of work for this task?",
        ],
        level_descriptors: {
          basic: "Holds working at heights ticket, inspects scaffold before use (visual check and tag), uses harness and lanyard correctly, understands exclusion zones",
          intermediate: "Conducts formal scaffold inspections per AS/NZS 1576, prepares SWMS for working at heights tasks, selects appropriate fall prevention systems (scaffold, EWP, edge protection, harness), manages rescue plans",
          advanced: "Designs complex scaffold solutions with engineering input, manages multiple height access systems across a project, leads incident investigations for falls or near-misses, conducts height safety training for site teams",
          expert: "Develops company-wide working at heights procedures and standards, interfaces with SafeWork inspectors on height-related matters, evaluates and implements advanced access solutions (mast climbers, suspended platforms), drives fall prevention innovation across the business",
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
