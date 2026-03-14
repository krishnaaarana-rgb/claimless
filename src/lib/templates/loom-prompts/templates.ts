import type { Template } from "../types";

export const LOOM_PROMPT_TEMPLATES: Template[] = [
  {
    id: "loom_general",
    name: "General Introduction",
    description: "Works for any role — candidate introduces themselves and talks about relevant experience",
    category: "loom_prompt",
    industries: [],
    tags: ["general", "introduction"],
    content:
      "Tell us about yourself and what drew you to this role. Walk us through 1-2 projects or experiences you're most proud of and what you specifically contributed. Keep it under 3 minutes.",
  },
  {
    id: "loom_healthcare",
    name: "Healthcare: Clinical Experience",
    description: "For nurses, allied health, and clinical roles",
    category: "loom_prompt",
    industries: ["healthcare"],
    tags: ["healthcare", "clinical"],
    content:
      "Walk us through a challenging patient scenario you managed recently. What was the situation, what decisions did you make, and what was the outcome? Also tell us about your approach to documentation and handovers. Keep it under 3 minutes.",
  },
  {
    id: "loom_sales",
    name: "Sales: Pitch & Process",
    description: "For BDMs, account executives, sales managers",
    category: "loom_prompt",
    industries: ["sales"],
    tags: ["sales", "pitch"],
    content:
      "Give us a 60-second pitch of a product you've sold (or currently sell) — as if we're the prospect. Then spend 1-2 minutes explaining your sales process: how you prospect, qualify, and close. What metrics do you track?",
  },
  {
    id: "loom_engineering",
    name: "Engineering: Technical Walkthrough",
    description: "For software engineers, DevOps, data engineers",
    category: "loom_prompt",
    industries: ["technology"],
    tags: ["engineering", "technical"],
    content:
      "Pick a system or feature you built that you're proud of. Walk us through the architecture decisions you made and why. What tradeoffs did you consider? What would you do differently today? Feel free to share your screen if helpful. Keep it under 3 minutes.",
  },
  {
    id: "loom_finance",
    name: "Finance: Compliance & Analysis",
    description: "For financial analysts, advisers, compliance roles",
    category: "loom_prompt",
    industries: ["finance"],
    tags: ["finance", "compliance"],
    content:
      "Describe a complex financial analysis or compliance challenge you handled. What was the regulatory context, what approach did you take, and how did you communicate the outcome to stakeholders? Keep it under 3 minutes.",
  },
  {
    id: "loom_marketing",
    name: "Marketing: Campaign Deep-Dive",
    description: "For marketing managers, content leads, growth roles",
    category: "loom_prompt",
    industries: ["marketing"],
    tags: ["marketing", "campaign"],
    content:
      "Walk us through a campaign you led from strategy to execution. What was the goal, what channels did you use, and what were the results? Include the numbers — budget, reach, conversion, ROI. What would you change if you ran it again? Keep it under 3 minutes.",
  },
  {
    id: "loom_hr",
    name: "HR: People & Process",
    description: "For HR managers, talent acquisition, people ops",
    category: "loom_prompt",
    industries: ["human_resources"],
    tags: ["hr", "people"],
    content:
      "Tell us about a complex people situation you navigated — maybe a difficult termination, a team restructure, or a tricky employee relations issue. How did you balance the legal requirements with the human side? What frameworks or policies guided your approach? Keep it under 3 minutes.",
  },
  {
    id: "loom_operations",
    name: "Operations: Process Improvement",
    description: "For ops managers, supply chain, project managers",
    category: "loom_prompt",
    industries: ["operations"],
    tags: ["operations", "process"],
    content:
      "Describe a process you identified as broken or inefficient and how you fixed it. What data did you use to diagnose the problem? What did you implement, and what was the measurable impact? Keep it under 3 minutes.",
  },
  {
    id: "loom_construction",
    name: "Construction: Site & Safety",
    description: "For site managers, project managers, trade roles",
    category: "loom_prompt",
    industries: ["construction"],
    tags: ["construction", "safety"],
    content:
      "Walk us through a project you managed on site — what were the key challenges (safety, timeline, subcontractor coordination) and how did you handle them? Tell us about your approach to WHS and how you handle safety incidents. Keep it under 3 minutes.",
  },
  {
    id: "loom_customer_success",
    name: "Customer Success: Retention & Growth",
    description: "For CS managers, support leads, account managers",
    category: "loom_prompt",
    industries: ["customer_success"],
    tags: ["customer_success", "retention"],
    content:
      "Tell us about a client who was at risk of churning and how you saved the relationship. What signals told you they were unhappy? What did you do, and what was the outcome? Also share your approach to proactive account health management. Keep it under 3 minutes.",
  },
];
