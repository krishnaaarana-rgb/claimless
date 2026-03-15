import type { IndustryDefinition } from "@/lib/industry-skills";

export const educationIndustry: IndustryDefinition = {
    id: "education",
    label: "Education",
    icon: "🎓",
    description: "Teaching, academic administration, EdTech, and training roles",
    interview_context: {
      persona:
        "You are an experienced academic administrator or school leader. You care about pedagogical skill, student outcomes, and the ability to engage diverse learners.",
      tone: "Warm and supportive, but probing for real classroom/program impact.",
      domain_terminology: [
        "curriculum", "pedagogy", "differentiated instruction", "assessment",
        "IEP", "scaffolding", "formative assessment", "student outcomes",
        "classroom management", "learning objectives", "accreditation",
      ],
      red_flags_to_probe: [
        "No evidence of student outcome measurement",
        "One-size-fits-all teaching approach",
        "Inability to describe handling struggling students",
        "No mention of professional development or growth",
      ],
      what_great_looks_like:
        "Strong candidates describe specific student impact, demonstrate adaptability in teaching methods, show passion for learning, and can articulate how they measure and improve outcomes.",
    },
    hard_skills: [
      {
        name: "Curriculum Design",
        category: "hard_skill",
        description: "Developing learning objectives, lesson plans, and educational content",
        sample_questions: [
          "Walk me through your process for designing a new unit of study.",
          "How do you align curriculum with standards while keeping it engaging?",
        ],
        level_descriptors: {
          basic: "Follows existing curriculum with minor adaptations",
          intermediate: "Designs units and lessons aligned to standards",
          advanced: "Creates comprehensive curricula with differentiation",
          expert: "Develops curriculum frameworks, leads curriculum adoption",
        },
      },
      {
        name: "Assessment Design",
        category: "hard_skill",
        description: "Creating and using assessments to measure and improve learning",
        sample_questions: [
          "How do you use formative assessments to guide instruction?",
          "Describe your approach to creating fair, meaningful assessments.",
        ],
        level_descriptors: {
          basic: "Uses provided assessments, grades accurately",
          intermediate: "Creates aligned assessments, analyzes results",
          advanced: "Designs comprehensive assessment systems, uses data to inform instruction",
          expert: "Leads assessment strategy, develops rubrics and evaluation frameworks",
        },
      },
      {
        name: "Educational Technology",
        category: "hard_skill",
        description: "Leveraging technology to enhance learning outcomes",
        sample_questions: [
          "How do you decide which technology tools to use in your teaching?",
          "Describe a time technology significantly improved student engagement or outcomes.",
        ],
        level_descriptors: {
          basic: "Uses basic edtech tools (LMS, presentation software)",
          intermediate: "Integrates multiple tools effectively, troubleshoots",
          advanced: "Leads edtech adoption, evaluates new tools",
          expert: "Shapes institutional technology strategy for learning",
        },
      },
      {
        name: "Classroom Management",
        category: "hard_skill",
        description: "Creating and maintaining productive learning environments",
        sample_questions: [
          "Describe your classroom management philosophy and how it plays out in practice.",
          "How do you handle a consistently disruptive student?",
        ],
        level_descriptors: {
          basic: "Maintains order with established systems",
          intermediate: "Develops effective management strategies independently",
          advanced: "Creates positive learning environments, handles complex behaviors",
          expert: "Mentors others on management, develops school-wide behavior systems",
        },
      },
    ],
    soft_skills: [
      {
        name: "Student Engagement",
        category: "soft_skill",
        description: "Motivating and engaging diverse learners",
        sample_questions: [
          "How do you reach a student who's disengaged or struggling?",
          "Describe your most effective strategy for making content accessible to all learners.",
        ],
        level_descriptors: {
          basic: "Uses standard engagement techniques",
          intermediate: "Adapts approach for different learner needs",
          advanced: "Creates innovative, highly engaging learning experiences",
          expert: "Inspires a culture of engagement across the institution",
        },
      },
      {
        name: "Parent & Family Communication",
        category: "soft_skill",
        description: "Building productive relationships with families and guardians",
        sample_questions: [
          "How do you handle a difficult conversation with a parent about their child's performance?",
          "Describe your approach to keeping families informed and involved.",
        ],
        level_descriptors: {
          basic: "Communicates through standard channels",
          intermediate: "Proactively engages families, handles concerns diplomatically",
          advanced: "Builds strong family partnerships, navigates conflict",
          expert: "Develops family engagement programs and strategies",
        },
      },
      {
        name: "Adaptability",
        category: "soft_skill",
        description: "Adjusting teaching approach based on student needs, feedback, and context",
        sample_questions: [
          "Describe a time you had to completely change your plan mid-lesson or mid-unit.",
          "How do you differentiate instruction for a wide range of ability levels?",
        ],
        level_descriptors: {
          basic: "Adjusts when prompted",
          intermediate: "Reads the room and adapts in real-time",
          advanced: "Systematically differentiates for diverse needs",
          expert: "Develops adaptive teaching frameworks for others",
        },
      },
    ],
    sub_niches: [
      {
        id: "k12",
        label: "K-12 Education",
        additional_skills: ["IEP Implementation", "State Standards Alignment", "Student Behavior Plans", "Standardized Test Prep"],
        interview_hints: "Focus on differentiation, student growth measurement, and collaboration with specialists.",
      },
      {
        id: "higher_ed",
        label: "Higher Education",
        additional_skills: ["Research Methodology", "Grant Writing", "Academic Advising", "Accreditation"],
        interview_hints: "Probe for teaching philosophy, research integration, and student mentorship.",
      },
      {
        id: "edtech",
        label: "EdTech",
        additional_skills: ["Learning Design", "User Research with Educators", "Gamification", "Analytics for Learning"],
        interview_hints: "Balance educational expertise with product/technical thinking.",
      },
    ],
  };
