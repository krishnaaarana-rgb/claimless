import type { IndustryDefinition } from "@/lib/industry-skills";

export const legalIndustry: IndustryDefinition = {
    id: "legal",
    label: "Legal",
    icon: "⚖️",
    description: "Law firms, in-house legal, compliance, and regulatory roles",
    interview_context: {
      persona:
        "You are a senior legal hiring manager. You value precision, analytical reasoning, and practical judgment. Probe for how candidates handle ambiguity and make risk-based decisions.",
      tone: "Precise and measured — detail matters in legal work.",
      domain_terminology: [
        "due diligence", "contract lifecycle", "litigation hold",
        "regulatory filing", "privilege", "discovery", "injunction",
        "indemnification", "force majeure", "jurisdiction",
      ],
      red_flags_to_probe: [
        "Inability to articulate risk-benefit tradeoffs",
        "No experience with actual legal judgment calls",
        "Vague answers about handling confidential information",
        "Lack of attention to contractual detail",
      ],
      what_great_looks_like:
        "Strong candidates demonstrate precise reasoning, provide structured analysis of legal issues, show good judgment about when to escalate, and balance legal risk with business needs.",
    },
    hard_skills: [
      {
        name: "Contract Drafting & Review",
        category: "hard_skill",
        description: "Drafting, reviewing, and negotiating legal agreements",
        sample_questions: [
          "Walk me through your process for reviewing a complex commercial contract.",
          "What are the most critical clauses you focus on and why?",
        ],
        level_descriptors: {
          basic: "Reviews simple contracts with templates and checklists",
          intermediate: "Drafts and negotiates standard agreements independently",
          advanced: "Handles complex, high-value contracts with strategic awareness",
          expert: "Creates contract frameworks, negotiates novel deal structures",
        },
      },
      {
        name: "Legal Research & Analysis",
        category: "hard_skill",
        description: "Researching case law, statutes, and regulations to support legal positions",
        sample_questions: [
          "Describe a research project where the answer wasn't straightforward.",
          "How do you stay current on regulatory changes in your practice area?",
        ],
        level_descriptors: {
          basic: "Conducts basic searches in legal databases",
          intermediate: "Performs thorough research with well-organized memos",
          advanced: "Handles complex, multi-jurisdictional research independently",
          expert: "Develops legal positions on novel issues, publishes thought leadership",
        },
      },
      {
        name: "Regulatory Compliance",
        category: "hard_skill",
        description: "Ensuring organizational compliance with applicable laws and regulations",
        sample_questions: [
          "How do you approach building a compliance program from scratch?",
          "Describe how you've handled a regulatory investigation or inquiry.",
        ],
        level_descriptors: {
          basic: "Follows compliance procedures, flags issues",
          intermediate: "Implements compliance controls, handles routine reporting",
          advanced: "Designs compliance programs, manages regulatory relationships",
          expert: "Shapes regulatory strategy, handles enforcement actions",
        },
      },
      {
        name: "Litigation Management",
        category: "hard_skill",
        description: "Managing litigation matters including discovery, depositions, and trial preparation",
        sample_questions: [
          "Walk me through your approach to managing a complex litigation matter.",
          "How do you assess whether to settle or proceed to trial?",
        ],
        level_descriptors: {
          basic: "Assists with discovery and document review",
          intermediate: "Manages litigation tasks independently, drafts motions",
          advanced: "Leads litigation strategy, handles depositions and hearings",
          expert: "Manages complex multi-party litigation, tries cases",
        },
      },
      {
        name: "Data Privacy & Governance",
        category: "hard_skill",
        description: "GDPR, CCPA, and data protection compliance",
        sample_questions: [
          "How do you approach a cross-border data transfer assessment?",
          "Describe your experience with data breach response.",
        ],
        level_descriptors: {
          basic: "Understands basic privacy principles and regulations",
          intermediate: "Conducts privacy impact assessments, handles DSARs",
          advanced: "Designs privacy programs, manages cross-border issues",
          expert: "Leads privacy strategy, interfaces with regulators globally",
        },
      },
    ],
    soft_skills: [
      {
        name: "Analytical Reasoning",
        category: "soft_skill",
        description: "Breaking down complex legal issues into structured analysis",
        sample_questions: [
          "How do you approach a legal issue you've never encountered before?",
          "Describe a situation where you had to balance competing legal arguments.",
        ],
        level_descriptors: {
          basic: "Identifies key issues with guidance",
          intermediate: "Structures analysis independently, considers alternatives",
          advanced: "Handles multi-faceted issues with nuanced reasoning",
          expert: "Develops analytical frameworks, mentors on legal reasoning",
        },
      },
      {
        name: "Business Acumen",
        category: "soft_skill",
        description: "Understanding how legal advice impacts business outcomes",
        sample_questions: [
          "Describe a time you balanced legal risk with business needs.",
          "How do you ensure your legal advice is practical, not just technically correct?",
        ],
        level_descriptors: {
          basic: "Understands basic business context of legal work",
          intermediate: "Provides practical legal advice with business awareness",
          advanced: "Proactively identifies legal issues from business strategy",
          expert: "Serves as strategic business advisor, shapes business decisions",
        },
      },
      {
        name: "Written Communication",
        category: "soft_skill",
        description: "Clear, precise legal writing for various audiences",
        sample_questions: [
          "How do you tailor legal writing for non-lawyer stakeholders?",
          "Describe your approach to writing a brief or legal memo.",
        ],
        level_descriptors: {
          basic: "Writes clearly with standard legal formatting",
          intermediate: "Produces polished, well-organized legal documents",
          advanced: "Adapts style for audience, writes persuasively",
          expert: "Sets writing standards, mentors on legal writing",
        },
      },
      {
        name: "Professional Judgment",
        category: "soft_skill",
        description: "Knowing when to escalate, when to advise caution, and when to take calculated risks",
        sample_questions: [
          "Describe a situation where you had to make a judgment call without perfect information.",
          "How do you decide when to involve outside counsel?",
        ],
        level_descriptors: {
          basic: "Seeks guidance appropriately on judgment calls",
          intermediate: "Makes sound judgment on routine matters",
          advanced: "Handles high-stakes decisions with good risk calibration",
          expert: "Trusted advisor on the most sensitive matters",
        },
      },
    ],
    sub_niches: [
      {
        id: "corporate_law",
        label: "Corporate & M&A",
        additional_skills: ["M&A Due Diligence", "Securities Law", "Corporate Governance", "Entity Management"],
        interview_hints: "Focus on deal experience, board interaction, and ability to manage complex transactions.",
      },
      {
        id: "ip_law",
        label: "Intellectual Property",
        additional_skills: ["Patent Prosecution", "Trademark Management", "IP Licensing", "Trade Secret Protection"],
        interview_hints: "Probe for technical understanding, portfolio strategy, and enforcement experience.",
      },
      {
        id: "employment_law",
        label: "Employment Law",
        additional_skills: ["Workplace Investigations", "Benefits Compliance", "Labor Relations", "Accommodations"],
        interview_hints: "Focus on employee relations scenarios, investigation methodology, and preventive counseling.",
      },
      {
        id: "legal_ops",
        label: "Legal Operations",
        additional_skills: ["Legal Tech (CLM, eDiscovery)", "Legal Spend Management", "Process Optimization", "Vendor Management"],
        interview_hints: "Balance legal knowledge with operational efficiency and technology adoption.",
      },
    ],
  };
