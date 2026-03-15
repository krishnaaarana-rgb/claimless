import type { IndustryDefinition } from "@/lib/industry-skills";

export const human_resourcesIndustry: IndustryDefinition = {
    id: "human_resources",
    label: "Human Resources",
    icon: "👥",
    description: "HR, talent acquisition, people operations, and organizational development roles",
    interview_context: {
      persona:
        "You are a CHRO evaluating HR talent. You care about both compliance and culture — someone who can balance legal requirements with building a great employee experience.",
      tone: "People-focused but business-minded.",
      domain_terminology: [
        "employee engagement", "total rewards", "HRIS", "talent pipeline",
        "succession planning", "DEI", "onboarding", "performance management",
        "retention", "employer branding", "labor law", "comp benchmarking",
      ],
      red_flags_to_probe: [
        "Policy-focused without people awareness",
        "No metrics or business impact orientation",
        "Inability to handle sensitive employee situations",
        "Lack of knowledge about employment law basics",
      ],
      what_great_looks_like:
        "Strong candidates balance empathy with business results, can navigate sensitive situations diplomatically, use data to influence decisions, and build programs that scale.",
    },
    hard_skills: [
      {
        name: "Employment Law & Compliance",
        category: "hard_skill",
        description: "Knowledge of labor laws, regulations, and workplace compliance",
        sample_questions: [
          "How do you stay current on employment law changes?",
          "Describe a compliance challenge you navigated.",
        ],
        level_descriptors: {
          basic: "Understands basic employment laws",
          intermediate: "Applies laws to common workplace scenarios",
          advanced: "Handles complex compliance issues, advises leadership",
          expert: "Designs compliance programs, manages regulatory interactions",
        },
      },
      {
        name: "Talent Acquisition",
        category: "hard_skill",
        description: "End-to-end recruiting from sourcing to offer negotiation",
        sample_questions: [
          "How do you build a pipeline for hard-to-fill roles?",
          "What metrics do you use to measure recruiting effectiveness?",
        ],
        level_descriptors: {
          basic: "Posts jobs, screens resumes, schedules interviews",
          intermediate: "Sources proactively, manages full recruitment cycles",
          advanced: "Builds recruiting strategies, manages employer brand",
          expert: "Designs talent acquisition functions, leads TA teams",
        },
      },
      {
        name: "Compensation & Benefits",
        category: "hard_skill",
        description: "Designing and managing total rewards programs",
        sample_questions: [
          "How do you approach building a comp structure for a growing company?",
          "Describe your experience with pay equity analysis.",
        ],
        level_descriptors: {
          basic: "Administers existing comp programs",
          intermediate: "Conducts market benchmarking, manages annual cycles",
          advanced: "Designs comp strategies, handles executive compensation",
          expert: "Leads total rewards strategy, manages equity programs",
        },
      },
      {
        name: "HRIS & People Analytics",
        category: "hard_skill",
        description: "Using HR technology and data to drive decisions",
        sample_questions: [
          "How do you use data to identify retention risks?",
          "What HR metrics do you track regularly and why?",
        ],
        level_descriptors: {
          basic: "Uses HRIS for basic record-keeping and reports",
          intermediate: "Builds dashboards, analyzes workforce trends",
          advanced: "Designs analytics programs, predicts workforce needs",
          expert: "Builds people analytics functions, influences strategy with data",
        },
      },
      {
        name: "Performance Management",
        category: "hard_skill",
        description: "Designing and running performance cycles, managing underperformance, and coaching managers on feedback",
        sample_questions: [
          "Walk me through how you managed a chronic underperformer from first conversation to resolution.",
          "A manager wants to fire someone on the spot for poor performance but there's no documented history. How do you handle it?",
        ],
        level_descriptors: {
          basic: "Administers existing review cycles, collects feedback forms",
          intermediate: "Coaches managers on delivering feedback, manages PIPs, calibrates ratings across teams",
          advanced: "Designs performance frameworks, builds calibration processes, handles complex termination cases with legal awareness",
          expert: "Transforms performance culture from annual reviews to continuous feedback, ties performance systems to compensation and succession planning",
        },
      },
      {
        name: "Organisational Development",
        category: "hard_skill",
        description: "Diagnosing organizational effectiveness issues, designing team structures, and leading restructures",
        sample_questions: [
          "How do you assess whether a team restructure is needed vs a leadership issue?",
          "A department has doubled in size in 12 months and everything is breaking. Walk me through your diagnostic process.",
        ],
        level_descriptors: {
          basic: "Understands basic org design concepts like span of control and reporting lines",
          intermediate: "Conducts role mapping and skills gap analyses, supports restructures led by others",
          advanced: "Leads org design projects end-to-end, facilitates leadership alignment on structure changes, manages change communication",
          expert: "Shapes company-wide operating model, designs org structures that scale, integrates OD with workforce planning and succession",
        },
      },
      {
        name: "Workforce Planning",
        category: "hard_skill",
        description: "Forecasting future talent needs through headcount modelling, succession planning, and skills gap analysis to align workforce capacity with business strategy",
        sample_questions: [
          "Your company is opening two new offices in regional Australia over the next 18 months. Walk me through how you'd build the headcount model and identify which roles to hire vs redeploy.",
          "A critical senior leader has announced their retirement in six months and there's no obvious successor. How do you handle the succession planning process from this point?",
        ],
        level_descriptors: {
          basic: "Maintains headcount trackers and org charts, assists with data collection for workforce reports",
          intermediate: "Builds headcount models using turnover data and growth forecasts, conducts skills gap analyses across teams and presents findings to leadership",
          advanced: "Develops integrated workforce plans linking business strategy to talent pipelines, builds succession frameworks for critical roles, and models multiple growth scenarios",
          expert: "Leads enterprise-wide strategic workforce planning, integrates predictive analytics with succession and mobility strategies, and advises the board on long-term talent risk",
        },
      },
      {
        name: "Employee Relations",
        category: "hard_skill",
        description: "Managing grievance handling, workplace investigations, mediation, and Fair Work Commission processes to maintain productive employment relationships",
        sample_questions: [
          "An employee lodges a formal bullying complaint against their direct manager, who is a high performer the CEO personally rates. Walk me through how you run this investigation.",
          "You receive a Fair Work Commission conciliation notice for an unfair dismissal claim. The termination documentation is patchy. What's your approach?",
        ],
        level_descriptors: {
          basic: "Logs employee complaints, follows established grievance procedures, and escalates issues to senior HR as needed",
          intermediate: "Conducts workplace investigations independently, facilitates mediation between parties, and drafts findings reports with recommended actions",
          advanced: "Manages complex and sensitive ER matters including bullying, harassment, and discrimination claims, represents the organisation at Fair Work Commission conciliations, and advises leaders on managing risk",
          expert: "Designs the organisation's ER framework and case management system, coaches the HR team on investigation methodology, leads enterprise bargaining disputes, and shapes policy to prevent systemic issues",
        },
      },
      {
        name: "Workplace Health & Safety",
        category: "hard_skill",
        description: "Ensuring compliance with the WHS Act, conducting risk assessments, leading incident investigations, and managing return-to-work programs",
        sample_questions: [
          "A serious near-miss incident occurs on a construction site your company manages. Walk me through your incident investigation process and the steps you'd take within the first 48 hours.",
          "An employee has been on a workers' compensation claim for four months with no clear return-to-work date. How do you manage this, balancing duty of care with operational needs?",
        ],
        level_descriptors: {
          basic: "Understands WHS Act obligations, completes incident reports, and participates in workplace inspections",
          intermediate: "Conducts risk assessments, develops Safe Work Method Statements, manages return-to-work plans for injured workers, and maintains WHS registers",
          advanced: "Leads WHS strategy across multiple sites, conducts root-cause incident investigations, manages relationships with regulators and insurers, and designs safety training programs",
          expert: "Builds organisational safety culture from executive level down, leads WHS management system certification (ISO 45001), shapes WHS policy across the enterprise, and manages complex workers' compensation portfolios",
        },
      },
      {
        name: "Diversity, Equity & Inclusion",
        category: "hard_skill",
        description: "Developing and executing DEI strategy including unconscious bias programs, pay equity analysis, inclusive policies, and measurable diversity targets",
        sample_questions: [
          "Leadership agrees DEI matters but won't fund dedicated resources. How do you embed meaningful DEI initiatives into existing HR processes with limited budget?",
          "You run a pay equity analysis and discover a statistically significant gender pay gap in one business unit. Walk me through how you address this with the leadership team and what remediation looks like.",
        ],
        level_descriptors: {
          basic: "Supports DEI awareness activities, collects demographic data for reporting, and assists with Workplace Gender Equality Agency (WGEA) submissions",
          intermediate: "Designs and delivers unconscious bias training, conducts pay equity audits, builds diversity dashboards, and supports inclusive recruitment practices",
          advanced: "Develops organisation-wide DEI strategy with measurable KPIs, leads cultural change programs, manages reconciliation action plans (RAPs), and advises leadership on inclusive decision-making",
          expert: "Shapes industry-leading DEI practice, integrates inclusion into all people systems (hiring, promotion, pay, development), publishes transparency reports, and mentors other organisations on DEI maturity",
        },
      },
      {
        name: "Payroll & Benefits Administration",
        category: "hard_skill",
        description: "Managing payroll processing, salary packaging, fringe benefits tax (FBT), superannuation compliance, and employee benefits programs",
        sample_questions: [
          "During a payroll audit you discover that a group of employees have been underpaid due to an incorrect Modern Award classification for the past two years. What's your remediation plan?",
          "An employee asks about salary packaging a novated car lease and a portable electronic device. Walk me through how you'd explain the FBT implications and the process.",
        ],
        level_descriptors: {
          basic: "Processes payroll runs, maintains employee records, submits superannuation payments via a clearing house, and handles basic pay queries",
          intermediate: "Manages end-to-end payroll for multiple pay cycles, administers salary packaging and benefits programs, prepares FBT returns, and ensures Single Touch Payroll (STP) compliance",
          advanced: "Leads payroll operations across multiple entities or states, manages complex scenarios (redundancies, ETP calculations, long service leave portability), designs benefits programs, and handles ATO audits",
          expert: "Architects payroll systems and integrations for scale, sets organisational policy on remuneration packaging, manages payroll for M&A transitions, and ensures compliance across complex multi-award environments",
        },
      },
      {
        name: "Industrial Relations",
        category: "hard_skill",
        description: "Managing enterprise bargaining, Modern Award interpretation, union negotiations, and industrial instruments in the Australian workplace relations framework",
        sample_questions: [
          "Your enterprise agreement is expiring in six months and the union has flagged several claims including a 15% pay increase and restrictions on casual conversion. How do you prepare for and approach the bargaining process?",
          "A manager asks you whether a particular employee is covered by the Clerks Award or the Manufacturing Award. The role has elements of both. Walk me through your classification analysis.",
        ],
        level_descriptors: {
          basic: "Understands the Fair Work Act framework, reads and applies Modern Award provisions for pay rates and entitlements, and escalates IR issues appropriately",
          intermediate: "Interprets complex Award and agreement clauses, prepares enterprise bargaining logs and proposals, manages union delegate relationships, and drafts workplace policies aligned with industrial instruments",
          advanced: "Leads enterprise bargaining negotiations, represents the organisation at Fair Work Commission hearings, manages protected industrial action processes, and advises on transfer of business and restructure implications",
          expert: "Shapes organisational IR strategy at executive level, manages multi-agreement bargaining across divisions, navigates complex jurisdictional issues, and influences industry-level policy and advocacy",
        },
      },
      {
        name: "HR Technology",
        category: "hard_skill",
        description: "Selecting, implementing, and optimising HRIS platforms (Workday, SAP SuccessFactors, Employment Hero) and building people reporting and analytics capabilities",
        sample_questions: [
          "You've been tasked with replacing a legacy HRIS with a modern cloud platform for a 2,000-person organisation. Walk me through your vendor selection and implementation approach.",
          "Business leaders are asking for real-time people dashboards but your current system only produces manual spreadsheet reports. How do you build the case for investment and what does your reporting roadmap look like?",
        ],
        level_descriptors: {
          basic: "Uses HRIS for day-to-day transactions such as new starter setup, leave management, and generating standard reports",
          intermediate: "Configures HRIS modules and workflows, builds custom reports and dashboards, manages data integrity, and supports system upgrades and patches",
          advanced: "Leads HRIS implementation or migration projects end-to-end, designs system architecture across HR modules (payroll, recruitment, performance, learning), integrates HRIS with other business systems, and trains HR teams",
          expert: "Defines the organisation's HR technology strategy and roadmap, architects multi-system HR tech ecosystems, leverages AI and automation within HR platforms, and drives digital transformation of the people function",
        },
      },
      {
        name: "Onboarding & Offboarding",
        category: "hard_skill",
        description: "Designing and managing induction programs, probation management processes, exit interviews, and knowledge transfer protocols to optimise the employee lifecycle",
        sample_questions: [
          "Your company's 90-day new starter attrition rate is 25% — well above industry benchmarks. How do you diagnose the root causes and redesign the onboarding program?",
          "A senior engineer with deep institutional knowledge has resigned with four weeks' notice. How do you structure the offboarding and knowledge transfer to minimise business disruption?",
        ],
        level_descriptors: {
          basic: "Processes new starter paperwork, coordinates Day 1 logistics, conducts standard exit interviews, and manages system access provisioning and deprovisioning",
          intermediate: "Designs structured onboarding schedules spanning the first 90 days, manages probation review processes, analyses exit interview data for trends, and coordinates cross-functional induction sessions",
          advanced: "Builds end-to-end onboarding programs that improve time-to-productivity and reduce early attrition, designs knowledge transfer frameworks, implements onboarding technology solutions, and reports on lifecycle metrics to leadership",
          expert: "Architects the organisation's employee lifecycle strategy from pre-boarding through alumni engagement, integrates onboarding with employer brand and culture programs, builds scalable frameworks for rapid-growth or M&A scenarios, and benchmarks against industry best practice",
        },
      },
    ],
    soft_skills: [
      {
        name: "Conflict Resolution",
        category: "soft_skill",
        description: "Mediating disputes and navigating sensitive employee situations",
        sample_questions: [
          "Describe a difficult employee conflict you helped resolve.",
          "How do you approach a conversation with an underperforming manager?",
        ],
        level_descriptors: {
          basic: "Facilitates basic discussions between parties",
          intermediate: "Mediates conflicts independently, de-escalates effectively",
          advanced: "Handles complex, high-stakes employee situations",
          expert: "Develops conflict resolution programs, coaches leaders",
        },
      },
      {
        name: "Confidentiality & Trust",
        category: "soft_skill",
        description: "Maintaining confidentiality and building organizational trust",
        sample_questions: [
          "How do you handle a situation where maintaining confidentiality conflicts with transparency?",
          "Describe how you've built trust with skeptical employees.",
        ],
        level_descriptors: {
          basic: "Maintains confidentiality as instructed",
          intermediate: "Navigates confidentiality boundaries independently",
          advanced: "Builds trust across the organization, handles sensitive information wisely",
          expert: "Sets confidentiality standards, advises on the most sensitive matters",
        },
      },
      {
        name: "Change Management",
        category: "soft_skill",
        description: "Leading organizational change initiatives effectively",
        sample_questions: [
          "Describe a major organizational change you helped implement.",
          "How do you manage resistance to change?",
        ],
        level_descriptors: {
          basic: "Supports change efforts as directed",
          intermediate: "Manages communication and rollout for changes",
          advanced: "Leads complex change initiatives, influences adoption",
          expert: "Designs change management frameworks, leads transformations",
        },
      },
      {
        name: "Strategic Business Partnering",
        category: "soft_skill",
        description: "Acting as a trusted advisor to business leaders, aligning HR strategy with business objectives",
        sample_questions: [
          "Tell me about a time a business leader came to you with a 'people problem' that was actually a strategy problem. How did you reframe it?",
          "How do you earn a seat at the table with a leadership team that sees HR as purely administrative?",
        ],
        level_descriptors: {
          basic: "Responds to business leader requests, provides HR guidance when asked",
          intermediate: "Proactively identifies people implications of business decisions, attends leadership meetings with relevant data",
          advanced: "Co-creates workforce strategy with business leaders, influences headcount planning and org design decisions",
          expert: "Operates as a true strategic partner to the CEO/executive team, shapes business strategy through people insights and workforce analytics",
        },
      },
    ],
    sub_niches: [
      {
        id: "recruiting",
        label: "Recruiting / TA",
        additional_skills: ["Sourcing Techniques", "ATS Management", "Candidate Experience", "Offer Negotiation"],
        interview_hints: "Focus on sourcing creativity, pipeline metrics, and candidate experience approach.",
      },
      {
        id: "people_ops",
        label: "People Operations",
        additional_skills: ["Onboarding Design", "Employee Lifecycle Management", "HR Tech Stack", "Process Automation"],
        interview_hints: "Focus on operational efficiency, scalability, and employee experience design.",
      },
      {
        id: "l_and_d",
        label: "Learning & Development",
        additional_skills: ["Training Design", "Leadership Development", "LMS Management", "ROI Measurement"],
        interview_hints: "Focus on program design methodology, measuring learning impact, and needs assessment.",
      },
    ],
  };
