import type { IndustryDefinition } from "@/lib/industry-skills";

export const technologyIndustry: IndustryDefinition = {
    id: "technology",
    label: "Technology & Engineering",
    icon: "💻",
    description: "Software engineering, DevOps, data engineering, and IT roles",
    interview_context: {
      persona:
        "You are a senior engineering manager. You evaluate candidates on their ability to solve real problems, not trivia. Probe for system design thinking, debugging approach, and collaboration.",
      tone: "Technical but conversational — focus on problem-solving approach over memorized answers.",
      domain_terminology: [
        "microservices", "CI/CD", "distributed systems", "API design",
        "database indexing", "caching", "load balancing", "observability",
        "version control", "agile", "technical debt", "code review",
      ],
      red_flags_to_probe: [
        "Cannot explain their own code or architecture decisions",
        "No mention of testing or quality practices",
        "Inability to discuss tradeoffs in technical decisions",
        "No experience with production systems or debugging",
      ],
      what_great_looks_like:
        "Strong candidates articulate tradeoffs, show depth in their domain, describe real debugging stories, and demonstrate they build for maintainability and team productivity — not just cleverness.",
    },
    hard_skills: [
      {
        name: "System Design",
        category: "hard_skill",
        description: "Designing scalable, reliable software systems and architectures",
        sample_questions: [
          "How would you design a system that needs to handle 10x your current load?",
          "Walk me through an architecture decision you made and the tradeoffs involved.",
        ],
        level_descriptors: {
          basic: "Understands basic client-server architecture",
          intermediate: "Designs simple systems with appropriate patterns",
          advanced: "Architects complex distributed systems with resilience",
          expert: "Designs systems at massive scale, makes organization-wide technical decisions",
        },
      },
      {
        name: "Code Quality & Testing",
        category: "hard_skill",
        description: "Writing clean, tested, maintainable code",
        sample_questions: [
          "What's your testing strategy? How do you decide what to test?",
          "Describe a time when your tests caught a critical bug before production.",
        ],
        level_descriptors: {
          basic: "Writes basic unit tests, follows coding standards",
          intermediate: "Writes comprehensive tests, practices code review",
          advanced: "Designs testing strategies, improves team code quality",
          expert: "Defines quality standards and practices for the organization",
        },
      },
      {
        name: "Database Design",
        category: "hard_skill",
        description: "Schema design, query optimization, and data modeling",
        sample_questions: [
          "How do you approach schema design for a new feature?",
          "Describe a query performance issue you diagnosed and fixed.",
        ],
        level_descriptors: {
          basic: "Creates basic schemas, writes simple queries",
          intermediate: "Designs normalized schemas, optimizes common queries",
          advanced: "Handles complex data models, sharding, replication strategies",
          expert: "Architects data platforms, makes database technology decisions",
        },
      },
      {
        name: "DevOps & Infrastructure",
        category: "hard_skill",
        description: "CI/CD, cloud infrastructure, containerization, monitoring",
        sample_questions: [
          "Describe your ideal CI/CD pipeline and why.",
          "How do you approach debugging a production incident?",
        ],
        level_descriptors: {
          basic: "Uses existing CI/CD pipelines, basic cloud familiarity",
          intermediate: "Sets up CI/CD, manages cloud resources, basic monitoring",
          advanced: "Designs infrastructure as code, implements observability",
          expert: "Architects cloud-native platforms, leads SRE practices",
        },
      },
      {
        name: "API Design",
        category: "hard_skill",
        description: "Designing clean, well-documented, versioned APIs",
        sample_questions: [
          "What principles guide your API design decisions?",
          "How do you handle backward compatibility when evolving an API?",
        ],
        level_descriptors: {
          basic: "Consumes APIs, builds simple endpoints",
          intermediate: "Designs RESTful APIs with proper error handling",
          advanced: "Designs API platforms with versioning, rate limiting, auth",
          expert: "Defines API strategy and governance for the organization",
        },
      },
      {
        name: "Security Practices",
        category: "hard_skill",
        description: "Application security, authentication, authorization, and secure coding",
        sample_questions: [
          "How do you approach security in your development process?",
          "Describe a security vulnerability you discovered or addressed.",
        ],
        level_descriptors: {
          basic: "Follows OWASP basics, uses parameterized queries",
          intermediate: "Implements auth/authz, handles secrets properly",
          advanced: "Designs security architecture, conducts threat modeling",
          expert: "Leads security strategy, responds to incidents",
        },
      },
    ],
    soft_skills: [
      {
        name: "Technical Communication",
        category: "soft_skill",
        description: "Explaining complex technical concepts to various audiences",
        sample_questions: [
          "How do you explain a technical decision to a non-technical stakeholder?",
          "Describe a time when clear communication prevented a technical problem.",
        ],
        level_descriptors: {
          basic: "Can explain their own work to teammates",
          intermediate: "Writes clear documentation, presents to broader teams",
          advanced: "Communicates effectively to executives and non-technical stakeholders",
          expert: "Defines technical communication standards, represents engineering externally",
        },
      },
      {
        name: "Collaboration & Code Review",
        category: "soft_skill",
        description: "Working effectively with teammates, giving and receiving feedback",
        sample_questions: [
          "How do you approach giving feedback in a code review?",
          "Describe a disagreement with a teammate about a technical approach.",
        ],
        level_descriptors: {
          basic: "Participates in code reviews, accepts feedback",
          intermediate: "Gives constructive reviews, collaborates on design",
          advanced: "Mentors others, resolves technical disagreements productively",
          expert: "Builds collaborative engineering culture, coaches on feedback",
        },
      },
      {
        name: "Problem Decomposition",
        category: "soft_skill",
        description: "Breaking complex problems into manageable, shippable pieces",
        sample_questions: [
          "How do you approach a large ambiguous project?",
          "Describe a time you had to simplify scope without sacrificing the core value.",
        ],
        level_descriptors: {
          basic: "Can break down assigned tasks into subtasks",
          intermediate: "Decomposes features into shippable increments",
          advanced: "Breaks down complex systems into phased rollouts",
          expert: "Defines decomposition strategies for org-level initiatives",
        },
      },
      {
        name: "Ownership & Reliability",
        category: "soft_skill",
        description: "Taking responsibility for outcomes, following through on commitments",
        sample_questions: [
          "Tell me about a time something you built broke in production. What did you do?",
          "How do you handle on-call responsibilities?",
        ],
        level_descriptors: {
          basic: "Completes assigned work reliably",
          intermediate: "Owns features end-to-end including monitoring",
          advanced: "Takes ownership of systems, proactively addresses issues",
          expert: "Drives accountability culture, owns critical systems",
        },
      },
    ],
    sub_niches: [
      {
        id: "frontend",
        label: "Frontend Engineering",
        additional_skills: ["UI/UX Sensibility", "Performance Optimization", "Accessibility (a11y)", "Design Systems"],
        interview_hints: "Focus on user experience thinking, performance awareness, and component architecture.",
      },
      {
        id: "backend",
        label: "Backend Engineering",
        additional_skills: ["Distributed Systems", "Message Queues", "Caching Strategies", "Data Pipelines"],
        interview_hints: "Probe for system design depth, production debugging stories, and scalability thinking.",
      },
      {
        id: "data_engineering",
        label: "Data Engineering",
        additional_skills: ["ETL/ELT Pipelines", "Data Warehousing", "Streaming (Kafka)", "Data Quality"],
        interview_hints: "Focus on pipeline reliability, data modeling decisions, and handling data at scale.",
      },
      {
        id: "devops_sre",
        label: "DevOps / SRE",
        additional_skills: ["Infrastructure as Code", "Incident Management", "SLO/SLI Design", "Chaos Engineering"],
        interview_hints: "Focus on incident response stories, reliability engineering practices, and automation mindset.",
      },
      {
        id: "mobile",
        label: "Mobile Development",
        additional_skills: ["Platform Guidelines (iOS/Android)", "App Performance", "Offline-first Design", "Push Notifications"],
        interview_hints: "Focus on platform-specific knowledge, performance optimization, and UX sensibility.",
      },
    ],
  };
