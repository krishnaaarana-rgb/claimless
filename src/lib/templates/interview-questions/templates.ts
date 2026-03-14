import type { Template } from "../types";

export const INTERVIEW_QUESTION_TEMPLATES: Template[] = [
  {
    id: "iq_general_leadership",
    name: "Leadership & Management Deep-Dive",
    description: "Custom instructions for probing leadership experience across any industry",
    category: "interview_questions",
    industries: [],
    tags: ["leadership", "management", "general"],
    content: `Focus on leadership depth. For every management claim, ask:
- How many direct reports? What was the team structure?
- Describe a time you had to make an unpopular decision with your team
- How do you handle underperformers? Walk me through a specific case
- What's your approach to hiring? Describe a hire you made that worked out well and one that didn't
Push for specifics on team size, budget ownership, and strategic vs operational decisions.`,
  },
  {
    id: "iq_engineering_system_design",
    name: "Engineering: System Design & Architecture",
    description: "Technical deep-dive for senior engineering roles",
    category: "interview_questions",
    industries: ["technology"],
    tags: ["engineering", "architecture", "system-design"],
    content: `Focus on system design and architectural thinking:
- Ask them to design a system relevant to the role (e.g., "Design a URL shortener that handles 10M daily requests")
- Probe for: scalability, caching strategy, database choice and why, failure modes
- Ask about a real system they designed: what would they change with hindsight?
- Test their understanding of tradeoffs: consistency vs availability, monolith vs microservices, SQL vs NoSQL
- Ask about their approach to technical debt and when they'd take it on deliberately`,
  },
  {
    id: "iq_sales_pipeline",
    name: "Sales: Pipeline & Closing",
    description: "Deep-dive into sales methodology and deal management",
    category: "interview_questions",
    industries: ["sales"],
    tags: ["sales", "pipeline", "closing"],
    content: `Focus on real pipeline management and closing:
- Walk me through your current/last pipeline — how many deals, average size, close rate?
- Describe your biggest won deal end-to-end. How did you find them, qualify, and close?
- Tell me about a deal you lost. What went wrong and what did you learn?
- How do you handle price objections? Give me a specific example
- What's your approach to territory planning and account prioritisation?
Test with: "You've hit 60% of target with 3 weeks left. Your top 3 deals are all stuck. What's your plan?"`,
  },
  {
    id: "iq_healthcare_clinical",
    name: "Healthcare: Clinical Scenarios",
    description: "Patient care scenarios for clinical roles",
    category: "interview_questions",
    industries: ["healthcare"],
    tags: ["healthcare", "clinical", "patient-care"],
    content: `Focus on clinical decision-making and patient safety:
- Present a multi-patient triage scenario and ask them to prioritise
- Ask about a time they identified a medication error or near-miss — what did they do?
- How do they handle disagreements with doctors about patient care?
- Describe their approach to clinical handovers and what they include
- Ask about their experience with deteriorating patients — what triggers their escalation?
Push for evidence-based practice: "What guidelines or frameworks inform your clinical decisions?"`,
  },
  {
    id: "iq_finance_compliance",
    name: "Finance: Regulatory & Compliance",
    description: "For roles requiring regulatory knowledge (ASIC, APRA, AML)",
    category: "interview_questions",
    industries: ["finance"],
    tags: ["finance", "compliance", "regulatory"],
    content: `Focus on regulatory awareness and practical application:
- Which regulatory frameworks are most relevant to this role? Test their knowledge
- Describe a compliance issue you identified and how you resolved it
- How do you stay current with regulatory changes?
- Walk me through how you'd handle a client request that sits in a grey area
- For AU roles: test knowledge of AML/CTF obligations, ASIC requirements, responsible lending
Ask scenario: "A client wants to make a large transfer to an overseas account. What's your process?"`,
  },
  {
    id: "iq_hr_employment_law",
    name: "HR: Employment Law & People",
    description: "For HR roles — Fair Work, unfair dismissal, restructures",
    category: "interview_questions",
    industries: ["human_resources"],
    tags: ["hr", "employment-law", "people"],
    content: `Focus on practical employment law and people management:
- Walk me through how you'd handle a performance management case from first warning to termination
- Describe a restructure or redundancy process you managed. How did you ensure compliance?
- How do you handle a bullying/harassment complaint? Step by step
- What's your approach to Modern Award interpretation when there's ambiguity?
- Test with scenario: "An employee on a return-to-work plan is underperforming. Their manager wants to terminate. What do you do?"
Push for Fair Work Act knowledge, NES understanding, and practical experience with the Fair Work Commission.`,
  },
  {
    id: "iq_construction_safety",
    name: "Construction: Safety & Delivery",
    description: "For site managers, project managers, safety officers",
    category: "interview_questions",
    industries: ["construction"],
    tags: ["construction", "safety", "project-delivery"],
    content: `Focus on safety culture and project delivery:
- Describe your approach to a site safety inspection — what are you looking for?
- Walk me through how you'd respond to a serious safety incident on site
- How do you manage subcontractors who aren't meeting quality or safety standards?
- Tell me about a project that went over budget or behind programme — how did you recover?
- Ask scenario: "Your crane operator is 30 minutes late, you have a critical lift scheduled, and the client is watching. What do you do?"
Test chain of responsibility understanding and WHS obligations.`,
  },
  {
    id: "iq_customer_success",
    name: "Customer Success: Retention & Expansion",
    description: "For CS managers and account managers",
    category: "interview_questions",
    industries: ["customer_success"],
    tags: ["customer-success", "retention", "growth"],
    content: `Focus on retention strategy and commercial awareness:
- What health metrics do you track for your accounts? How do you prioritise?
- Describe a churn save — what were the warning signs and what did you do?
- How do you identify expansion/upsell opportunities? Give a specific example
- Walk me through your QBR process — what do you include and why?
- How do you handle an angry customer who escalates to your manager?
Ask scenario: "NPS just dropped 20 points for your top account. You have a QBR in 2 days. What do you do between now and then?"`,
  },
];
