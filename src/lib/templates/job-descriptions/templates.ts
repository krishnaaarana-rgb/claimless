import type { Template } from "../types";

export const JOB_DESCRIPTION_TEMPLATES: Template[] = [
  {
    id: "jd_senior_software_engineer",
    name: "Senior Software Engineer",
    description: "Full-stack or backend engineer, 5+ years experience",
    category: "job_description",
    industries: ["technology"],
    tags: ["engineering", "senior", "fullstack"],
    content: {
      title: "Senior Software Engineer",
      department: "Engineering",
      employment_type: "full_time",
      description: `We're looking for a Senior Software Engineer to build and scale our core platform. You'll own features end-to-end — from architecture decisions through to production deployment.

What you'll do:
- Design and build scalable backend services and APIs
- Collaborate with product and design to deliver features users love
- Review code, mentor junior engineers, and raise the technical bar
- Make pragmatic architecture decisions that balance speed with quality
- Own the reliability and performance of what you build

What we're looking for:
- 5+ years of professional software engineering experience
- Strong proficiency in at least one modern language (TypeScript, Python, Go, Rust)
- Experience designing and operating distributed systems
- Solid understanding of databases, caching, and API design
- Track record of shipping features in a fast-moving environment
- Clear communicator who can explain technical concepts to non-technical stakeholders

Nice to have:
- Experience with cloud infrastructure (AWS, GCP, or Azure)
- Contributions to open-source projects
- Experience with CI/CD pipelines and DevOps practices
- Familiarity with AI/ML integration in production systems`,
    },
  },
  {
    id: "jd_registered_nurse",
    name: "Registered Nurse",
    description: "General RN position for hospital or aged care",
    category: "job_description",
    industries: ["healthcare"],
    tags: ["nursing", "clinical", "healthcare"],
    content: {
      title: "Registered Nurse",
      department: "Nursing",
      employment_type: "full_time",
      description: `We're seeking a compassionate and skilled Registered Nurse to join our clinical team. You'll provide high-quality patient care and work collaboratively within a multidisciplinary team.

What you'll do:
- Deliver evidence-based nursing care across a range of clinical presentations
- Conduct patient assessments, develop care plans, and evaluate outcomes
- Administer medications and treatments in accordance with clinical protocols
- Maintain accurate and timely clinical documentation
- Collaborate with medical, allied health, and nursing teams
- Contribute to quality improvement and patient safety initiatives

What we're looking for:
- Current AHPRA registration as a Registered Nurse
- Minimum 2 years clinical experience in acute care, aged care, or community setting
- Strong clinical assessment and critical thinking skills
- Excellent communication and interpersonal skills
- Commitment to evidence-based practice and continuous learning
- Current Working With Children Check (if applicable)

Nice to have:
- Postgraduate qualification in a specialty area
- Experience with electronic medical records systems
- BLS/ALS certification
- Experience mentoring graduate nurses`,
    },
  },
  {
    id: "jd_business_development_manager",
    name: "Business Development Manager",
    description: "B2B sales role with quota and pipeline management",
    category: "job_description",
    industries: ["sales"],
    tags: ["sales", "bdm", "b2b"],
    content: {
      title: "Business Development Manager",
      department: "Sales",
      employment_type: "full_time",
      description: `We're hiring a Business Development Manager to drive new revenue and expand our client base. You'll own the full sales cycle from prospecting through to close.

What you'll do:
- Build and manage a qualified pipeline of B2B opportunities
- Conduct discovery calls and product demonstrations
- Develop tailored proposals and negotiate contracts
- Hit or exceed quarterly revenue targets
- Collaborate with marketing on lead generation campaigns
- Maintain accurate CRM records and pipeline forecasts

What we're looking for:
- 3+ years B2B sales experience with a track record of hitting quota
- Experience in consultative selling with mid-market or enterprise clients
- Strong presentation and negotiation skills
- CRM proficiency (Salesforce, HubSpot, or equivalent)
- Self-motivated with the ability to work autonomously
- Excellent written and verbal communication

Nice to have:
- Experience selling SaaS or technology solutions
- Existing network in the target industry
- Experience with outbound prospecting tools (LinkedIn Sales Nav, Apollo)
- Knowledge of MEDDIC, Challenger, or similar sales methodologies`,
    },
  },
  {
    id: "jd_financial_analyst",
    name: "Financial Analyst",
    description: "Finance team member for reporting, modelling, and analysis",
    category: "job_description",
    industries: ["finance"],
    tags: ["finance", "analyst", "reporting"],
    content: {
      title: "Financial Analyst",
      department: "Finance",
      employment_type: "full_time",
      description: `We're looking for a Financial Analyst to support strategic decision-making through data-driven financial analysis and reporting.

What you'll do:
- Build and maintain financial models for forecasting and scenario analysis
- Prepare monthly, quarterly, and annual financial reports
- Analyse variances and provide insights to senior leadership
- Support budgeting and business planning processes
- Conduct ad-hoc analysis to support strategic initiatives
- Ensure compliance with accounting standards and regulatory requirements

What we're looking for:
- Bachelor's degree in Finance, Accounting, or related field
- 2+ years experience in financial analysis or FP&A
- Advanced Excel/Google Sheets skills including financial modelling
- Strong analytical and problem-solving abilities
- Excellent attention to detail and accuracy
- Clear communication skills — ability to present financial data to non-finance stakeholders

Nice to have:
- CPA, CA, or CFA qualification (or in progress)
- Experience with BI tools (Power BI, Tableau, Looker)
- SQL proficiency for data extraction
- Experience with ERP systems (Xero, MYOB, NetSuite)`,
    },
  },
  {
    id: "jd_marketing_manager",
    name: "Marketing Manager",
    description: "Leads marketing strategy, campaigns, and brand",
    category: "job_description",
    industries: ["marketing"],
    tags: ["marketing", "manager", "strategy"],
    content: {
      title: "Marketing Manager",
      department: "Marketing",
      employment_type: "full_time",
      description: `We're hiring a Marketing Manager to own our marketing strategy and drive growth across all channels.

What you'll do:
- Develop and execute integrated marketing strategies aligned with business goals
- Plan and manage multi-channel campaigns (digital, content, events, partnerships)
- Own marketing budget allocation and ROI reporting
- Build and manage a content calendar across blog, social, email, and paid channels
- Analyse campaign performance and optimise based on data
- Collaborate with sales to align messaging and support pipeline generation

What we're looking for:
- 4+ years marketing experience with at least 2 years in a management role
- Proven track record of planning and executing campaigns with measurable results
- Strong understanding of digital marketing channels and analytics
- Experience with marketing automation tools (HubSpot, Marketo, Mailchimp)
- Data-driven mindset — comfortable with analytics and attribution
- Excellent copywriting and communication skills

Nice to have:
- Experience in B2B or SaaS marketing
- SEO and content strategy expertise
- Experience managing agencies or freelancers
- Familiarity with brand positioning and market research`,
    },
  },
  {
    id: "jd_project_manager",
    name: "Project Manager",
    description: "Cross-functional project delivery",
    category: "job_description",
    industries: ["operations"],
    tags: ["operations", "project", "management"],
    content: {
      title: "Project Manager",
      department: "Operations",
      employment_type: "full_time",
      description: `We're looking for a Project Manager to lead the delivery of key projects from planning through to completion, working across teams and stakeholders.

What you'll do:
- Plan, execute, and close projects on time and within budget
- Define project scope, goals, and deliverables with stakeholders
- Develop detailed project plans, timelines, and resource allocations
- Manage risks, issues, and dependencies proactively
- Facilitate cross-functional collaboration and remove blockers
- Report on project status, milestones, and KPIs to leadership

What we're looking for:
- 3+ years project management experience
- Proven delivery of complex, multi-stakeholder projects
- Strong organisational and time management skills
- Experience with project management tools (Asana, Jira, Monday, MS Project)
- Excellent communication and stakeholder management skills
- Ability to work in a fast-paced environment with competing priorities

Nice to have:
- PMP, PRINCE2, or Agile certification
- Experience with Agile/Scrum methodologies
- Budget management experience
- Experience in the relevant industry`,
    },
  },
  {
    id: "jd_site_manager_construction",
    name: "Site Manager — Construction",
    description: "On-site construction management role",
    category: "job_description",
    industries: ["construction"],
    tags: ["construction", "site", "management"],
    content: {
      title: "Site Manager",
      department: "Construction",
      employment_type: "full_time",
      description: `We're hiring an experienced Site Manager to oversee construction projects from mobilisation through to practical completion.

What you'll do:
- Manage day-to-day site operations, subcontractors, and labour
- Ensure all work meets quality standards, programme requirements, and budget
- Implement and enforce WHS policies and procedures on site
- Conduct toolbox talks, site inductions, and safety inspections
- Coordinate with project managers, architects, engineers, and clients
- Manage RFIs, variations, and programme updates
- Ensure compliance with NCC/BCA and relevant Australian Standards

What we're looking for:
- 5+ years site management experience in commercial or residential construction
- Current White Card and SWMS competency
- Strong understanding of WHS legislation and chain of responsibility
- Experience managing subcontractors across multiple trades
- Ability to read and interpret construction drawings and specifications
- Excellent problem-solving skills under pressure

Nice to have:
- Certificate IV or Diploma in Building and Construction
- Builder's licence or equivalent state registration
- First Aid certification
- Experience with Procore, Aconex, or similar construction management software`,
    },
  },
];
