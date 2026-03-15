import type { IndustryDefinition } from "@/lib/industry-skills";

export const generalIndustry: IndustryDefinition = {
    id: "general",
    label: "General / Other",
    icon: "🔧",
    description: "Roles that don't fit a specific industry category",
    interview_context: {
      persona:
        "You are a thoughtful hiring manager conducting a well-rounded interview. Adapt your approach based on the specific job description and requirements provided.",
      tone: "Professional, warm, and adaptive to the role.",
      domain_terminology: [],
      red_flags_to_probe: [
        "Vague answers without specific examples",
        "No evidence of measurable impact",
        "Inability to describe growth or learning",
        "Poor self-awareness about strengths and weaknesses",
      ],
      what_great_looks_like:
        "Strong candidates provide specific examples, quantify their impact, demonstrate self-awareness and growth mindset, and show genuine interest in the role.",
    },
    hard_skills: [],
    soft_skills: [
      {
        name: "Communication",
        category: "soft_skill",
        description: "Clear, effective communication across formats and audiences",
        sample_questions: [
          "Describe a situation where clear communication was critical to the outcome.",
          "How do you adapt your communication style for different audiences?",
        ],
        level_descriptors: {
          basic: "Communicates routine information clearly",
          intermediate: "Adapts communication to audience, handles difficult conversations",
          advanced: "Influences through communication, presents at senior levels",
          expert: "Sets communication standards, represents the organization externally",
        },
      },
      {
        name: "Problem-Solving",
        category: "soft_skill",
        description: "Analytical and creative approach to solving challenges",
        sample_questions: [
          "Walk me through how you approach a problem you've never seen before.",
          "Describe the most complex problem you've solved at work.",
        ],
        level_descriptors: {
          basic: "Solves well-defined problems with guidance",
          intermediate: "Tackles ambiguous problems independently",
          advanced: "Solves complex, multi-faceted problems systematically",
          expert: "Develops problem-solving frameworks for organizations",
        },
      },
      {
        name: "Leadership",
        category: "soft_skill",
        description: "Influencing, motivating, and guiding others toward shared goals",
        sample_questions: [
          "Describe a time you led without formal authority.",
          "How do you handle underperforming team members?",
        ],
        level_descriptors: {
          basic: "Contributes positively to team dynamics",
          intermediate: "Takes initiative, influences peers",
          advanced: "Leads teams and projects effectively",
          expert: "Shapes organizational culture and direction",
        },
      },
      {
        name: "Time Management",
        category: "soft_skill",
        description: "Prioritizing effectively and managing multiple responsibilities",
        sample_questions: [
          "How do you prioritize when everything is urgent?",
          "Describe your approach to managing competing deadlines.",
        ],
        level_descriptors: {
          basic: "Meets deadlines with structure and reminders",
          intermediate: "Self-manages priorities effectively",
          advanced: "Manages complex workloads, helps team prioritize",
          expert: "Designs organizational prioritization frameworks",
        },
      },
      {
        name: "Adaptability",
        category: "soft_skill",
        description: "Adjusting to changing conditions, roles, and requirements",
        sample_questions: [
          "Describe a major change at work and how you adapted.",
          "How do you approach learning something completely new?",
        ],
        level_descriptors: {
          basic: "Adjusts to changes when supported",
          intermediate: "Embraces change, learns new skills proactively",
          advanced: "Leads through change, helps others adapt",
          expert: "Drives organizational change, builds adaptive culture",
        },
      },
    ],
    sub_niches: [],
  };
