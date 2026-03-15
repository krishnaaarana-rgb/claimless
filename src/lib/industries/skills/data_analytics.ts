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
      {
        name: "Python for Data",
        category: "hard_skill",
        description: "Using Python data tools — pandas, numpy, scikit-learn, and Jupyter notebooks — for data manipulation, analysis, and exploration",
        sample_questions: [
          "Walk me through how you'd approach cleaning and analysing a messy dataset with 5 million rows and 200 columns in Python. What libraries do you reach for and how do you handle memory constraints?",
          "You need to build a reproducible analysis pipeline that a non-technical stakeholder can re-run monthly. How do you structure the project and what tooling do you use?",
        ],
        level_descriptors: {
          basic: "Writes pandas scripts for data loading, filtering, and basic aggregations, uses Jupyter notebooks for exploratory analysis, creates simple plots with matplotlib",
          intermediate: "Builds efficient data pipelines with pandas and numpy, handles complex transformations (merges, pivots, window functions), uses scikit-learn for standard ML tasks, writes clean and documented notebooks",
          advanced: "Optimises Python code for large-scale data processing (chunking, vectorisation, Dask), builds reusable analysis libraries, integrates Python workflows with production systems, mentors others on Python best practices",
          expert: "Architects Python-based analytics platforms, develops custom libraries and frameworks for the organisation, contributes to open-source data tools, defines coding standards for the data team",
        },
      },
      {
        name: "Cloud Data Platforms",
        category: "hard_skill",
        description: "Working with modern cloud data platforms — Snowflake, BigQuery, Redshift, Databricks, and dbt — to build and manage scalable data infrastructure",
        sample_questions: [
          "You're migrating from an on-premise data warehouse to a cloud platform. Walk me through how you'd evaluate Snowflake vs. BigQuery vs. Databricks for your use case.",
          "Your Snowflake costs have tripled in 6 months and finance is asking questions. How do you diagnose the problem and optimise spend without breaking anything?",
        ],
        level_descriptors: {
          basic: "Queries data in cloud platforms, understands basic concepts (compute/storage separation, clustering, partitioning), runs dbt models written by others",
          intermediate: "Builds and maintains data models in dbt, configures platform features (materialisation strategies, caching, access controls), monitors query performance and costs",
          advanced: "Architects data platform solutions for the organisation, designs multi-environment setups (dev/staging/prod), optimises cost and performance at scale, leads platform migrations, builds dbt projects with testing and documentation",
          expert: "Defines cloud data platform strategy across the enterprise, evaluates and adopts emerging platforms, builds platform engineering teams, shapes data architecture decisions that balance cost, performance, and flexibility",
        },
      },
      {
        name: "BI & Dashboarding",
        category: "hard_skill",
        description: "Building dashboards and self-serve analytics experiences using tools like Tableau, Power BI, and Looker, with a focus on design principles and enabling data-driven decisions",
        sample_questions: [
          "You're building a dashboard for the executive team and they want 30 metrics on one page. How do you push back and what do you build instead?",
          "Your company has invested in Looker but adoption is low — people still ask the data team for ad-hoc queries. How do you build a self-serve analytics culture?",
        ],
        level_descriptors: {
          basic: "Creates basic dashboards with filters and drill-downs, uses BI tools to answer defined questions, understands chart type selection",
          intermediate: "Designs dashboards with clear visual hierarchy and storytelling, builds LookML models or Tableau data sources, creates self-serve views for business users, manages dashboard performance",
          advanced: "Defines BI strategy and tool standards for the organisation, designs semantic layers, builds dashboard design guidelines, leads BI tool evaluations and migrations, trains business users on self-serve analytics",
          expert: "Architects enterprise BI platforms serving hundreds of users, develops analytics product thinking for internal tools, shapes how the organisation consumes and acts on data, builds BI centres of excellence",
        },
      },
      {
        name: "Experimentation & A/B Testing",
        category: "hard_skill",
        description: "Designing and analysing controlled experiments including hypothesis formation, sample sizing, statistical significance testing, and guardrail metric monitoring",
        sample_questions: [
          "Walk me through how you'd design an A/B test for a checkout flow change. How do you determine sample size, and what would make you stop the test early?",
          "Your A/B test shows a statistically significant lift in conversion but a drop in average order value. How do you make a recommendation?",
        ],
        level_descriptors: {
          basic: "Understands A/B testing fundamentals (control vs. treatment, statistical significance), reads experiment results, flags when sample sizes seem too small",
          intermediate: "Designs experiments end-to-end (hypothesis, success metrics, guardrails, sample size calculation), analyses results with appropriate statistical methods, communicates findings with confidence intervals",
          advanced: "Runs complex experimentation programs (multi-variate, sequential testing, interaction effects), builds guardrail metric frameworks, detects and handles novelty effects and selection bias, develops experimentation standards for the team",
          expert: "Builds experimentation platforms and culture for the organisation, develops Bayesian experimentation frameworks, leads statistical innovation (multi-armed bandits, causal inference), shapes product strategy through experimentation insights",
        },
      },
      {
        name: "Data Modelling",
        category: "hard_skill",
        description: "Designing data models including star schema, dimensional modelling, normalisation, and data vault approaches to support analytics and reporting at scale",
        sample_questions: [
          "You're designing the data model for a new analytics warehouse. Walk me through how you decide between a star schema and a data vault approach.",
          "A fact table is growing by 100 million rows per day and downstream queries are getting slower. How do you diagnose and redesign?",
        ],
        level_descriptors: {
          basic: "Understands relational modelling concepts (normalisation, primary/foreign keys), reads and navigates existing star schemas, creates basic dimension and fact tables",
          intermediate: "Designs dimensional models (star and snowflake schemas), handles slowly changing dimensions, builds conformed dimensions across business processes, documents data models clearly",
          advanced: "Architects enterprise data models spanning multiple domains, implements data vault methodology, designs for both analytical and operational use cases, optimises models for query performance at scale",
          expert: "Defines data modelling strategy and standards for the organisation, evaluates and adopts emerging modelling paradigms, leads data model governance, builds modelling practices that balance flexibility with consistency",
        },
      },
      {
        name: "Real-time Analytics",
        category: "hard_skill",
        description: "Building real-time data pipelines and dashboards using streaming technologies like Kafka and Kinesis, and event-driven architecture patterns",
        sample_questions: [
          "Walk me through how you'd build a real-time dashboard for monitoring transaction fraud. What architecture would you use and what trade-offs would you make between latency and accuracy?",
          "Your batch pipeline runs nightly but the business wants near-real-time reporting. How do you evaluate whether to build a streaming pipeline and what's your implementation approach?",
        ],
        level_descriptors: {
          basic: "Understands the difference between batch and streaming, reads from Kafka topics or Kinesis streams, builds basic real-time visualisations using existing infrastructure",
          intermediate: "Builds streaming pipelines with Kafka or Kinesis, implements event-driven data flows, handles late-arriving data and windowing, creates real-time dashboards with appropriate refresh strategies",
          advanced: "Architects real-time analytics platforms, designs event schemas and streaming topologies, implements exactly-once processing semantics, balances real-time and batch approaches (Lambda/Kappa architecture), optimises for throughput and latency",
          expert: "Defines enterprise streaming strategy, builds real-time analytics platforms serving mission-critical use cases (fraud detection, operational monitoring), develops event-driven architecture standards, evaluates emerging streaming technologies",
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
