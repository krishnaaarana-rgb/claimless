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
      // ── Programming Languages ──────────────────────────────────────────
      {
        name: "Python",
        category: "hard_skill",
        description: "Building backend services, data pipelines, scripts, and ML applications using Python",
        sample_questions: [
          "Walk me through how you'd build a data pipeline that processes 1M records daily — what libraries and architecture would you choose?",
          "You inherit a Django monolith with 8-second response times on key endpoints. How do you profile it and what are the first three things you investigate?",
        ],
        level_descriptors: {
          basic: "Writes simple scripts and CLI tools, uses pip for dependency management, understands basic data structures",
          intermediate: "Builds web services with Django or FastAPI, writes idiomatic Python with type hints, uses virtual environments and testing frameworks",
          advanced: "Designs async services, optimises performance with profiling and C extensions, builds production ML pipelines, contributes to internal libraries",
          expert: "Architects large-scale Python platforms, makes strategic decisions on concurrency models and runtime trade-offs, mentors teams on Pythonic design patterns",
        },
      },
      {
        name: "JavaScript/TypeScript",
        category: "hard_skill",
        description: "Building frontend interfaces, backend services, and fullstack applications with JavaScript and TypeScript",
        sample_questions: [
          "You're converting a 200-file JavaScript codebase to TypeScript. What's your migration strategy and how do you avoid blocking the rest of the team?",
          "A production Node.js service starts leaking memory after deployments. Walk me through your debugging approach from first alert to root cause.",
        ],
        level_descriptors: {
          basic: "Writes working JS/TS code, understands closures and async/await basics, uses npm packages effectively",
          intermediate: "Designs TypeScript interfaces and generics, handles complex async flows, configures build tooling and linting",
          advanced: "Architects type-safe fullstack systems, writes custom type utilities, optimises bundle size and runtime performance across large codebases",
          expert: "Defines TypeScript standards for the organisation, makes strategic runtime and framework decisions, contributes to open-source tooling",
        },
      },
      {
        name: "Java",
        category: "hard_skill",
        description: "Building enterprise backend systems, Android applications, and large-scale distributed services in Java",
        sample_questions: [
          "Your Spring Boot service handles 5,000 RPS but latency spikes during garbage collection pauses. How do you diagnose and tune GC behaviour?",
          "You need to decompose a monolithic Java application into services. Walk me through how you identify service boundaries and manage shared data.",
        ],
        level_descriptors: {
          basic: "Writes Java classes and interfaces, uses Maven/Gradle, understands OOP principles and basic collections",
          intermediate: "Builds REST services with Spring Boot, writes unit and integration tests, handles concurrency with threads and executors",
          advanced: "Designs large-scale services with proper domain modelling, tunes JVM performance, implements distributed patterns like circuit breakers and retries",
          expert: "Architects enterprise Java platforms, makes strategic JVM and framework decisions, leads performance engineering and mentors senior engineers",
        },
      },
      {
        name: "Go",
        category: "hard_skill",
        description: "Building high-performance backend services, CLI tools, and cloud infrastructure software in Go",
        sample_questions: [
          "You're building a service that needs to fan out to 50 downstream APIs concurrently and aggregate responses within 500ms. How do you structure the goroutines and error handling?",
          "Your Go service has a goroutine leak that slowly consumes memory over days. How do you find and fix it?",
        ],
        level_descriptors: {
          basic: "Writes Go functions and structs, understands goroutines and channels at a basic level, uses go modules",
          intermediate: "Builds production HTTP services, writes idiomatic Go with proper error handling, uses interfaces effectively for testability",
          advanced: "Designs concurrent systems with worker pools and context propagation, profiles and optimises CPU/memory, builds internal libraries and frameworks",
          expert: "Architects high-throughput Go platforms, makes strategic concurrency and architecture decisions, contributes to the Go ecosystem",
        },
      },
      {
        name: "Rust",
        category: "hard_skill",
        description: "Building performance-critical systems, CLI tools, and safe concurrent software in Rust",
        sample_questions: [
          "You're rewriting a latency-sensitive C++ service in Rust. How do you handle the ownership model for a shared in-memory cache accessed by multiple threads?",
          "Walk me through how you'd design error handling across a Rust application with multiple layers — CLI, business logic, and database access.",
        ],
        level_descriptors: {
          basic: "Writes basic Rust with ownership, borrowing, and lifetimes, uses cargo and common crates, handles simple pattern matching",
          intermediate: "Builds production binaries, uses traits and generics effectively, writes safe concurrent code with Arc/Mutex, handles async with Tokio",
          advanced: "Designs zero-cost abstractions, writes unsafe code when justified with safety documentation, optimises for cache locality and allocation patterns",
          expert: "Architects large-scale Rust systems, makes strategic decisions on async runtimes and FFI boundaries, mentors teams on ownership design patterns",
        },
      },
      // ── Frontend ───────────────────────────────────────────────────────
      {
        name: "React",
        category: "hard_skill",
        description: "Building component-based user interfaces with React, including hooks, state management, and server-side rendering",
        sample_questions: [
          "Your app has a component that re-renders 50 times per second causing jank. Walk me through how you diagnose the cause and what specific fixes you apply.",
          "You're building a dashboard that shows real-time data from 5 different WebSocket streams. How do you architect the state management and prevent unnecessary re-renders?",
        ],
        level_descriptors: {
          basic: "Builds functional components with hooks, handles basic state and props, uses common libraries like React Router",
          intermediate: "Manages complex state with context or external stores, writes custom hooks, implements code splitting and lazy loading",
          advanced: "Architects large React applications with SSR/RSC, optimises rendering performance with profiling, designs reusable component libraries",
          expert: "Defines frontend architecture strategy for the organisation, makes framework-level decisions, builds design systems used across multiple teams",
        },
      },
      {
        name: "Frontend Architecture",
        category: "hard_skill",
        description: "Designing performant, accessible, and maintainable frontend systems including bundling, rendering strategies, and responsive design",
        sample_questions: [
          "Your e-commerce site scores 35 on Lighthouse performance. Walk me through a systematic approach to get it above 90 without breaking features.",
          "You need to support the same product across mobile web, desktop, and an embedded WebView. How do you architect the frontend to maximise code sharing without compromising UX?",
        ],
        level_descriptors: {
          basic: "Writes responsive CSS, follows accessibility basics, uses a bundler like Webpack or Vite with default config",
          intermediate: "Configures build pipelines, implements lazy loading and caching strategies, builds accessible forms and navigation",
          advanced: "Designs micro-frontend architectures, implements advanced performance optimisations like streaming SSR and edge rendering, leads WCAG compliance efforts",
          expert: "Defines frontend platform strategy across the organisation, makes build tooling and rendering architecture decisions, mentors teams on performance engineering",
        },
      },
      // ── Backend ────────────────────────────────────────────────────────
      {
        name: "Node.js",
        category: "hard_skill",
        description: "Building server-side applications with Node.js including HTTP servers, background workers, and real-time services",
        sample_questions: [
          "Your Express API starts timing out under load but CPU usage is only 20%. What's your mental model for diagnosing event loop blocking, and what tools do you reach for?",
          "You need to process a 10GB CSV file upload in a Node.js service without running out of memory. Walk me through your approach.",
        ],
        level_descriptors: {
          basic: "Builds simple Express/Fastify servers, understands middleware and routing, uses npm packages for common tasks",
          intermediate: "Designs RESTful services with proper error handling and validation, uses streams for large data, writes integration tests with Supertest or similar",
          advanced: "Architects multi-service Node.js backends, implements worker threads for CPU-bound tasks, designs connection pooling and graceful shutdown patterns",
          expert: "Makes strategic decisions on Node.js vs alternative runtimes, architects real-time platforms, leads performance tuning of event loop and V8 internals",
        },
      },
      {
        name: "Backend Architecture",
        category: "hard_skill",
        description: "Designing backend systems including service decomposition, messaging patterns, event-driven architectures, and API gateway design",
        sample_questions: [
          "Your monolith is hitting scaling limits. Walk me through how you decide which pieces to extract into services first and how you handle data that's currently joined across those boundaries.",
          "You're designing an order processing system where failures at any step need to be recoverable. How do you architect this with event-driven patterns?",
        ],
        level_descriptors: {
          basic: "Understands request-response patterns, builds simple CRUD backends, follows existing service patterns",
          intermediate: "Designs services with clear boundaries, implements message queues for async processing, handles distributed transactions with saga patterns",
          advanced: "Architects event-driven systems with CQRS, designs API gateways and service mesh configurations, handles complex cross-service consistency requirements",
          expert: "Defines backend architecture strategy for the organisation, makes build-vs-buy platform decisions, leads migrations from monolith to distributed systems",
        },
      },
      // ── Cloud & Infrastructure ─────────────────────────────────────────
      {
        name: "AWS",
        category: "hard_skill",
        description: "Designing and operating production systems on AWS including compute, storage, networking, and managed services",
        sample_questions: [
          "You're migrating a stateful application to AWS. Walk me through your architecture choices for compute, storage, and networking, and how you handle the migration with minimal downtime.",
          "Your AWS bill jumped 40% last month. How do you investigate what changed and implement cost controls without impacting performance?",
        ],
        level_descriptors: {
          basic: "Deploys to EC2/S3, uses the AWS console, understands IAM basics and security groups",
          intermediate: "Designs VPC architectures, uses Lambda and managed services effectively, implements proper IAM roles and policies",
          advanced: "Architects multi-region deployments, designs for high availability with auto-scaling and failover, implements cost optimisation strategies",
          expert: "Designs AWS landing zones for large organisations, makes strategic cloud architecture decisions, leads cloud migrations and FinOps practices",
        },
      },
      {
        name: "Docker & Containers",
        category: "hard_skill",
        description: "Building, optimising, and deploying containerised applications including image design, networking, and registry management",
        sample_questions: [
          "Your Docker image is 2.5GB and takes 12 minutes to build. Walk me through how you reduce the size and speed up the build without breaking the application.",
          "You need to run 15 interconnected services locally for development. How do you set up Docker Compose to make this manageable and how do you handle service dependencies?",
        ],
        level_descriptors: {
          basic: "Writes basic Dockerfiles, runs containers locally, uses Docker Compose for simple setups",
          intermediate: "Builds multi-stage Dockerfiles, configures networking between containers, manages images in a registry, implements health checks",
          advanced: "Optimises images for security and size, designs container orchestration patterns, implements rootless and distroless builds for production",
          expert: "Defines container strategy for the organisation, architects build pipelines for hundreds of services, leads container security and compliance initiatives",
        },
      },
      {
        name: "Kubernetes",
        category: "hard_skill",
        description: "Orchestrating containerised workloads at scale including deployments, scaling, networking, and service mesh configuration",
        sample_questions: [
          "A pod keeps getting OOMKilled in production but works fine in staging. Walk me through your investigation from kubectl commands to root cause.",
          "You need to deploy a stateful database cluster on Kubernetes. What are the trade-offs vs managed services, and if you proceed, how do you handle persistent storage and failover?",
        ],
        level_descriptors: {
          basic: "Deploys applications with kubectl, understands pods, services, and deployments, reads logs and basic troubleshooting",
          intermediate: "Configures HPA and resource limits, sets up Ingress and network policies, uses Helm charts, implements rolling update strategies",
          advanced: "Designs multi-cluster architectures, implements service mesh with Istio or Linkerd, builds custom operators, manages stateful workloads",
          expert: "Architects Kubernetes platforms for large organisations, defines cluster strategy and multi-tenancy models, leads platform engineering teams",
        },
      },
      {
        name: "Terraform/Infrastructure as Code",
        category: "hard_skill",
        description: "Defining and managing cloud infrastructure declaratively using Terraform, OpenTofu, or similar IaC tools",
        sample_questions: [
          "Your Terraform state file has drifted from reality after someone made manual console changes. How do you reconcile the state without destroying resources?",
          "You're setting up Terraform for a team of 20 engineers across 3 environments. How do you structure modules, state, and CI/CD to prevent conflicts and enforce standards?",
        ],
        level_descriptors: {
          basic: "Writes basic Terraform resources, runs plan and apply, understands state basics",
          intermediate: "Designs reusable modules, manages remote state with locking, uses workspaces or directory structure for multiple environments",
          advanced: "Architects Terraform at scale with module registries, implements policy-as-code with Sentinel or OPA, designs state management strategies for large teams",
          expert: "Defines IaC strategy for the organisation, evaluates and adopts infrastructure tooling, leads platform engineering and developer experience initiatives",
        },
      },
      // ── Data ───────────────────────────────────────────────────────────
      {
        name: "SQL & Relational Databases",
        category: "hard_skill",
        description: "Designing schemas, writing performant queries, and operating relational databases like PostgreSQL and MySQL in production",
        sample_questions: [
          "A query that used to take 50ms is now taking 30 seconds after the table grew to 500M rows. Walk me through how you diagnose and fix it using EXPLAIN ANALYZE.",
          "You're designing the schema for a multi-tenant SaaS application. How do you structure tenant isolation, and what are the trade-offs between shared schema, separate schemas, and separate databases?",
        ],
        level_descriptors: {
          basic: "Writes SELECT/INSERT/UPDATE queries, creates tables with proper data types, understands basic JOINs and WHERE clauses",
          intermediate: "Designs normalised schemas, writes complex queries with CTEs and window functions, creates effective indexes, handles migrations safely",
          advanced: "Optimises query plans with deep understanding of the query planner, implements partitioning and replication, designs for high-write workloads",
          expert: "Architects database platforms for large-scale systems, makes strategic decisions on sharding and replication topologies, leads database reliability engineering",
        },
      },
      {
        name: "NoSQL Databases",
        category: "hard_skill",
        description: "Designing data models and operating NoSQL databases including document stores, key-value stores, and wide-column databases",
        sample_questions: [
          "You need to store user activity events with flexible schemas and query them by user, time range, and event type. Walk me through whether you'd choose MongoDB, DynamoDB, or something else, and why.",
          "Your Redis instance is using 90% of available memory and you can't just add more. How do you investigate what's consuming space and what strategies do you apply to reduce usage?",
        ],
        level_descriptors: {
          basic: "Performs basic CRUD operations with MongoDB or Redis, understands when NoSQL might be appropriate vs SQL",
          intermediate: "Designs document schemas considering query patterns, implements caching strategies with TTL and eviction policies, uses secondary indexes",
          advanced: "Architects multi-model data solutions, designs DynamoDB tables with composite keys for complex access patterns, implements Redis data structures for specialised use cases",
          expert: "Makes strategic database technology decisions for the organisation, designs polyglot persistence architectures, leads data platform engineering",
        },
      },
      {
        name: "Data Engineering",
        category: "hard_skill",
        description: "Building and operating data pipelines, ETL/ELT processes, and streaming architectures with tools like Spark, Kafka, and Airflow",
        sample_questions: [
          "You need to build a pipeline that ingests clickstream data from 50 sources, processes it, and makes it queryable within 5 minutes. Walk me through your architecture choices.",
          "Your daily ETL job started failing silently — downstream dashboards show stale data but no alerts fired. How do you fix this and prevent it from happening again?",
        ],
        level_descriptors: {
          basic: "Writes basic ETL scripts, moves data between databases, uses cron or simple schedulers, understands batch vs streaming concepts",
          intermediate: "Builds pipelines with Airflow or similar orchestrators, implements data quality checks, uses Spark for batch processing, handles schema evolution",
          advanced: "Designs streaming architectures with Kafka, builds real-time and batch hybrid pipelines, implements data lakehouse patterns, optimises for cost and latency",
          expert: "Architects enterprise data platforms, makes strategic tooling and architecture decisions for the data organisation, leads data reliability and governance initiatives",
        },
      },
      // ── AI/ML ──────────────────────────────────────────────────────────
      {
        name: "Machine Learning Engineering",
        category: "hard_skill",
        description: "Training, evaluating, deploying, and monitoring machine learning models in production systems",
        sample_questions: [
          "Your ML model performs well in offline evaluation but degrades in production over 3 months. Walk me through how you detect this, diagnose the cause, and set up systems to prevent it.",
          "You need to serve a model with 200ms latency at 1,000 RPS. What's your approach to model optimisation and serving infrastructure?",
        ],
        level_descriptors: {
          basic: "Trains models with scikit-learn or similar, understands train/test splits and basic metrics, uses Jupyter notebooks for experimentation",
          intermediate: "Builds reproducible training pipelines, implements feature engineering, deploys models with proper versioning, monitors basic model metrics",
          advanced: "Designs MLOps platforms with automated retraining, implements A/B testing for models, optimises inference latency, handles model governance and lineage",
          expert: "Architects ML platforms for the organisation, makes strategic decisions on build-vs-buy for ML infrastructure, leads applied ML teams and defines best practices",
        },
      },
      {
        name: "LLM Integration",
        category: "hard_skill",
        description: "Integrating large language models into applications including prompt engineering, RAG architectures, agent design, and structured outputs",
        sample_questions: [
          "You're building a customer support bot that needs to answer questions from a 10,000-page knowledge base accurately. Walk me through your RAG architecture and how you handle hallucination.",
          "Your LLM-powered feature works well in demos but produces inconsistent results in production. How do you systematically improve reliability and implement evaluation?",
        ],
        level_descriptors: {
          basic: "Calls LLM APIs with basic prompts, uses prompt templates, understands token limits and basic prompt engineering techniques",
          intermediate: "Implements RAG with vector databases, designs structured output schemas, builds multi-turn conversations, handles rate limiting and fallbacks",
          advanced: "Architects agent systems with tool use, designs evaluation frameworks for LLM outputs, implements fine-tuning pipelines, optimises cost and latency across the stack",
          expert: "Defines LLM strategy for the organisation, designs production-grade AI platforms with guardrails and observability, leads teams building AI-native products",
        },
      },
      // ── DevOps & SRE ───────────────────────────────────────────────────
      {
        name: "CI/CD Pipelines",
        category: "hard_skill",
        description: "Designing and maintaining continuous integration and deployment pipelines with automated testing and safe deployment strategies",
        sample_questions: [
          "Your CI pipeline takes 45 minutes and developers are bypassing it. How do you reduce it to under 10 minutes without sacrificing test coverage?",
          "You need to implement zero-downtime deployments for a stateful service that handles financial transactions. Walk me through your deployment strategy and rollback plan.",
        ],
        level_descriptors: {
          basic: "Uses existing CI/CD pipelines, understands build-test-deploy stages, can add simple test steps to a pipeline",
          intermediate: "Builds CI/CD pipelines with GitHub Actions or Jenkins, implements automated testing gates, configures deployment to staging and production",
          advanced: "Designs pipeline architectures with parallelism and caching, implements canary and blue-green deployments, builds deployment dashboards and automated rollbacks",
          expert: "Defines CI/CD strategy for the organisation, architects shared pipeline platforms for hundreds of services, leads developer experience and deployment reliability",
        },
      },
      {
        name: "Observability & Monitoring",
        category: "hard_skill",
        description: "Implementing logging, metrics, distributed tracing, and alerting systems to maintain visibility into production systems",
        sample_questions: [
          "Users report intermittent slowness but your dashboards show everything green. How do you instrument the system to find the issue, and what's missing from your current observability?",
          "You're designing the observability stack for a new microservices platform with 30 services. What do you implement for logging, metrics, and tracing, and how do you keep costs manageable?",
        ],
        level_descriptors: {
          basic: "Reads logs to debug issues, understands basic metrics like CPU and memory, responds to existing alerts",
          intermediate: "Implements structured logging, creates dashboards with Grafana or Datadog, sets up meaningful alerts with low false-positive rates",
          advanced: "Designs distributed tracing across services, implements SLO-based alerting, builds custom metrics for business-critical paths, leads incident response processes",
          expert: "Architects observability platforms for the organisation, defines SRE practices and incident management culture, makes strategic vendor and tooling decisions",
        },
      },
      // ── Mobile ─────────────────────────────────────────────────────────
      {
        name: "iOS Development",
        category: "hard_skill",
        description: "Building native iOS applications with Swift, SwiftUI, and UIKit including App Store submission and platform best practices",
        sample_questions: [
          "Your iOS app's scroll performance drops below 60fps in a complex list view. Walk me through how you profile with Instruments and what specific optimisations you apply.",
          "You need to add offline support to an existing iOS app that currently requires network for all features. How do you architect the local data layer and sync logic?",
        ],
        level_descriptors: {
          basic: "Builds simple iOS apps with SwiftUI, understands view lifecycle and basic navigation, submits apps to TestFlight",
          intermediate: "Implements complex UI with custom components, manages state with Combine or async/await, integrates REST APIs, writes unit and UI tests",
          advanced: "Architects large iOS applications with clean module boundaries, optimises performance and memory usage, implements background processing and push notifications",
          expert: "Defines iOS architecture strategy for the organisation, makes strategic decisions on SwiftUI vs UIKit adoption, leads mobile platform teams and mentors senior developers",
        },
      },
      {
        name: "Android Development",
        category: "hard_skill",
        description: "Building native Android applications with Kotlin, Jetpack Compose, and Android SDK including Play Store submission and platform best practices",
        sample_questions: [
          "Your Android app crashes on 5% of devices but you can't reproduce locally. How do you use crash reporting and device labs to diagnose and fix fragmentation-related issues?",
          "You're building a feature that needs to work reliably in the background — syncing data even when the app is killed. Walk me through your approach with WorkManager and the trade-offs.",
        ],
        level_descriptors: {
          basic: "Builds simple Android apps with Jetpack Compose, understands Activity/Fragment lifecycle, uses Gradle for builds",
          intermediate: "Implements complex UI with custom composables, manages state with ViewModel and Flow, integrates APIs with Retrofit, writes unit and instrumented tests",
          advanced: "Architects large Android applications with multi-module structure, optimises for battery and performance, implements background processing and deep linking strategies",
          expert: "Defines Android architecture strategy for the organisation, makes strategic decisions on Compose adoption and Kotlin Multiplatform, leads mobile platform teams",
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
