import type { Template } from "../types";

export const EMAIL_TEMPLATES: Template[] = [
  {
    id: "email_screening_pass",
    name: "Screening Pass — Interview Invite",
    description: "Sent when a candidate passes ATS screening and is invited to interview",
    category: "email",
    industries: [],
    tags: ["screening", "pass", "invite"],
    variables: ["candidate_name", "job_title", "company_name", "interview_link"],
    content: {
      subject: "Next step: Interview for {{job_title}} at {{company_name}}",
      body: `Hi {{candidate_name}},

Great news — we've reviewed your application for the {{job_title}} position and we'd love to learn more about you.

We use an AI-powered interview that lets you talk through your experience at a time that suits you. It's conversational, not a test — think of it as a chat with a well-prepared hiring manager.

Start your interview here:
{{interview_link}}

The link is valid for 7 days. The interview takes about 15-20 minutes.

Tips:
- Find a quiet spot with good internet
- Have your resume handy for reference
- Be yourself — we're interested in your real experience

Looking forward to hearing from you!

Best,
{{company_name}} Hiring Team`,
    },
  },
  {
    id: "email_screening_fail",
    name: "Screening — Not Progressing",
    description: "Sent when a candidate doesn't meet screening threshold",
    category: "email",
    industries: [],
    tags: ["screening", "fail", "rejection"],
    variables: ["candidate_name", "job_title", "company_name"],
    content: {
      subject: "Update on your application for {{job_title}}",
      body: `Hi {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}} and for taking the time to apply.

After careful review, we've decided to move forward with candidates whose experience more closely aligns with what we're looking for at this time.

This isn't a reflection of your abilities — the role has specific requirements and we had a strong applicant pool. We encourage you to apply for future openings that match your background.

Wishing you all the best in your job search.

Kind regards,
{{company_name}} Hiring Team`,
    },
  },
  {
    id: "email_loom_request",
    name: "Loom Video Request",
    description: "Ask candidate to submit a short video introduction",
    category: "email",
    industries: [],
    tags: ["loom", "video", "stage2"],
    variables: ["candidate_name", "job_title", "company_name", "loom_prompt"],
    content: {
      subject: "Quick video intro for {{job_title}} — 2 minutes",
      body: `Hi {{candidate_name}},

Thanks for applying for {{job_title}} at {{company_name}}! We'd love to hear from you directly.

Could you record a short Loom video (2-3 minutes max) covering:

{{loom_prompt}}

How to submit:
1. Go to loom.com/record (free, no account needed)
2. Record your response
3. Reply to this email with the Loom link

This helps us understand your communication style and get a feel for who you are beyond the resume. There's no right or wrong answer — just be yourself.

Thanks!
{{company_name}} Hiring Team`,
    },
  },
  {
    id: "email_interview_complete_pass",
    name: "Interview Complete — Moving Forward",
    description: "Sent after interview when candidate scored well",
    category: "email",
    industries: [],
    tags: ["interview", "complete", "pass"],
    variables: ["candidate_name", "job_title", "company_name", "next_steps"],
    content: {
      subject: "Great interview — next steps for {{job_title}}",
      body: `Hi {{candidate_name}},

Thanks so much for taking the time to interview for the {{job_title}} position. We really enjoyed the conversation.

We were impressed with your experience and would like to move you to the next stage.

{{next_steps}}

If you have any questions in the meantime, don't hesitate to reach out.

Best,
{{company_name}} Hiring Team`,
    },
  },
  {
    id: "email_interview_complete_fail",
    name: "Interview Complete — Not Progressing",
    description: "Sent after interview when candidate didn't meet threshold",
    category: "email",
    industries: [],
    tags: ["interview", "complete", "rejection"],
    variables: ["candidate_name", "job_title", "company_name"],
    content: {
      subject: "Update on your {{job_title}} interview",
      body: `Hi {{candidate_name}},

Thank you for interviewing for the {{job_title}} position at {{company_name}}. We appreciate the time you invested.

After careful consideration, we've decided to proceed with other candidates whose experience is a closer fit for this particular role.

We genuinely valued the conversation and encourage you to keep an eye on our future openings.

All the best,
{{company_name}} Hiring Team`,
    },
  },
  {
    id: "email_offer",
    name: "Offer Letter",
    description: "Initial offer communication to candidate",
    category: "email",
    industries: [],
    tags: ["offer", "hired"],
    variables: ["candidate_name", "job_title", "company_name", "start_date", "salary"],
    content: {
      subject: "Offer: {{job_title}} at {{company_name}}",
      body: `Hi {{candidate_name}},

We're thrilled to offer you the position of {{job_title}} at {{company_name}}!

After a thorough evaluation process, you stood out as the ideal candidate for this role. Here are the key details:

- Position: {{job_title}}
- Start date: {{start_date}}
- Compensation: {{salary}}

A formal offer letter with full details will follow shortly. In the meantime, please don't hesitate to reach out with any questions.

We're excited to have you join the team!

Warm regards,
{{company_name}} Hiring Team`,
    },
  },
];
