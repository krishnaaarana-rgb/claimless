import type { IndustryDefinition } from "@/lib/industry-skills";

export const healthcareIndustry: IndustryDefinition = {
    id: "healthcare",
    label: "Healthcare & Medical",
    icon: "🏥",
    description: "Clinical, pharmaceutical, health IT, and medical device roles",
    interview_context: {
      persona:
        "You are an experienced healthcare hiring manager. You understand clinical workflows, patient safety protocols, and regulatory requirements. Probe for real-world patient care scenarios, not textbook answers.",
      tone: "Empathetic but thorough — patient safety is non-negotiable.",
      domain_terminology: [
        "HIPAA", "EMR/EHR", "patient outcomes", "clinical protocols",
        "care coordination", "formulary", "ICD-10", "CPT codes",
        "evidence-based practice", "patient acuity", "discharge planning",
      ],
      red_flags_to_probe: [
        "Vague answers about patient safety protocols",
        "No mention of compliance or documentation",
        "Inability to describe handling adverse events",
        "Lack of team-based care experience",
      ],
      what_great_looks_like:
        "Strong candidates describe specific patient scenarios, demonstrate understanding of regulatory requirements, show empathy balanced with clinical rigor, and can articulate how they handle high-pressure situations.",
    },
    hard_skills: [
      {
        name: "Clinical Documentation",
        category: "hard_skill",
        description: "Accurate medical record-keeping, charting, and clinical note writing",
        sample_questions: [
          "Walk me through how you document a complex patient encounter.",
          "How do you ensure accuracy when charting under time pressure?",
        ],
        level_descriptors: {
          basic: "Can complete standard forms and templates with supervision",
          intermediate: "Independently documents encounters with proper terminology",
          advanced: "Creates thorough, legally defensible documentation efficiently",
          expert: "Trains others, develops documentation standards and templates",
        },
      },
      {
        name: "HIPAA Compliance",
        category: "hard_skill",
        description: "Understanding and adherence to patient privacy regulations",
        sample_questions: [
          "Describe a situation where you had to navigate a HIPAA gray area.",
          "How do you handle requests for patient information from family members?",
        ],
        level_descriptors: {
          basic: "Understands basic privacy rules and follows established procedures",
          intermediate: "Applies HIPAA to complex scenarios, reports violations",
          advanced: "Designs compliant workflows, conducts training",
          expert: "Leads compliance programs, handles breach response",
        },
      },
      {
        name: "EMR/EHR Systems",
        category: "hard_skill",
        description: "Proficiency with electronic medical record systems (Epic, Cerner, etc.)",
        sample_questions: [
          "Which EMR systems have you used, and how did you adapt to new ones?",
          "How do you leverage EMR data to improve patient outcomes?",
        ],
        level_descriptors: {
          basic: "Can navigate and enter data in one system",
          intermediate: "Proficient in multiple systems, uses templates efficiently",
          advanced: "Customizes workflows, generates reports, trains staff",
          expert: "Leads EMR implementations, optimizes system-wide workflows",
        },
      },
      {
        name: "Patient Assessment",
        category: "hard_skill",
        description: "Clinical evaluation, triage, and patient monitoring skills",
        sample_questions: [
          "Describe your approach to assessing a patient with multiple co-morbidities.",
          "How do you prioritize when multiple patients need attention simultaneously?",
        ],
        level_descriptors: {
          basic: "Performs routine assessments with guidance",
          intermediate: "Independently assesses and identifies key findings",
          advanced: "Handles complex cases, recognizes subtle clinical changes",
          expert: "Mentors others, develops assessment protocols",
        },
      },
      {
        name: "Medication Management",
        category: "hard_skill",
        description: "Safe medication administration, pharmacology knowledge, drug interactions",
        sample_questions: [
          "How do you verify medication orders for safety?",
          "Describe a time you caught a potential medication error.",
        ],
        level_descriptors: {
          basic: "Follows the five rights of medication administration",
          intermediate: "Understands common interactions, adjusts for patient factors",
          advanced: "Manages complex regimens, educates patients and staff",
          expert: "Develops formulary guidelines, leads medication safety initiatives",
        },
      },
      {
        name: "Infection Control",
        category: "hard_skill",
        description: "Prevention and management of healthcare-associated infections",
        sample_questions: [
          "Walk me through your infection control practices in daily workflow.",
          "How have you responded to an outbreak situation?",
        ],
        level_descriptors: {
          basic: "Follows standard precautions consistently",
          intermediate: "Applies transmission-based precautions, monitors compliance",
          advanced: "Investigates infection patterns, implements control measures",
          expert: "Leads infection control programs, develops institutional policies",
        },
      },
      {
        name: "Medical Coding & Billing",
        category: "hard_skill",
        description: "ICD-10, CPT coding, claims processing, revenue cycle knowledge",
        sample_questions: [
          "How do you ensure coding accuracy for complex procedures?",
          "Describe your experience with claim denials and appeals.",
        ],
        level_descriptors: {
          basic: "Assigns common codes with reference materials",
          intermediate: "Codes independently with high accuracy",
          advanced: "Handles complex coding scenarios, audits others' work",
          expert: "Develops coding guidelines, leads compliance audits",
        },
      },
      {
        name: "Regulatory Compliance (FDA/CMS)",
        category: "hard_skill",
        description: "Knowledge of healthcare regulations, accreditation standards, and government agency requirements",
        sample_questions: [
          "How do you stay current with changing healthcare regulations?",
          "Describe your experience preparing for a regulatory audit.",
        ],
        level_descriptors: {
          basic: "Aware of major regulations affecting their role",
          intermediate: "Applies regulations to daily work, participates in audits",
          advanced: "Leads compliance efforts, interprets regulatory changes",
          expert: "Shapes institutional compliance strategy, interfaces with regulators",
        },
      },
    ],
    soft_skills: [
      {
        name: "Patient Communication",
        category: "soft_skill",
        description: "Ability to explain complex medical information clearly and empathetically",
        sample_questions: [
          "How do you explain a difficult diagnosis to a patient with limited health literacy?",
          "Describe a time you had to deliver bad news. How did you approach it?",
        ],
        level_descriptors: {
          basic: "Communicates routine information clearly",
          intermediate: "Adapts communication style to patient needs",
          advanced: "Handles emotionally charged conversations with skill",
          expert: "Trains others in patient communication, develops scripts",
        },
      },
      {
        name: "Crisis Management",
        category: "soft_skill",
        description: "Staying calm and effective during medical emergencies",
        sample_questions: [
          "Describe the most high-pressure clinical situation you've faced and how you handled it.",
          "How do you maintain composure when multiple emergencies happen simultaneously?",
        ],
        level_descriptors: {
          basic: "Follows emergency protocols with guidance",
          intermediate: "Responds effectively to common emergencies",
          advanced: "Leads emergency response, makes rapid clinical decisions",
          expert: "Develops emergency protocols, trains teams, debriefs effectively",
        },
      },
      {
        name: "Interdisciplinary Collaboration",
        category: "soft_skill",
        description: "Working effectively across healthcare teams (doctors, nurses, specialists, social workers)",
        sample_questions: [
          "How do you handle disagreements with a physician about a care plan?",
          "Describe a time when cross-team collaboration improved a patient outcome.",
        ],
        level_descriptors: {
          basic: "Communicates with immediate team members",
          intermediate: "Coordinates across departments effectively",
          advanced: "Leads multidisciplinary rounds, resolves conflicts",
          expert: "Builds collaborative culture, designs team-based care models",
        },
      },
      {
        name: "Ethical Decision-Making",
        category: "soft_skill",
        description: "Navigating complex ethical situations in patient care",
        sample_questions: [
          "Describe an ethical dilemma you faced in patient care. How did you resolve it?",
          "How do you balance patient autonomy with clinical recommendations?",
        ],
        level_descriptors: {
          basic: "Recognizes ethical issues and seeks guidance",
          intermediate: "Applies ethical frameworks to common scenarios",
          advanced: "Navigates complex ethical situations independently",
          expert: "Serves on ethics committees, mentors on ethical practice",
        },
      },
      {
        name: "Cultural Competency",
        category: "soft_skill",
        description: "Providing respectful, effective care across diverse patient populations",
        sample_questions: [
          "How do you adapt your care approach for patients from different cultural backgrounds?",
          "Describe a situation where cultural factors affected a patient's care plan.",
        ],
        level_descriptors: {
          basic: "Shows awareness of cultural differences",
          intermediate: "Adapts care practices for cultural needs",
          advanced: "Advocates for culturally responsive care policies",
          expert: "Develops cultural competency training and programs",
        },
      },
    ],
    sub_niches: [
      {
        id: "nursing",
        label: "Nursing",
        additional_skills: ["IV Therapy", "Wound Care", "Care Planning", "Patient Advocacy"],
        interview_hints: "Focus on clinical judgment scenarios, shift handoff practices, and patient advocacy examples.",
      },
      {
        id: "pharma",
        label: "Pharmaceutical",
        additional_skills: ["Drug Development", "Clinical Trials", "GxP Compliance", "Pharmacovigilance"],
        interview_hints: "Probe for regulatory knowledge, research methodology, and drug safety awareness.",
      },
      {
        id: "health_it",
        label: "Health IT",
        additional_skills: ["HL7/FHIR", "Clinical Informatics", "Interoperability", "Health Data Analytics"],
        interview_hints: "Balance technical depth with understanding of clinical workflows and user needs.",
      },
      {
        id: "medical_devices",
        label: "Medical Devices",
        additional_skills: ["510(k) Process", "Design Controls", "Quality Systems (ISO 13485)", "Biocompatibility"],
        interview_hints: "Focus on regulatory pathway knowledge, risk management, and cross-functional collaboration.",
      },
    ],
  };
