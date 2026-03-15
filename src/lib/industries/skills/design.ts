import type { IndustryDefinition } from "@/lib/industry-skills";

export const designIndustry: IndustryDefinition = {
    id: "design",
    label: "Design & Creative",
    icon: "🎨",
    description: "UX/UI design, graphic design, product design, and creative direction roles",
    interview_context: {
      persona:
        "You are a Head of Design evaluating creative talent. You care about process, user empathy, and craft. Probe for their design thinking approach, not just visual skills.",
      tone: "Curious and exploratory — great designers love talking about their process.",
      domain_terminology: [
        "user research", "wireframe", "prototype", "design system",
        "usability testing", "information architecture", "accessibility",
        "visual hierarchy", "interaction design", "design critique",
      ],
      red_flags_to_probe: [
        "Designs without user research or validation",
        "Cannot articulate design rationale beyond aesthetics",
        "No mention of collaboration with engineering/product",
        "Portfolio without process documentation",
      ],
      what_great_looks_like:
        "Strong candidates walk through their design process clearly, demonstrate user empathy backed by research, show they iterate based on feedback, and collaborate well with engineering and product.",
    },
    hard_skills: [
      {
        name: "User Research",
        category: "hard_skill",
        description: "Conducting and synthesizing user research to inform design decisions",
        sample_questions: [
          "How do you decide what research methods to use for a project?",
          "Describe a time when research completely changed your design direction.",
        ],
        level_descriptors: {
          basic: "Conducts basic interviews and surveys",
          intermediate: "Plans and executes research independently, synthesizes findings",
          advanced: "Designs research programs, uses mixed methods",
          expert: "Builds research practices for organizations, innovates on methods",
        },
      },
      {
        name: "Prototyping & Interaction Design",
        category: "hard_skill",
        description: "Creating interactive prototypes to test and communicate design ideas",
        sample_questions: [
          "What's your prototyping process? When do you go low-fi vs high-fi?",
          "How do you balance prototyping speed with fidelity?",
        ],
        level_descriptors: {
          basic: "Creates basic wireframes and mockups",
          intermediate: "Builds interactive prototypes, uses design tools proficiently",
          advanced: "Creates complex prototypes with micro-interactions and animations",
          expert: "Pushes the boundaries of prototyping tools, develops interaction patterns",
        },
      },
      {
        name: "Design Systems",
        category: "hard_skill",
        description: "Building and maintaining consistent, scalable design systems",
        sample_questions: [
          "How do you approach building a design system from scratch?",
          "How do you balance consistency with flexibility in a design system?",
        ],
        level_descriptors: {
          basic: "Uses existing design systems and component libraries",
          intermediate: "Contributes components, maintains documentation",
          advanced: "Builds design systems, defines standards and governance",
          expert: "Leads design system strategy, drives adoption across organizations",
        },
      },
      {
        name: "Visual Design & Typography",
        category: "hard_skill",
        description: "Creating aesthetically excellent designs with strong visual hierarchy",
        sample_questions: [
          "How do you make typography decisions for a project?",
          "Describe your approach to creating visual hierarchy in a complex interface.",
        ],
        level_descriptors: {
          basic: "Applies basic design principles consistently",
          intermediate: "Creates polished designs with clear hierarchy",
          advanced: "Develops sophisticated visual languages and brand aesthetics",
          expert: "Sets creative direction, innovates on visual design",
        },
      },
      {
        name: "Accessibility & Inclusive Design",
        category: "hard_skill",
        description: "Designing products that are usable by people with diverse abilities, meeting WCAG standards and going beyond compliance to genuinely inclusive experiences",
        sample_questions: [
          "How do you ensure your designs meet WCAG AA compliance? Give me an example where accessibility changed your design direction.",
          "You inherit a product with significant accessibility gaps but the team says fixing them isn't a priority. How do you make the case and where do you start?",
        ],
        level_descriptors: {
          basic: "Understands basic accessibility principles (color contrast, alt text, focus states), uses accessibility checkers",
          intermediate: "Designs with accessibility as a core requirement, implements WCAG AA standards, conducts basic screen reader testing, creates accessible component specifications",
          advanced: "Leads accessibility audits, designs for edge cases (cognitive disabilities, motor impairments, low vision), integrates accessibility into design systems and component libraries, partners with engineering on ARIA implementation",
          expert: "Defines organizational accessibility strategy and standards, drives WCAG AAA adoption where appropriate, conducts usability testing with disabled users, mentors teams on inclusive design thinking beyond checkbox compliance",
        },
      },
      {
        name: "Motion Design & Animation",
        category: "hard_skill",
        description: "Designing micro-interactions, transitions, loading states, and UI animations using tools like After Effects and Lottie to enhance user experience and communicate state changes",
        sample_questions: [
          "Walk me through how you decide where motion adds value versus where it's just decoration. Give me an example of a micro-interaction you designed that solved a real UX problem.",
          "You need to hand off a complex animation to engineering. How do you ensure what gets built matches your intent, and what trade-offs do you consider for performance?",
        ],
        level_descriptors: {
          basic: "Creates basic transitions and hover states, understands easing curves and timing principles, uses Figma's built-in animation features",
          intermediate: "Designs purposeful micro-interactions and loading states, creates Lottie animations, builds motion specs with timing and easing documentation for engineering handoff",
          advanced: "Develops motion design systems with reusable patterns, creates complex After Effects animations, defines motion principles that align with brand personality, optimises animations for performance across devices",
          expert: "Sets motion design strategy for the product, pioneers innovative interaction patterns, builds motion design standards that scale across platforms (web, iOS, Android), mentors designers on motion craft",
        },
      },
      {
        name: "Design Ops",
        category: "hard_skill",
        description: "Optimising design team workflows, tooling, handoff processes, and measurement to increase design quality and velocity",
        sample_questions: [
          "Your design team has doubled in size and the old processes are breaking down — files are disorganised, handoffs are inconsistent, and nobody knows which version is final. How do you fix this?",
          "How do you measure the effectiveness of a design team? What metrics would you introduce and how would you avoid gaming?",
        ],
        level_descriptors: {
          basic: "Follows established design team processes, maintains organised files and naming conventions, uses team tools correctly",
          intermediate: "Identifies workflow bottlenecks, sets up design tool configurations and templates, documents handoff processes, manages design tool licences and plugins",
          advanced: "Builds design ops programs including tooling strategy, workflow automation, design-to-engineering handoff systems, and team health metrics, manages design budgets",
          expert: "Develops enterprise design ops strategy across multiple teams and products, builds custom tooling and integrations, defines industry-leading design team metrics, shapes how design scales organisationally",
        },
      },
      {
        name: "Brand Identity Design",
        category: "hard_skill",
        description: "Creating comprehensive brand identity systems including logo design, visual identity guidelines, typography systems, and brand architecture",
        sample_questions: [
          "Walk me through a rebrand you led from strategy through to asset delivery. How did you ensure consistency across touchpoints once the new identity was live?",
          "A company has three sub-brands that have evolved independently and now look like completely different companies. How do you approach building a cohesive brand architecture?",
        ],
        level_descriptors: {
          basic: "Applies existing brand guidelines consistently, creates on-brand assets following identity documentation",
          intermediate: "Designs logo variations and brand collateral, builds brand guideline documents, selects and pairs typefaces, creates colour systems with accessibility in mind",
          advanced: "Leads brand identity projects from strategy through execution, develops comprehensive visual identity systems, creates brand architecture for multi-product companies, ensures brand consistency across digital and physical touchpoints",
          expert: "Shapes brand strategy at the executive level, builds brand systems that scale globally across cultures and markets, mentors teams on brand thinking, develops brand governance frameworks for large organisations",
        },
      },
      {
        name: "Information Architecture",
        category: "hard_skill",
        description: "Structuring and organising content through sitemaps, navigation patterns, card sorting, and content hierarchy to make complex information findable and understandable",
        sample_questions: [
          "You're redesigning a SaaS product with 200+ pages of documentation and users say they can never find anything. Walk me through your approach to restructuring the information architecture.",
          "How do you validate that your information architecture actually works for users? Describe a time card sorting or tree testing changed your approach.",
        ],
        level_descriptors: {
          basic: "Creates basic sitemaps, understands navigation patterns (breadcrumbs, tabs, menus), organises content logically",
          intermediate: "Conducts card sorting and tree testing, designs navigation systems for multi-level content, creates taxonomy and labelling systems, documents IA decisions",
          advanced: "Architects information structures for complex products with multiple user types, leads cross-functional IA overhauls, integrates search strategy with navigation design, validates IA through quantitative and qualitative methods",
          expert: "Defines IA strategy for large-scale platforms and ecosystems, develops IA governance frameworks, pioneers new approaches to content organisation, mentors teams on structural thinking",
        },
      },
      {
        name: "Service Design",
        category: "hard_skill",
        description: "Designing end-to-end service experiences through journey mapping, service blueprinting, touchpoint analysis, and front-stage/back-stage coordination",
        sample_questions: [
          "Walk me through a service blueprint you created. How did mapping the back-stage processes reveal problems that weren't visible from the customer's perspective?",
          "You're tasked with improving the end-to-end onboarding experience for a product that involves sales, support, and product teams. How do you approach mapping and redesigning the service?",
        ],
        level_descriptors: {
          basic: "Creates basic customer journey maps, identifies key touchpoints and pain points, understands the difference between front-stage and back-stage processes",
          intermediate: "Builds service blueprints that connect customer actions to internal processes, facilitates journey mapping workshops, identifies moments of truth and failure points across channels",
          advanced: "Leads end-to-end service design projects spanning multiple departments, designs back-stage process changes to improve front-stage experience, measures service performance across touchpoints, drives organisational change through service insights",
          expert: "Builds service design capability across the organisation, develops service design methodologies for complex multi-channel ecosystems, influences business model design through service thinking, pioneers new approaches to service measurement",
        },
      },
      {
        name: "3D & Spatial Design",
        category: "hard_skill",
        description: "Designing AR/VR interfaces, 3D models, and spatial UI patterns for immersive and mixed-reality experiences",
        sample_questions: [
          "How do you approach designing a UI that exists in 3D space versus a flat screen? What changes about your process and what principles from 2D design still apply?",
          "You're designing an AR onboarding experience for a product used in a warehouse. Users are wearing headsets and their hands are occupied. Walk me through your design approach.",
        ],
        level_descriptors: {
          basic: "Understands 3D design fundamentals, creates basic 3D models, applies spatial UI principles from platform guidelines (Apple Vision Pro, Meta Quest)",
          intermediate: "Designs AR/VR interfaces with spatial interaction patterns, creates 3D prototypes, considers ergonomics and spatial audio, builds for different input methods (gaze, hand tracking, controllers)",
          advanced: "Leads spatial design for complex products, develops 3D design systems and patterns, optimises for comfort and accessibility in immersive environments, integrates 3D and 2D interfaces seamlessly",
          expert: "Pioneers spatial design patterns and interaction models, defines design strategy for emerging spatial platforms, contributes to platform design guidelines, builds spatial design practices for organisations",
        },
      },
    ],
    soft_skills: [
      {
        name: "Design Thinking",
        category: "soft_skill",
        description: "Applying human-centered design process to solve problems",
        sample_questions: [
          "Walk me through how you approach a new design challenge from scratch.",
          "How do you balance user needs with business goals and technical constraints?",
        ],
        level_descriptors: {
          basic: "Follows design thinking frameworks with guidance",
          intermediate: "Applies design thinking independently to projects",
          advanced: "Leads design thinking for complex, ambiguous problems",
          expert: "Evangelizes and teaches design thinking across the organization",
        },
      },
      {
        name: "Giving & Receiving Critique",
        category: "soft_skill",
        description: "Participating constructively in design reviews and feedback",
        sample_questions: [
          "How do you handle feedback you disagree with?",
          "Describe your approach to leading a design critique.",
        ],
        level_descriptors: {
          basic: "Accepts feedback gracefully, gives basic input",
          intermediate: "Gives constructive feedback, incorporates critique well",
          advanced: "Leads productive critiques, balances perspectives",
          expert: "Builds feedback culture, mentors on giving critique",
        },
      },
      {
        name: "Stakeholder Management",
        category: "soft_skill",
        description: "Communicating design decisions and managing expectations",
        sample_questions: [
          "How do you present design work to non-design stakeholders?",
          "Describe a time you had to push back on a stakeholder's design request.",
        ],
        level_descriptors: {
          basic: "Presents work clearly to immediate team",
          intermediate: "Manages stakeholder expectations, justifies decisions",
          advanced: "Influences at leadership level, drives design decisions",
          expert: "Shapes organizational design culture and strategy",
        },
      },
      {
        name: "Cross-functional Influence",
        category: "soft_skill",
        description: "Driving design quality and user-centered thinking across engineering, product, and business teams without direct authority",
        sample_questions: [
          "Engineering says your design is too complex to build in the timeline. Product wants to ship anyway. How do you navigate this?",
          "How do you get a product team that historically treats design as 'making things pretty' to involve you earlier in the process?",
        ],
        level_descriptors: {
          basic: "Collaborates with engineering and product when asked, participates in cross-functional meetings",
          intermediate: "Proactively engages engineering and PM early in the design process, communicates design rationale in terms other disciplines understand, negotiates scope trade-offs",
          advanced: "Drives design-led initiatives across teams, establishes processes for cross-functional collaboration (design sprints, co-creation workshops), influences product roadmap through design insights",
          expert: "Shapes how the organization values and integrates design, builds partnerships across executive leadership, establishes design as a strategic function rather than a service team",
        },
      },
    ],
    sub_niches: [
      {
        id: "ux_design",
        label: "UX Design",
        additional_skills: ["Usability Testing", "Information Architecture", "Journey Mapping", "Accessibility (WCAG)"],
        interview_hints: "Focus on research-driven decisions, usability testing results, and iteration process.",
      },
      {
        id: "product_design",
        label: "Product Design",
        additional_skills: ["Product Strategy", "Metrics-Informed Design", "Cross-functional Collaboration", "Prioritization"],
        interview_hints: "Probe for product thinking, metrics awareness, and end-to-end ownership.",
      },
      {
        id: "brand_design",
        label: "Brand & Graphic Design",
        additional_skills: ["Brand Identity Systems", "Print Production", "Motion Graphics", "Art Direction"],
        interview_hints: "Focus on creative vision, brand consistency, and execution craft.",
      },
    ],
  };
