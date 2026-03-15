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

      // ── Clinical Specialties (AU-focused) ──────────────────────

      {
        name: "Emergency & Triage",
        category: "hard_skill",
        description:
          "Emergency department assessment using ACEM triage categories (ATS 1–5), resuscitation leadership, and time-critical clinical decision-making",
        sample_questions: [
          "You're triaging a patient who presents with chest pain but a GCS of 14. Family is distressed and demanding immediate attention. Walk me through your first 3 minutes.",
          "A multi-vehicle accident brings four patients to your ED simultaneously. One is a child with suspected internal bleeding, another is an elderly patient in cardiac arrest. How do you allocate your team and resources?",
        ],
        level_descriptors: {
          basic:
            "Applies the Australasian Triage Scale under supervision, recognises ATS Category 1 and 2 presentations",
          intermediate:
            "Independently triages across all five ATS categories, initiates resuscitation protocols and escalates appropriately",
          advanced:
            "Leads trauma and resuscitation teams, makes complex disposition decisions under pressure, coordinates with retrieval services",
          expert:
            "Designs ED flow and triage improvement initiatives, mentors registrars, contributes to ACEM guideline development",
        },
      },
      {
        name: "Mental Health Nursing",
        category: "hard_skill",
        description:
          "Psychiatric risk assessment, de-escalation techniques, safety planning, and practice within relevant state/territory Mental Health Acts",
        sample_questions: [
          "A patient on an involuntary treatment order becomes agitated and refuses medication. A junior nurse is visibly frightened. Talk me through how you manage the next 10 minutes.",
          "You're completing a risk assessment on a patient who denies suicidal ideation but whose family has called expressing serious concern. How do you navigate conflicting information to build a safety plan?",
        ],
        level_descriptors: {
          basic:
            "Conducts structured risk assessments with supervision, understands the difference between voluntary and involuntary status under the Mental Health Act",
          intermediate:
            "Independently de-escalates acute presentations, develops safety plans, and applies the least restrictive practice principles",
          advanced:
            "Manages complex dual-diagnosis cases, leads consumer-centred care planning, navigates Mental Health Tribunal processes",
          expert:
            "Shapes mental health service models, leads implementation of trauma-informed care frameworks, mentors clinicians on complex legislative scenarios",
        },
      },
      {
        name: "Aged Care",
        category: "hard_skill",
        description:
          "Care delivery aligned to the Aged Care Quality Standards, dementia-specific approaches, palliative philosophy, and awareness of Royal Commission recommendations",
        sample_questions: [
          "A resident with moderate dementia has started refusing meals and becoming combative during personal care. The family is insisting on a feeding tube. Walk me through your clinical reasoning and how you facilitate the conversation.",
          "Your facility has just received a notice of a Quality Standards assessment visit in two weeks. You know Standard 3 (Personal and Clinical Care) documentation has gaps. What do you prioritise and how do you bring your team along?",
        ],
        level_descriptors: {
          basic:
            "Delivers personal care respectfully, follows care plans, and understands the eight Aged Care Quality Standards at a foundational level",
          intermediate:
            "Develops individualised care plans incorporating dementia care best practice and palliative approaches, documents against Quality Standards requirements",
          advanced:
            "Leads clinical governance in residential or home care settings, implements recommendations from the Royal Commission into Aged Care Quality and Safety",
          expert:
            "Designs aged care service models, drives sector reform, leads accreditation strategy, and contributes to Aged Care Quality and Safety Commission consultations",
        },
      },
      {
        name: "Perioperative & Theatre Nursing",
        category: "hard_skill",
        description:
          "Surgical safety procedures including counts, sterile technique, anaesthetic support, and post-anaesthetic recovery care aligned to ACORN standards",
        sample_questions: [
          "You're the scrub nurse on a complex abdominal case. The final count is discrepant — one swab short — but the surgeon wants to close. The patient has been under anaesthetic for four hours. What do you do?",
          "A patient in PACU becomes acutely hypotensive and their oxygen saturation drops to 88% fifteen minutes post-extubation. Talk me through your assessment and immediate actions.",
        ],
        level_descriptors: {
          basic:
            "Performs surgical counts accurately, maintains sterile field under supervision, monitors patients in PACU using standard observations",
          intermediate:
            "Independently scrubs for a range of surgical specialties, manages anaesthetic support, recognises and escalates post-operative complications",
          advanced:
            "Leads the theatre team for complex cases, drives compliance with ACORN standards, manages critical incidents in recovery",
          expert:
            "Designs perioperative education programs, leads theatre governance and efficiency initiatives, mentors across surgical specialties",
        },
      },
      {
        name: "Paediatric Care",
        category: "hard_skill",
        description:
          "Developmental assessment, family-centred care, paediatric resuscitation, and child safeguarding within Australian mandatory reporting frameworks",
        sample_questions: [
          "A 3-year-old presents with a femur fracture. The parents say she fell off the couch, but you notice bruising in different stages of healing. How do you proceed while maintaining the therapeutic relationship?",
          "You're caring for an 8-year-old with newly diagnosed type 1 diabetes. The child is terrified of needles and the parents are overwhelmed. How do you structure the first 48 hours of education and support?",
        ],
        level_descriptors: {
          basic:
            "Performs age-appropriate observations and assessments, understands mandatory reporting obligations, engages families in basic care",
          intermediate:
            "Independently manages common paediatric presentations, applies developmental milestones to care planning, initiates safeguarding referrals appropriately",
          advanced:
            "Leads paediatric resuscitation, manages complex chronic conditions, coordinates multi-disciplinary family-centred care",
          expert:
            "Develops paediatric care pathways, leads child protection programs, contributes to national paediatric clinical guidelines",
        },
      },

      // ── Allied Health ──────────────────────────────────────────

      {
        name: "Physiotherapy",
        category: "hard_skill",
        description:
          "Musculoskeletal and neurological assessment, evidence-based treatment planning, exercise prescription, and outcome measurement aligned to APA standards",
        sample_questions: [
          "A patient is two days post total knee replacement and is anxious about weight-bearing. Their pain is 7/10 despite analgesia and they refused to mobilise with the morning shift. How do you approach your session?",
          "You're managing a caseload in a busy public hospital. A new referral comes in for an ICU patient requiring chest physio, but you have three ward patients overdue for mobilisation who are at risk of delayed discharge. Talk me through your clinical reasoning.",
        ],
        level_descriptors: {
          basic:
            "Conducts standard assessments and delivers supervised treatment programs, uses basic outcome measures like the Timed Up and Go",
          intermediate:
            "Independently develops and progresses treatment plans across common presentations, selects appropriate validated outcome measures",
          advanced:
            "Manages complex multi-system patients, leads group programs, integrates evidence into clinical practice, supervises junior physiotherapists",
          expert:
            "Drives service redesign, leads clinical research, holds APA specialist title or equivalent, mentors across the profession",
        },
      },
      {
        name: "Occupational Therapy",
        category: "hard_skill",
        description:
          "Functional assessment, activity of daily living (ADL) intervention, assistive technology prescription, and occupation-centred goal setting",
        sample_questions: [
          "A patient with a new C6 spinal cord injury is emotionally withdrawn and refusing OT sessions, saying 'what's the point.' Their family is pushing hard for intensive rehab. How do you navigate the first week of your therapeutic relationship?",
          "You're doing a home visit for an elderly patient being discharged after a hip fracture. The home has three external steps, a narrow bathroom, and the patient lives alone. Walk me through your assessment and recommendations.",
        ],
        level_descriptors: {
          basic:
            "Conducts structured ADL assessments, prescribes basic assistive technology under supervision, understands occupation-centred practice frameworks",
          intermediate:
            "Independently plans and delivers functional interventions, conducts home assessments, prescribes and justifies assistive technology through NDIS or state funding",
          advanced:
            "Manages complex rehabilitation cases, leads discharge planning, integrates vocational rehabilitation and community reintegration",
          expert:
            "Shapes OT service models, leads research in functional outcomes, mentors across specialties, contributes to OT Australia policy",
        },
      },
      {
        name: "Speech Pathology",
        category: "hard_skill",
        description:
          "Communication assessment and intervention, dysphagia management, and augmentative and alternative communication (AAC) prescription",
        sample_questions: [
          "You've been asked to assess swallowing for a stroke patient who is nil by mouth. The patient is visibly distressed about not being able to eat and their family is asking why they can't just have small sips of water. How do you manage the clinical assessment and the family conversation?",
          "A 4-year-old has been referred with suspected childhood apraxia of speech. The parents are anxious and have been reading conflicting information online. Walk me through your assessment approach and how you set expectations with the family.",
        ],
        level_descriptors: {
          basic:
            "Conducts screening assessments for communication and swallowing, delivers structured therapy plans under supervision",
          intermediate:
            "Independently manages a caseload across communication and dysphagia, selects and applies standardised assessments, modifies diet textures using the IDDSI framework",
          advanced:
            "Manages complex neurological communication disorders and high-risk dysphagia, prescribes AAC systems, leads mealtime management programs",
          expert:
            "Leads speech pathology service development, drives AAC innovation, contributes to Speech Pathology Australia clinical guidelines and research",
        },
      },

      // ── Management & Systems ───────────────────────────────────

      {
        name: "Clinical Leadership",
        category: "hard_skill",
        description:
          "Ward and unit management, staff rostering, clinical governance, quality improvement, and health service leadership",
        sample_questions: [
          "Two senior nurses on your ward are in open conflict that is affecting the team. Sick leave on the unit is rising and a junior nurse has come to you in tears. You also have a new graduate starting next week. How do you stabilise the situation?",
          "Your unit's hospital-acquired pressure injury rate has doubled over two quarters. You have data showing it correlates with a staffing model change. Walk me through how you build the case for change and implement a quality improvement cycle.",
        ],
        level_descriptors: {
          basic:
            "Coordinates shift activities, supports rostering, participates in ward meetings and incident reporting",
          intermediate:
            "Manages a ward or unit including rostering, performance conversations, and clinical governance reporting",
          advanced:
            "Leads quality improvement initiatives using frameworks such as PDSA, manages budgets, drives clinical governance across a service line",
          expert:
            "Shapes health service strategy, leads organisational change, mentors emerging nurse and allied health leaders, engages with executive and board governance",
        },
      },
      {
        name: "Health Informatics",
        category: "hard_skill",
        description:
          "EMR implementation and optimisation, clinical data analytics, interoperability standards (HL7/FHIR), and digital health transformation",
        sample_questions: [
          "Your hospital is migrating from a legacy EMR to a new system. Clinicians are resistant, citing 'it takes twice as long to chart.' You have 8 weeks until go-live. How do you approach clinical engagement and change management?",
          "A clinical director asks you to build a dashboard showing unwarranted clinical variation across three surgical units. You have access to EMR data but suspect data quality issues. Walk me through your approach from data to decision.",
        ],
        level_descriptors: {
          basic:
            "Understands EMR workflows, assists with data entry standardisation, and supports basic reporting",
          intermediate:
            "Configures clinical system modules, builds reports and dashboards, applies HL7 messaging concepts in practice",
          advanced:
            "Leads EMR implementation projects, designs interoperability solutions using FHIR, drives clinical analytics and decision-support tool development",
          expert:
            "Shapes digital health strategy at organisational or jurisdictional level, leads national interoperability initiatives, publishes in health informatics research",
        },
      },
      {
        name: "Quality & Accreditation",
        category: "hard_skill",
        description:
          "Application of the NSQHS Standards, accreditation preparation and survey coordination, clinical audit, and continuous quality improvement",
        sample_questions: [
          "Your hospital's accreditation survey is in three months. An internal audit has found that compliance with the Medication Safety Standard (Standard 4) is at 62%. Walk me through your 90-day action plan.",
          "A serious clinical incident has occurred — a patient received the wrong blood product. You're leading the RCA. How do you structure the investigation, and how do you ensure the recommendations actually get implemented rather than sitting in a report?",
        ],
        level_descriptors: {
          basic:
            "Understands the eight NSQHS Standards, participates in clinical audits and incident reporting",
          intermediate:
            "Leads clinical audits, prepares units for accreditation surveys, facilitates incident review meetings",
          advanced:
            "Coordinates organisation-wide accreditation readiness, leads root cause analyses, designs quality improvement programs aligned to NSQHS Standards",
          expert:
            "Shapes quality and safety strategy at executive level, serves as an ACSQHC surveyor or advisor, drives sector-wide safety initiatives",
        },
      },
      {
        name: "Telehealth & Digital Health",
        category: "hard_skill",
        description:
          "Virtual consultation delivery, remote patient monitoring, digital health platform management, and MBS telehealth item compliance",
        sample_questions: [
          "You're conducting a telehealth consultation with a rural patient who has poorly controlled diabetes. The video keeps dropping out and the patient seems to be minimising their symptoms. How do you ensure a clinically safe consultation?",
          "Your organisation wants to launch a remote monitoring program for heart failure patients across three regional sites. You need to choose a platform, design the clinical escalation pathway, and get GP buy-in. Where do you start?",
        ],
        level_descriptors: {
          basic:
            "Conducts straightforward telehealth consultations, understands MBS telehealth item requirements, manages basic technical issues",
          intermediate:
            "Independently delivers complex virtual care, triages appropriateness for telehealth vs in-person, configures remote monitoring devices",
          advanced:
            "Designs and implements telehealth service models, builds clinical escalation pathways for remote monitoring, leads digital health adoption across teams",
          expert:
            "Shapes jurisdictional or national telehealth policy, evaluates digital health platforms at scale, publishes on virtual care models and outcomes",
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
