import type { IndustryDefinition } from "@/lib/industry-skills";

export const data_analyticsIndustry: IndustryDefinition = {
    id: "data_analytics",
    label: "Data & Analytics",
    icon: "📊",
    description: "Data science, analytics, machine learning, and business intelligence roles",
    interview_context: {
      persona:
        "You are a Head of Data evaluating analytical talent. You care about statistical rigor, practical impact, and communication — not just technical skills.",
      tone: "Analytical but practical — the best data people bridge data and business.",
      domain_terminology: [
        "A/B testing", "statistical significance", "feature engineering",
        "data pipeline", "ETL", "ML model", "precision/recall",
        "data warehouse", "dashboarding", "cohort analysis",
      ],
      red_flags_to_probe: [
        "Cannot explain their models or findings to non-technical people",
        "No awareness of bias or data quality issues",
        "Solutions looking for problems rather than business-driven analysis",
        "No experience with production data systems",
      ],
      what_great_looks_like:
        "Strong candidates connect analysis to business impact, demonstrate statistical rigor, communicate findings clearly, and show awareness of data quality and ethical considerations.",
    },
    hard_skills: [
      {
        name: "Statistical Analysis",
        category: "hard_skill",
        description: "Applying statistical methods to draw valid conclusions from data",
        sample_questions: [
          "How do you design and evaluate an A/B test?",
          "Describe a time when your statistical analysis changed a business decision.",
        ],
        level_descriptors: {
          basic: "Applies basic statistical tests with guidance",
          intermediate: "Designs experiments, interprets results independently",
          advanced: "Handles complex statistical modeling, Bayesian methods",
          expert: "Develops statistical frameworks, leads experimentation programs",
        },
      },
      {
        name: "SQL & Data Querying",
        category: "hard_skill",
        description: "Writing efficient queries to extract and transform data",
        sample_questions: [
          "How do you approach optimizing a slow query?",
          "Describe the most complex SQL analysis you've written.",
        ],
        level_descriptors: {
          basic: "Writes basic SELECT, JOIN, GROUP BY queries",
          intermediate: "Handles window functions, CTEs, complex joins",
          advanced: "Optimizes queries at scale, designs efficient data models",
          expert: "Architects data access patterns, mentors on query optimization",
        },
      },
      {
        name: "Machine Learning",
        category: "hard_skill",
        description: "Building and deploying ML models to solve business problems",
        sample_questions: [
          "Walk me through an ML model you built from problem definition to deployment.",
          "How do you decide if a problem needs ML or a simpler approach?",
        ],
        level_descriptors: {
          basic: "Runs standard algorithms (logistic regression, random forest) on clean datasets using scikit-learn or similar, evaluates with basic metrics like accuracy",
          intermediate: "Selects appropriate algorithms for the problem, performs feature engineering, handles class imbalance and missing data, evaluates with proper train/test splits and cross-validation",
          advanced: "Deploys models to production with monitoring and retraining pipelines, builds end-to-end ML systems with CI/CD, handles model drift detection, A/B tests model performance against business KPIs",
          expert: "Designs ML platform architecture for multiple teams, leads model governance and fairness auditing, develops novel approaches for business-critical systems, manages trade-offs between model complexity and operational cost at scale",
        },
      },
      {
        name: "Data Visualization",
        category: "hard_skill",
        description: "Creating clear, insightful visualizations that drive understanding",
        sample_questions: [
          "How do you decide how to visualize a dataset?",
          "Describe a dashboard you built that drove real business action.",
        ],
        level_descriptors: {
          basic: "Creates basic charts and reports",
          intermediate: "Builds insightful dashboards, chooses appropriate visualizations",
          advanced: "Designs visualization systems, tells compelling data stories",
          expert: "Sets data visualization standards, builds self-service analytics",
        },
      },
      {
        name: "Data Quality & Governance",
        category: "hard_skill",
        description: "Ensuring data accuracy, consistency, lineage tracking, and establishing data standards across the organization",
        sample_questions: [
          "You discover a critical dashboard is showing incorrect numbers that leadership has been using for 3 months. What do you do?",
          "How do you build trust in data across an organization where people have been burned by bad data before?",
        ],
        level_descriptors: {
          basic: "Validates own query results, checks for nulls and duplicates before analysis",
          intermediate: "Writes data quality tests, documents data definitions, maintains a data dictionary for their domain",
          advanced: "Designs data quality frameworks with automated monitoring and alerting, establishes data contracts between producers and consumers, leads root cause analysis on data incidents",
          expert: "Builds organization-wide data governance programs, defines data ownership and stewardship models, establishes lineage tracking and impact analysis across the data platform",
        },
      },
      {
        name: "Product Analytics",
        category: "hard_skill",
        description: "Measuring product usage, user behavior, and feature impact to guide product decisions",
        sample_questions: [
          "Walk me through how you'd measure the success of a new feature launch.",
          "Your PM says a feature is underperforming. How do you go from that statement to a concrete recommendation?",
        ],
        level_descriptors: {
          basic: "Tracks basic product metrics (DAU, MAU, retention) using existing dashboards",
          intermediate: "Designs event taxonomies, builds funnel analyses, runs cohort comparisons to evaluate feature performance",
          advanced: "Defines product health metrics frameworks, partners with PMs to design experiments, quantifies feature impact on business KPIs like revenue and retention",
          expert: "Builds product analytics practice for the organization, establishes experimentation platforms, shapes product strategy through data-driven insights at the leadership level",
        },
      },
    ],
    soft_skills: [
      {
        name: "Business Translation",
        category: "soft_skill",
        description: "Translating business questions into analytical problems and back",
        sample_questions: [
          "How do you ensure your analysis addresses the actual business question?",
          "Describe a time you had to translate a vague request into a concrete analysis plan.",
        ],
        level_descriptors: {
          basic: "Works on well-defined analytical tasks",
          intermediate: "Translates business questions into analyses independently",
          advanced: "Proactively identifies analytical opportunities from business context",
          expert: "Shapes business strategy through analytical leadership",
        },
      },
      {
        name: "Data Storytelling",
        category: "soft_skill",
        description: "Presenting data findings in compelling, actionable narratives",
        sample_questions: [
          "How do you present complex findings to a non-technical audience?",
          "Describe a presentation where your data storytelling changed a decision.",
        ],
        level_descriptors: {
          basic: "Presents findings with basic structure",
          intermediate: "Creates clear narratives with appropriate context",
          advanced: "Delivers compelling data stories that drive action",
          expert: "Builds data-driven decision culture through storytelling",
        },
      },
      {
        name: "Stakeholder Communication",
        category: "soft_skill",
        description: "Managing relationships with business stakeholders, understanding their needs, and delivering insights they can act on",
        sample_questions: [
          "A VP asks you for a 'quick number' but you know the answer requires nuance. How do you handle it?",
          "Tell me about a time a stakeholder disagreed with your analysis. How did you navigate the conversation?",
        ],
        level_descriptors: {
          basic: "Responds to data requests clearly, delivers results on time",
          intermediate: "Proactively clarifies ambiguous requests, tailors depth and format to the audience, flags caveats without burying the insight",
          advanced: "Builds trusted relationships with senior leaders, influences decision-making by framing analysis around business context, manages competing priorities across multiple stakeholders",
          expert: "Operates as a strategic advisor to executives, shapes how the organization uses data in decision-making, builds feedback loops between data teams and business units",
        },
      },
    ],
    sub_niches: [
      {
        id: "data_science",
        label: "Data Science",
        additional_skills: ["Deep Learning", "NLP", "Computer Vision", "MLOps"],
        interview_hints: "Focus on model selection rationale, feature engineering, and production deployment.",
      },
      {
        id: "analytics_engineering",
        label: "Analytics Engineering",
        additional_skills: ["dbt", "Data Modeling", "Data Quality Testing", "Semantic Layer Design"],
        interview_hints: "Focus on data modeling decisions, transformation logic, and data quality approaches.",
      },
      {
        id: "business_intelligence",
        label: "Business Intelligence",
        additional_skills: ["BI Tools (Tableau/Looker/PowerBI)", "Self-service Analytics", "KPI Framework Design"],
        interview_hints: "Focus on dashboard design philosophy, self-service enablement, and stakeholder management.",
      },
    ],
  };
