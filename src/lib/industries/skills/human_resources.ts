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
