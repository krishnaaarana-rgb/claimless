import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createAdminClient();

  // Idempotent: check if demo company already exists
  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", "claimless-demo")
    .single();

  if (existing) {
    return NextResponse.json({
      message: "Demo data already exists. Skipping.",
      company_id: existing.id,
      skipped: true,
    });
  }

  // 1. Create company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: "Claimless Demo",
      slug: "claimless-demo",
      plan: "premium",
      primary_color: "#4ade80",
      secondary_color: "#1e1e2e",
      settings: {},
    })
    .select()
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: "Failed to create company", details: companyError },
      { status: 500 }
    );
  }

  // 2. Create jobs
  const { data: createdJobs, error: jobsError } = await supabase
    .from("jobs")
    .insert([
      {
        company_id: company.id,
        title: "Senior Full Stack Engineer",
        description:
          "We're looking for a senior full-stack engineer to build and scale our core platform. You'll work across the entire stack — from database design to frontend UI — shipping features that directly impact our customers.",
        requirements: [
          { skill: "React", level: "advanced", required: true },
          { skill: "Node.js", level: "advanced", required: true },
          { skill: "PostgreSQL", level: "intermediate", required: true },
          { skill: "TypeScript", level: "advanced", required: true },
          { skill: "System Design", level: "intermediate", required: false },
        ],
        industry: "technology",
        skill_requirements: [
          { skill: "React", category: "hard_skill", level: "advanced", required: true, weight: 3 },
          { skill: "Node.js", category: "hard_skill", level: "advanced", required: true, weight: 3 },
          { skill: "PostgreSQL", category: "hard_skill", level: "intermediate", required: true, weight: 3 },
          { skill: "TypeScript", category: "hard_skill", level: "advanced", required: true, weight: 3 },
          { skill: "System Design", category: "hard_skill", level: "intermediate", required: false, weight: 3 },
          { skill: "Problem Solving", category: "soft_skill", level: "advanced", required: true, weight: 3 },
          { skill: "Communication", category: "soft_skill", level: "intermediate", required: true, weight: 3 },
        ],
        department: "Engineering",
        location: "Remote",
        employment_type: "full_time",
        stage_config: {
          stage_1_proof_of_work: true,
          stage_2_loom: true,
          stage_3_voice: true,
        },
        voice_interview_config: {
          max_duration_minutes: 30,
          focus_areas: ["system design", "API architecture", "scalability"],
          custom_questions: [],
        },
        status: "active",
        published_at: new Date().toISOString(),
      },
      {
        company_id: company.id,
        title: "Frontend Developer",
        description:
          "Join our frontend team to build beautiful, performant user interfaces. You'll own the design system, component library, and key user-facing features using React and TypeScript.",
        requirements: [
          { skill: "React", level: "advanced", required: true },
          { skill: "TypeScript", level: "intermediate", required: true },
          { skill: "CSS/Tailwind", level: "advanced", required: true },
          { skill: "Next.js", level: "intermediate", required: false },
        ],
        industry: "technology",
        skill_requirements: [
          { skill: "React", category: "hard_skill", level: "advanced", required: true, weight: 3 },
          { skill: "TypeScript", category: "hard_skill", level: "intermediate", required: true, weight: 3 },
          { skill: "CSS/Tailwind", category: "hard_skill", level: "advanced", required: true, weight: 3 },
          { skill: "Next.js", category: "hard_skill", level: "intermediate", required: false, weight: 3 },
          { skill: "UI/UX Sensibility", category: "soft_skill", level: "advanced", required: true, weight: 3 },
          { skill: "Communication", category: "soft_skill", level: "intermediate", required: true, weight: 3 },
        ],
        department: "Engineering",
        location: "Remote",
        employment_type: "full_time",
        stage_config: {
          stage_1_proof_of_work: true,
          stage_2_loom: false,
          stage_3_voice: true,
        },
        voice_interview_config: {
          max_duration_minutes: 25,
          focus_areas: [
            "component architecture",
            "performance optimization",
            "accessibility",
          ],
          custom_questions: [],
        },
        status: "active",
        published_at: new Date().toISOString(),
      },
      {
        company_id: company.id,
        title: "Sales Development Representative",
        description:
          "We're hiring an SDR to drive outbound pipeline for our B2B SaaS product. You'll research target accounts, craft personalized outreach, run discovery calls, and qualify leads for our Account Executives. This is a high-energy role for someone who loves the hunt and wants to build a career in tech sales.",
        requirements: [
          { skill: "Outbound Prospecting", level: "intermediate", required: true },
          { skill: "CRM Management", level: "basic", required: true },
          { skill: "Cold Calling", level: "intermediate", required: true },
        ],
        industry: "sales",
        skill_requirements: [
          { skill: "Outbound Prospecting", category: "hard_skill", level: "intermediate", required: true, weight: 4 },
          { skill: "CRM Management", category: "hard_skill", level: "basic", required: true, weight: 3 },
          { skill: "Cold Calling", category: "hard_skill", level: "intermediate", required: true, weight: 4 },
          { skill: "Email Sequencing", category: "hard_skill", level: "basic", required: false, weight: 3 },
          { skill: "Objection Handling", category: "soft_skill", level: "intermediate", required: true, weight: 4 },
          { skill: "Active Listening", category: "soft_skill", level: "intermediate", required: true, weight: 3 },
          { skill: "Resilience & Grit", category: "soft_skill", level: "advanced", required: true, weight: 5 },
        ],
        department: "Sales",
        location: "Remote",
        employment_type: "full_time",
        stage_config: {
          stage_1_proof_of_work: false,
          stage_2_loom: true,
          stage_3_voice: true,
        },
        voice_interview_config: {
          max_duration_minutes: 20,
          focus_areas: ["prospecting strategy", "objection handling", "discovery questions"],
          custom_questions: [],
        },
        status: "active",
        published_at: new Date().toISOString(),
      },
    ])
    .select();

  if (jobsError || !createdJobs) {
    return NextResponse.json(
      { error: "Failed to create jobs", details: jobsError },
      { status: 500 }
    );
  }

  const [fullStackJob, frontendJob, _salesJob] = createdJobs;

  // 3. Create 8 candidates
  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .insert([
      {
        github_username: "demo-sarah-chen",
        full_name: "Sarah Chen",
        email: "sarah.chen@demo.com",
        location: "San Francisco, CA",
      },
      {
        github_username: "demo-marcus-johnson",
        full_name: "Marcus Johnson",
        email: "marcus.j@demo.com",
        location: "Austin, TX",
      },
      {
        github_username: "demo-priya-patel",
        full_name: "Priya Patel",
        email: "priya.patel@demo.com",
        location: "London, UK",
      },
      {
        github_username: "demo-alex-rivera",
        full_name: "Alex Rivera",
        email: "alex.rivera@demo.com",
        location: "New York, NY",
      },
      {
        github_username: "demo-jordan-kim",
        full_name: "Jordan Kim",
        email: "jordan.kim@demo.com",
        location: "Seattle, WA",
      },
      {
        github_username: "demo-emily-zhang",
        full_name: "Emily Zhang",
        email: "emily.zhang@demo.com",
        location: "Toronto, CA",
      },
      {
        github_username: "demo-tyler-brooks",
        full_name: "Tyler Brooks",
        email: "tyler.b@demo.com",
        location: "Denver, CO",
      },
      {
        github_username: "demo-raj-mehta",
        full_name: "Raj Mehta",
        email: "raj.mehta@demo.com",
        location: "Bangalore, IN",
      },
    ])
    .select();

  if (candidatesError || !candidates) {
    return NextResponse.json(
      { error: "Failed to create candidates", details: candidatesError },
      { status: 500 }
    );
  }

  // 4. Create candidate profiles
  const profilesInput = [
    {
      candidate_id: candidates[0].id,
      overall_score: 89,
      seniority_estimate: "staff",
      scrape_status: "complete",
      verified_skills: [
        { skill: "React", proficiency: "expert", evidence: "Built and maintained a design system used by 50+ developers", repos: ["ui-framework", "dashboard-app"] },
        { skill: "Node.js", proficiency: "expert", evidence: "Architected microservices handling 10M+ req/day", repos: ["api-gateway", "event-processor"] },
        { skill: "PostgreSQL", proficiency: "advanced", evidence: "Designed multi-tenant database schema with RLS", repos: ["platform-core"] },
        { skill: "TypeScript", proficiency: "expert", evidence: "Strict mode across all projects with custom type utilities", repos: ["ui-framework", "api-gateway", "platform-core"] },
        { skill: "System Design", proficiency: "advanced", evidence: "Event-driven architecture with CQRS pattern implementation", repos: ["event-processor", "platform-core"] },
      ],
      github_analysis: {
        languages: [
          { name: "TypeScript", percentage: 62, lines_of_code: 84000 },
          { name: "JavaScript", percentage: 18, lines_of_code: 24000 },
          { name: "Python", percentage: 12, lines_of_code: 16000 },
          { name: "Go", percentage: 8, lines_of_code: 11000 },
        ],
        frameworks: [
          { name: "React", evidence: "Core UI framework across all frontend projects", proficiency: "expert" },
          { name: "Next.js", evidence: "SSR dashboard with complex data fetching", proficiency: "advanced" },
          { name: "Express", evidence: "API gateway middleware chain", proficiency: "expert" },
        ],
        total_repos: 47,
        total_commits: 2840,
        contribution_frequency: "daily",
        top_repos: [
          { name: "ui-framework", description: "Production design system with 80+ components", stars: 234, analysis: "Excellent component API design with comprehensive Storybook docs" },
          { name: "api-gateway", description: "High-throughput API gateway with rate limiting", stars: 89, analysis: "Clean middleware pattern, sophisticated caching layer" },
          { name: "event-processor", description: "Event-driven microservice with CQRS", stars: 45, analysis: "Solid event sourcing implementation with replay capability" },
        ],
      },
      architectural_decisions: [
        { repo: "event-processor", decision: "Event sourcing with CQRS for audit trail", context: "Needed complete audit history for compliance", evidence: "EventStore class with snapshot optimization" },
        { repo: "ui-framework", decision: "Compound component pattern for complex UI", context: "Needed flexible yet type-safe component APIs", evidence: "Context-based state sharing between sub-components" },
      ],
      interview_context_summary: "Sarah Chen is a staff-level engineer with deep expertise across the full stack. Her most impressive work is a production-grade UI framework used by 50+ developers, demonstrating strong API design instincts. She architected an event-driven microservices system processing 10M+ requests daily, showing she can operate at serious scale. Her code shows consistent patterns of clean architecture, comprehensive testing, and thoughtful error handling. She would be a strong technical leader.",
      interview_suggested_questions: [
        { question: "Walk me through the architecture decisions behind your event-driven microservices system.", context: "Her event-processor repo shows CQRS patterns", category: "architectural" },
        { question: "How did you approach the API design for your UI framework to ensure developer adoption?", context: "Her ui-framework has 50+ active users internally", category: "technical" },
        { question: "What were the biggest challenges scaling to 10M+ requests per day?", context: "api-gateway shows sophisticated caching and rate limiting", category: "technical" },
      ],
      last_scraped_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[1].id,
      overall_score: 81,
      seniority_estimate: "senior",
      scrape_status: "complete",
      verified_skills: [
        { skill: "React", proficiency: "advanced", evidence: "Complex state management with custom hooks pattern", repos: ["saas-dashboard", "analytics-ui"] },
        { skill: "Go", proficiency: "advanced", evidence: "Built high-performance API server with custom middleware", repos: ["go-api-server"] },
        { skill: "PostgreSQL", proficiency: "intermediate", evidence: "Efficient query patterns and migration management", repos: ["go-api-server"] },
        { skill: "Docker", proficiency: "advanced", evidence: "Multi-stage builds with optimized production images", repos: ["go-api-server", "infra-config"] },
      ],
      github_analysis: {
        languages: [
          { name: "Go", percentage: 45, lines_of_code: 38000 },
          { name: "TypeScript", percentage: 35, lines_of_code: 29000 },
          { name: "JavaScript", percentage: 15, lines_of_code: 12000 },
          { name: "Dockerfile", percentage: 5, lines_of_code: 800 },
        ],
        frameworks: [
          { name: "React", evidence: "SaaS dashboard with complex data viz", proficiency: "advanced" },
          { name: "Gin", evidence: "Go HTTP framework for API server", proficiency: "advanced" },
        ],
        total_repos: 31,
        total_commits: 1920,
        contribution_frequency: "daily",
        top_repos: [
          { name: "go-api-server", description: "High-performance REST API in Go", stars: 156, analysis: "Clean architecture with impressive sub-10ms p99 latency" },
          { name: "saas-dashboard", description: "Full-featured SaaS analytics dashboard", stars: 67, analysis: "Sophisticated charting and real-time data updates" },
          { name: "infra-config", description: "Docker and Kubernetes configuration", stars: 23, analysis: "Production-ready container orchestration setup" },
        ],
      },
      architectural_decisions: [
        { repo: "go-api-server", decision: "Custom middleware chain over framework defaults", context: "Needed fine-grained control over request lifecycle", evidence: "Middleware interface with composable handlers" },
      ],
      interview_context_summary: "Marcus Johnson is a senior engineer with a strong backend-first approach. His Go API server demonstrates clean architecture with impressive performance optimizations. On the frontend, his SaaS dashboard shows sophisticated React patterns with custom hooks for complex state management. He shows good DevOps instincts with Docker multi-stage builds. A solid full-stack candidate with backend depth.",
      interview_suggested_questions: [
        { question: "Explain your approach to structuring the Go API server middleware chain.", context: "Custom middleware pattern in go-api-server", category: "technical" },
        { question: "How do you decide between custom hooks and external state management libraries?", context: "Heavy use of custom hooks in saas-dashboard", category: "architectural" },
        { question: "What performance optimizations did you implement in the API server?", context: "Benchmarks show sub-10ms response times", category: "technical" },
      ],
      last_scraped_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[2].id,
      overall_score: 74,
      seniority_estimate: "senior",
      scrape_status: "complete",
      verified_skills: [
        { skill: "React", proficiency: "advanced", evidence: "Component library with Storybook and comprehensive tests", repos: ["react-components", "e-commerce-app"] },
        { skill: "TypeScript", proficiency: "advanced", evidence: "Strong typing patterns with generics", repos: ["react-components", "api-client"] },
        { skill: "CSS/Tailwind", proficiency: "expert", evidence: "Custom design system with CSS custom properties", repos: ["react-components"] },
        { skill: "Next.js", proficiency: "intermediate", evidence: "SSR e-commerce app with ISR for product pages", repos: ["e-commerce-app"] },
      ],
      github_analysis: {
        languages: [
          { name: "TypeScript", percentage: 72, lines_of_code: 48000 },
          { name: "CSS", percentage: 18, lines_of_code: 12000 },
          { name: "JavaScript", percentage: 10, lines_of_code: 6500 },
        ],
        frameworks: [
          { name: "React", evidence: "Component library and e-commerce frontend", proficiency: "advanced" },
          { name: "Next.js", evidence: "ISR-based e-commerce application", proficiency: "intermediate" },
          { name: "Tailwind CSS", evidence: "Custom design tokens and utility classes", proficiency: "expert" },
        ],
        total_repos: 24,
        total_commits: 1340,
        contribution_frequency: "weekly",
        top_repos: [
          { name: "react-components", description: "Reusable component library with Storybook", stars: 112, analysis: "Well-documented with comprehensive test coverage" },
          { name: "e-commerce-app", description: "Next.js e-commerce with ISR", stars: 43, analysis: "Good use of ISR for product pages, clean data fetching" },
        ],
      },
      architectural_decisions: [
        { repo: "react-components", decision: "CSS custom properties for theming over CSS-in-JS", context: "Needed zero-runtime theming solution", evidence: "Theme provider using CSS variables" },
      ],
      interview_context_summary: "Priya Patel is a senior frontend engineer with excellent component architecture skills. Her React component library is well-documented with Storybook and has comprehensive test coverage. She demonstrates deep CSS knowledge with a custom design system. Her e-commerce app shows practical Next.js experience with ISR for performance. Strong candidate for frontend-heavy roles.",
      interview_suggested_questions: [
        { question: "How did you design the component API to balance flexibility and ease of use?", context: "react-components library with Storybook", category: "architectural" },
        { question: "Walk me through your approach to building the design system with CSS custom properties.", context: "Custom theming system in react-components", category: "technical" },
        { question: "How did you decide which pages to use ISR vs SSR for in the e-commerce app?", context: "ISR implementation in e-commerce-app", category: "technical" },
      ],
      last_scraped_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[3].id,
      overall_score: 67,
      seniority_estimate: "senior",
      scrape_status: "complete",
      verified_skills: [
        { skill: "Python", proficiency: "advanced", evidence: "Django REST API with complex permissions system", repos: ["task-manager-api", "ml-pipeline"] },
        { skill: "React", proficiency: "intermediate", evidence: "Functional components with Redux Toolkit", repos: ["task-manager-frontend"] },
        { skill: "Machine Learning", proficiency: "intermediate", evidence: "Sklearn pipeline for text classification", repos: ["ml-pipeline"] },
      ],
      github_analysis: {
        languages: [
          { name: "Python", percentage: 58, lines_of_code: 32000 },
          { name: "TypeScript", percentage: 25, lines_of_code: 14000 },
          { name: "JavaScript", percentage: 12, lines_of_code: 6500 },
          { name: "SQL", percentage: 5, lines_of_code: 2800 },
        ],
        frameworks: [
          { name: "Django", evidence: "REST API with DRF and custom permissions", proficiency: "advanced" },
          { name: "React", evidence: "Task manager frontend with Redux Toolkit", proficiency: "intermediate" },
          { name: "scikit-learn", evidence: "Text classification pipeline", proficiency: "intermediate" },
        ],
        total_repos: 19,
        total_commits: 980,
        contribution_frequency: "weekly",
        top_repos: [
          { name: "task-manager-api", description: "Django REST API with role-based permissions", stars: 34, analysis: "Well-structured permissions with custom decorators" },
          { name: "ml-pipeline", description: "Text classification with sklearn", stars: 18, analysis: "Clean pipeline design with proper train/test splitting" },
        ],
      },
      architectural_decisions: [
        { repo: "task-manager-api", decision: "Custom permission decorators over DRF defaults", context: "Needed hierarchical role-based access control", evidence: "Permission mixins with role inheritance" },
      ],
      interview_context_summary: "Alex Rivera is a senior engineer with a Python-heavy background transitioning to full-stack work. Strong Django API design with a well-structured permissions system. Shows emerging interest in ML with a practical text classification pipeline. Frontend skills are growing but not yet at the same depth as backend. Good candidate for backend-heavy roles with some frontend responsibility.",
      interview_suggested_questions: [
        { question: "How did you design the permissions system in your Django REST API?", context: "Complex role-based permissions in task-manager-api", category: "architectural" },
        { question: "What challenges did you face building the ML pipeline and how would you improve it?", context: "Text classification pipeline using sklearn", category: "technical" },
        { question: "How are you growing your frontend skills alongside your backend expertise?", context: "Newer React work in task-manager-frontend", category: "growth" },
      ],
      last_scraped_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[4].id,
      overall_score: 61,
      seniority_estimate: "mid",
      scrape_status: "complete",
      verified_skills: [
        { skill: "React", proficiency: "intermediate", evidence: "Multiple SPAs with React Router and context", repos: ["project-tracker", "recipe-app"] },
        { skill: "Node.js", proficiency: "intermediate", evidence: "Express APIs with JWT auth", repos: ["project-tracker-api"] },
        { skill: "MongoDB", proficiency: "intermediate", evidence: "Schema design with Mongoose", repos: ["project-tracker-api", "recipe-app"] },
      ],
      github_analysis: {
        languages: [
          { name: "JavaScript", percentage: 65, lines_of_code: 22000 },
          { name: "TypeScript", percentage: 20, lines_of_code: 7000 },
          { name: "CSS", percentage: 15, lines_of_code: 5000 },
        ],
        frameworks: [
          { name: "React", evidence: "Multiple SPAs with React Router", proficiency: "intermediate" },
          { name: "Express", evidence: "REST APIs with JWT authentication", proficiency: "intermediate" },
          { name: "MongoDB", evidence: "Mongoose schemas with validation", proficiency: "intermediate" },
        ],
        total_repos: 15,
        total_commits: 720,
        contribution_frequency: "weekly",
        top_repos: [
          { name: "project-tracker", description: "Full-stack project management tool", stars: 12, analysis: "Complete CRUD app with auth and real-time updates" },
          { name: "recipe-app", description: "Recipe sharing platform", stars: 8, analysis: "Clean UI with search and filtering" },
        ],
      },
      architectural_decisions: [],
      interview_context_summary: "Jordan Kim is a solid mid-level full-stack developer working primarily with the MERN stack. Projects show good fundamentals — proper auth patterns, clean component structure, and consistent coding style. The project tracker shows a complete full-stack application with real-world complexity. Ready to take on more architectural responsibility with mentorship.",
      interview_suggested_questions: [
        { question: "Walk me through your JWT authentication implementation and how you handle token refresh.", context: "JWT auth in project-tracker-api", category: "technical" },
        { question: "How would you redesign your project tracker if you had to scale it to 10x users?", context: "Current architecture is straightforward Express + MongoDB", category: "architectural" },
        { question: "What's the most complex feature you've built end-to-end and what did you learn?", context: "Multiple complete applications", category: "product" },
      ],
      last_scraped_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[5].id,
      overall_score: 52,
      seniority_estimate: "mid",
      scrape_status: "complete",
      verified_skills: [
        { skill: "JavaScript", proficiency: "intermediate", evidence: "Clean ES6+ patterns across projects", repos: ["weather-app", "chat-app", "portfolio"] },
        { skill: "React", proficiency: "basic", evidence: "Basic component patterns with useState/useEffect", repos: ["weather-app", "portfolio"] },
        { skill: "Firebase", proficiency: "intermediate", evidence: "Real-time database with auth integration", repos: ["chat-app"] },
      ],
      github_analysis: {
        languages: [
          { name: "JavaScript", percentage: 75, lines_of_code: 14000 },
          { name: "HTML", percentage: 15, lines_of_code: 2800 },
          { name: "CSS", percentage: 10, lines_of_code: 1900 },
        ],
        frameworks: [
          { name: "React", evidence: "Basic SPAs with hooks", proficiency: "basic" },
          { name: "Firebase", evidence: "Realtime database and auth", proficiency: "intermediate" },
        ],
        total_repos: 11,
        total_commits: 420,
        contribution_frequency: "weekly",
        top_repos: [
          { name: "chat-app", description: "Real-time chat with Firebase", stars: 6, analysis: "Good use of Firebase realtime features" },
          { name: "weather-app", description: "Weather dashboard with API integration", stars: 3, analysis: "Clean API integration with loading states" },
        ],
      },
      architectural_decisions: [],
      interview_context_summary: "Emily Zhang is an emerging mid-level developer with a portfolio showing consistent improvement. Her chat application demonstrates real-time programming concepts with Firebase. React skills are developing — current projects use basic patterns but show clean code organization. She would benefit from a structured environment where she can grow her architectural thinking.",
      interview_suggested_questions: [
        { question: "How did you handle real-time data synchronization in your chat app?", context: "Firebase realtime database implementation", category: "technical" },
        { question: "What would you change about your weather app if you were to rebuild it today?", context: "Earlier project showing growth trajectory", category: "growth" },
        { question: "Describe a bug that was particularly difficult to debug and how you solved it.", context: "Multiple projects with varying complexity", category: "technical" },
      ],
      last_scraped_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[6].id,
      overall_score: 38,
      seniority_estimate: "junior",
      scrape_status: "complete",
      verified_skills: [
        { skill: "HTML/CSS", proficiency: "intermediate", evidence: "Responsive layouts with media queries", repos: ["personal-site", "todo-app"] },
        { skill: "JavaScript", proficiency: "basic", evidence: "DOM manipulation and basic async patterns", repos: ["todo-app", "quiz-game"] },
        { skill: "React", proficiency: "basic", evidence: "Tutorial-level component structure", repos: ["todo-app"] },
      ],
      github_analysis: {
        languages: [
          { name: "JavaScript", percentage: 50, lines_of_code: 5000 },
          { name: "HTML", percentage: 30, lines_of_code: 3000 },
          { name: "CSS", percentage: 20, lines_of_code: 2000 },
        ],
        frameworks: [
          { name: "React", evidence: "Todo app with basic state management", proficiency: "basic" },
        ],
        total_repos: 7,
        total_commits: 180,
        contribution_frequency: "monthly",
        top_repos: [
          { name: "todo-app", description: "React todo list application", stars: 2, analysis: "Tutorial-level but clean code organization" },
          { name: "personal-site", description: "Portfolio website", stars: 1, analysis: "Responsive design with media queries" },
        ],
      },
      architectural_decisions: [],
      interview_context_summary: "Tyler Brooks is a junior developer early in their career. Projects are primarily tutorial-based but show good fundamentals — clean HTML/CSS, basic JavaScript patterns. The todo app demonstrates understanding of React basics. Needs mentorship and structured learning but shows potential with consistent commit history.",
      interview_suggested_questions: [
        { question: "What motivated you to start learning web development?", context: "Early-career developer with consistent commits", category: "growth" },
        { question: "Walk me through how your todo app manages state and what you'd improve.", context: "Basic React state management", category: "technical" },
        { question: "What's the hardest concept you've learned so far and how did you overcome it?", context: "Learning trajectory visible in commit history", category: "growth" },
      ],
      last_scraped_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      candidate_id: candidates[7].id,
      overall_score: 25,
      seniority_estimate: "junior",
      scrape_status: "complete",
      verified_skills: [
        { skill: "Python", proficiency: "basic", evidence: "Basic scripts and Jupyter notebooks", repos: ["python-exercises", "data-analysis"] },
        { skill: "HTML/CSS", proficiency: "basic", evidence: "Simple static pages", repos: ["first-website"] },
      ],
      github_analysis: {
        languages: [
          { name: "Python", percentage: 60, lines_of_code: 2400 },
          { name: "HTML", percentage: 25, lines_of_code: 1000 },
          { name: "CSS", percentage: 15, lines_of_code: 600 },
        ],
        frameworks: [],
        total_repos: 4,
        total_commits: 65,
        contribution_frequency: "monthly",
        top_repos: [
          { name: "python-exercises", description: "Python learning exercises", stars: 0, analysis: "Basic scripting and data structures practice" },
          { name: "first-website", description: "Simple static HTML page", stars: 0, analysis: "Minimal but functional static site" },
        ],
      },
      architectural_decisions: [],
      interview_context_summary: "Raj Mehta is a very early-stage developer, likely a student or career changer. Repos contain Python exercises and basic data analysis notebooks. Web development experience is minimal — a single static HTML page. Not yet ready for a professional engineering role but shows curiosity and willingness to learn.",
      interview_suggested_questions: [
        { question: "Tell me about your journey into programming — what got you started?", context: "Very early-stage developer", category: "growth" },
        { question: "What kind of projects are you most excited to build?", context: "Exploring multiple areas", category: "product" },
        { question: "How do you approach learning a new technology or concept?", context: "Early learning phase", category: "growth" },
      ],
      last_scraped_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ];

  const { data: profiles, error: profilesError } = await supabase
    .from("candidate_profiles")
    .insert(profilesInput)
    .select();

  if (profilesError || !profiles) {
    return NextResponse.json(
      { error: "Failed to create profiles", details: profilesError },
      { status: 500 }
    );
  }

  // 5. Create applications
  // Distribution: 2 stage_1, 2 stage_2, 2 stage_3, 1 completed, 1 rejected
  const applicationsInput = [
    {
      // Sarah Chen → completed, shortlisted (Full Stack)
      candidate_id: candidates[0].id,
      job_id: fullStackJob.id,
      company_id: company.id,
      current_stage: "completed",
      profile_id: profiles[0].id,
      stage_1_score: 89,
      stage_2_score: 82,
      stage_3_score: 91,
      overall_score: 88,
      stage_1_passed: true,
      stage_2_passed: true,
      stage_3_passed: true,
      status: "shortlisted",
      shortlisted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      // Marcus Johnson → stage_3 (Full Stack)
      candidate_id: candidates[1].id,
      job_id: fullStackJob.id,
      company_id: company.id,
      current_stage: "stage_3",
      profile_id: profiles[1].id,
      stage_1_score: 81,
      stage_2_score: 75,
      stage_1_passed: true,
      stage_2_passed: true,
      status: "active",
    },
    {
      // Priya Patel → stage_3 (Frontend)
      candidate_id: candidates[2].id,
      job_id: frontendJob.id,
      company_id: company.id,
      current_stage: "stage_3",
      profile_id: profiles[2].id,
      stage_1_score: 74,
      stage_1_passed: true,
      status: "active",
    },
    {
      // Alex Rivera → stage_2 (Full Stack)
      candidate_id: candidates[3].id,
      job_id: fullStackJob.id,
      company_id: company.id,
      current_stage: "stage_2",
      profile_id: profiles[3].id,
      stage_1_score: 67,
      stage_1_passed: true,
      status: "active",
    },
    {
      // Jordan Kim → stage_2 (Full Stack)
      candidate_id: candidates[4].id,
      job_id: fullStackJob.id,
      company_id: company.id,
      current_stage: "stage_2",
      profile_id: profiles[4].id,
      stage_1_score: 61,
      stage_1_passed: true,
      status: "active",
    },
    {
      // Emily Zhang → stage_1 (Full Stack)
      candidate_id: candidates[5].id,
      job_id: fullStackJob.id,
      company_id: company.id,
      current_stage: "stage_1",
      profile_id: profiles[5].id,
      stage_1_score: 52,
      status: "active",
    },
    {
      // Tyler Brooks → stage_1 (Frontend)
      candidate_id: candidates[6].id,
      job_id: frontendJob.id,
      company_id: company.id,
      current_stage: "stage_1",
      profile_id: profiles[6].id,
      stage_1_score: 38,
      status: "active",
    },
    {
      // Raj Mehta → rejected (Frontend)
      candidate_id: candidates[7].id,
      job_id: frontendJob.id,
      company_id: company.id,
      current_stage: "rejected",
      profile_id: profiles[7].id,
      stage_1_score: 25,
      stage_1_passed: false,
      status: "rejected",
      rejected_reason: "Score below minimum threshold for the role",
    },
  ];

  const { error: appsError } = await supabase
    .from("applications")
    .insert(applicationsInput);

  if (appsError) {
    return NextResponse.json(
      { error: "Failed to create applications", details: appsError },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Demo data seeded successfully",
    company_id: company.id,
    created: {
      company: 1,
      jobs: 3,
      candidates: 8,
      profiles: 8,
      applications: 8,
    },
  });
}
