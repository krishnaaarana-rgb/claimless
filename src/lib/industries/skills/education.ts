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
      {
        name: "Special Education & Inclusion",
        category: "hard_skill",
        description: "Developing and implementing Individual Education Plans (IEPs), differentiated learning strategies, assistive technology, and supporting students with disabilities including NDIS-funded participants",
        sample_questions: [
          "A student with autism spectrum disorder is transitioning into your mainstream classroom with NDIS-funded support. The parents want full inclusion but the learning support assistant has limited experience. How do you set this up for success?",
          "You inherit a class where IEPs exist on paper but haven't been meaningfully implemented. How do you audit what's happening and get the program back on track without alienating colleagues?",
        ],
        level_descriptors: {
          basic: "Follows existing IEPs as directed, uses basic accommodations (extra time, modified seating), and communicates with learning support staff",
          intermediate: "Writes and reviews IEPs collaboratively, selects appropriate assistive technology, differentiates lessons for students with diverse needs, and liaises with NDIS providers and allied health professionals",
          advanced: "Leads the school's inclusive education practices, coaches teachers on differentiation and Universal Design for Learning (UDL), manages complex multi-agency support plans, and evaluates program effectiveness with data",
          expert: "Shapes inclusive education policy at the school or system level, designs professional learning programs on inclusion, leads NCCD (Nationally Consistent Collection of Data) processes, and advises on systemic accessibility improvements",
        },
      },
      {
        name: "Student Wellbeing",
        category: "hard_skill",
        description: "Implementing pastoral care frameworks, mental health first aid, anti-bullying programs, and safeguarding protocols to support whole-student development",
        sample_questions: [
          "A Year 9 student's behaviour has changed dramatically over three weeks — withdrawal, dropping grades, conflict with peers. Walk me through your response from first concern to resolution.",
          "You discover that cyberbullying is happening among students in your year level via a platform the school doesn't monitor. How do you address it while respecting privacy and maintaining trust?",
        ],
        level_descriptors: {
          basic: "Recognises signs of student distress, follows mandatory reporting protocols, and refers students to wellbeing staff or school counsellors",
          intermediate: "Implements pastoral care programs within their cohort, delivers anti-bullying and resilience sessions, holds Mental Health First Aid certification, and manages wellbeing referrals with appropriate documentation",
          advanced: "Designs and leads school-wide wellbeing frameworks (e.g., Berry Street Education Model, Positive Behaviour for Learning), coordinates multi-agency support for at-risk students, trains staff on trauma-informed practice, and manages critical incident responses",
          expert: "Shapes wellbeing strategy at the system or network level, develops safeguarding policies aligned with state Child Safe Standards, leads cultural change toward proactive wellbeing, and evaluates program impact using wellbeing data and student voice",
        },
      },
      {
        name: "STEM Education",
        category: "hard_skill",
        description: "Designing and delivering inquiry-based STEM learning including robotics and coding programs, cross-curricular integration, and fostering computational thinking",
        sample_questions: [
          "You've been asked to introduce a coding program for Years 3–6 but most classroom teachers have no coding experience. How do you design and roll out the program?",
          "A parent questions why students are building robots instead of learning 'real maths.' How do you articulate the pedagogical value of integrated STEM to both parents and sceptical colleagues?",
        ],
        level_descriptors: {
          basic: "Delivers structured STEM lessons using provided resources, facilitates basic coding activities (Scratch, Bee-Bots), and supports students through guided inquiry tasks",
          intermediate: "Designs inquiry-based STEM units aligned to the Australian Curriculum (Design and Technologies, Digital Technologies), integrates STEM across subject areas, and runs robotics or coding clubs",
          advanced: "Leads the school's STEM strategy, mentors teachers in STEM pedagogy, establishes industry partnerships and STEM competitions, designs cross-curricular projects that embed computational thinking and engineering design processes",
          expert: "Shapes STEM education policy at the system or sector level, publishes or presents on STEM pedagogy, designs innovative programs that connect STEM learning to real-world problems and career pathways, and evaluates STEM program impact on student outcomes",
        },
      },
      {
        name: "Literacy & Numeracy Intervention",
        category: "hard_skill",
        description: "Delivering evidence-based reading and numeracy programs including Science of Reading approaches, diagnostic assessment, and targeted intervention strategies",
        sample_questions: [
          "NAPLAN data shows that 30% of your Year 3 cohort is below benchmark in reading. Walk me through how you'd diagnose the specific gaps and design an intervention program.",
          "A colleague argues that whole-language immersion is sufficient for struggling readers and resists explicit phonics instruction. How do you navigate this conversation using evidence?",
        ],
        level_descriptors: {
          basic: "Delivers prescribed intervention programs (e.g., MiniLit, MacqLit, QuickSmart), administers diagnostic assessments, and tracks student progress against benchmarks",
          intermediate: "Selects appropriate intervention programs based on diagnostic data, differentiates literacy and numeracy instruction within the classroom, analyses NAPLAN and PAT data to identify patterns, and adjusts instruction based on progress monitoring",
          advanced: "Leads the school's literacy or numeracy improvement strategy, coaches teachers on evidence-based practices (structured literacy, Science of Reading), designs tiered intervention models (RTI/MTSS), and manages intervention staffing and resourcing",
          expert: "Shapes literacy or numeracy policy at the system or sector level, contributes to research or professional publications, designs professional learning programs for teachers on evidence-based instruction, and drives measurable improvement in school or system-wide outcomes",
        },
      },
      {
        name: "VET & Vocational Training",
        category: "hard_skill",
        description: "Delivering competency-based training and assessment, managing Recognition of Prior Learning (RPL), developing training packages, and ensuring ASQA compliance in the Australian VET sector",
        sample_questions: [
          "An ASQA audit identifies that your assessments for a Certificate III qualification don't meet the rules of evidence. How do you remediate the issue and prevent it from recurring?",
          "A mature-age student with 15 years of industry experience applies for RPL across most units of a Diploma. Walk me through your RPL assessment process.",
        ],
        level_descriptors: {
          basic: "Delivers training sessions from existing resources, conducts competency-based assessments using validated tools, and maintains student records in the student management system",
          intermediate: "Develops assessment tools that meet the principles of assessment and rules of evidence, manages RPL processes, maps training package requirements to delivery plans, and maintains compliance documentation for audit readiness",
          advanced: "Leads RTO compliance and quality assurance, designs training and assessment strategies for new qualifications, manages scope of registration changes, coordinates industry consultation for training package development, and mentors trainers on assessment practice",
          expert: "Shapes VET policy at the sector or national level, leads RTO governance and strategic planning, designs innovative delivery models (e.g., blended, workplace-based, micro-credentials), manages complex multi-site or multi-qualification operations, and contributes to training package review processes",
        },
      },
      {
        name: "Higher Education Teaching",
        category: "hard_skill",
        description: "Delivering research-informed teaching in higher education, designing courses for TEQSA standards, managing academic integrity, and supporting diverse student cohorts",
        sample_questions: [
          "You're redesigning a second-year unit that has had consistently poor student evaluations and high failure rates. Walk me through your course redesign process.",
          "Generative AI tools have made traditional essay assessments unreliable for measuring student learning in your discipline. How do you redesign your assessment strategy while maintaining academic integrity?",
        ],
        level_descriptors: {
          basic: "Delivers tutorials and lectures from existing course materials, marks assessments using provided rubrics, holds office hours, and refers students to support services",
          intermediate: "Designs course outlines and assessments aligned to learning outcomes and AQF level descriptors, integrates research into teaching, uses learning analytics to identify at-risk students, and manages academic integrity cases",
          advanced: "Leads course and program-level curriculum review, designs innovative assessment and pedagogy (authentic assessment, work-integrated learning), prepares documentation for TEQSA compliance, supervises honours or postgraduate students, and contributes to learning and teaching committees",
          expert: "Shapes institutional learning and teaching strategy, leads accreditation and reaccreditation processes, publishes scholarship of teaching and learning (SoTL) research, designs programs that meet professional accreditation requirements, and mentors academics on teaching practice",
        },
      },
      {
        name: "School Leadership",
        category: "hard_skill",
        description: "Leading school operations including timetabling, budgeting, staff performance reviews, strategic planning, and community engagement",
        sample_questions: [
          "You take over as principal of a school where staff morale is low, enrolments are declining, and the community has lost confidence. What are your priorities in the first 100 days?",
          "You need to cut 10% from next year's budget without compromising student outcomes. Walk me through your decision-making process.",
        ],
        level_descriptors: {
          basic: "Manages a faculty or year-level team, coordinates timetabling or event logistics, and supports whole-school initiatives as directed by senior leadership",
          intermediate: "Leads a department or sub-school, manages a delegated budget, conducts staff performance and development reviews, and contributes to the school's annual improvement plan",
          advanced: "Leads whole-school strategic planning, manages the school budget end-to-end, oversees staff recruitment and performance management, drives community engagement and partnerships, and manages compliance with state education department requirements",
          expert: "Leads a school or campus as principal, shapes educational vision and culture, manages complex stakeholder environments (school council, parent body, department, unions), drives system-level improvement, and mentors aspiring leaders",
        },
      },
      {
        name: "Early Childhood Education",
        category: "hard_skill",
        description: "Designing play-based learning programs aligned to the Early Years Learning Framework (EYLF), meeting National Quality Standard (NQS) requirements, and supporting developmental milestones in children from birth to five years",
        sample_questions: [
          "A Quality Improvement Plan review reveals your service is rated 'Working Towards' on Quality Area 1 (Educational Program and Practice). How do you lead improvement to achieve 'Meeting' or 'Exceeding'?",
          "A three-year-old in your room is showing significant speech and language delays but the family is resistant to seeking external support. How do you navigate this sensitively?",
        ],
        level_descriptors: {
          basic: "Implements planned learning experiences, documents children's learning through observations and photos, follows established routines, and supports children's self-regulation and social development",
          intermediate: "Designs play-based programs using the EYLF learning outcomes, writes individual learning plans based on observations, communicates effectively with families about children's progress, and contributes to NQS quality improvement plans",
          advanced: "Leads the educational program as Educational Leader, mentors educators on documentation and intentional teaching, manages NQS assessment and rating processes, coordinates with allied health professionals and NDIS early childhood partners, and drives continuous improvement",
          expert: "Shapes early childhood pedagogy at the sector or policy level, leads multi-service operations, designs innovative programs that integrate research on early brain development, contributes to sector advocacy and professional standards development, and mentors Educational Leaders across services",
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
