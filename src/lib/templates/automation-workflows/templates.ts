import type { Template } from "../types";

export const AUTOMATION_WORKFLOW_TEMPLATES: Template[] = [
  {
    id: "wf_full_pipeline",
    name: "Full Candidate Pipeline",
    description: "Candidate applies via ATS → screened → auto-invited → interviewed → results pushed back to ATS → Slack notification",
    category: "automation_workflow",
    industries: [],
    tags: ["pipeline", "end-to-end", "ats"],
    content: {
      trigger: "New candidate in ATS (JobAdder/Bullhorn/Vincere)",
      steps: [
        {
          name: "Push candidate to Claimless",
          type: "HTTP Request",
          method: "POST",
          url: "https://your-app.claimless.com/api/v1/inbound",
          headers: { Authorization: "Bearer clm_your_api_key", "Content-Type": "application/json" },
          body: {
            candidate: {
              full_name: "{{candidate.name}}",
              email: "{{candidate.email}}",
              phone: "{{candidate.phone}}",
              resume_text: "{{candidate.resume_text}}",
              linkedin_url: "{{candidate.linkedin}}",
            },
            job_id: "{{job.claimless_id}}",
          },
          notes: "Returns application_id — save this for later steps",
        },
        {
          name: "Wait for screening webhook",
          type: "Webhook Trigger",
          event: "candidate.screening_completed",
          notes: "Claimless fires this webhook when ATS screening finishes (usually 15-30 seconds)",
        },
        {
          name: "Branch: Pass or Fail",
          type: "IF Condition",
          condition: "webhook.passed === true",
          if_true: "Continue to Step 4",
          if_false: "Update ATS record as rejected, send Slack notification",
        },
        {
          name: "Wait for interview webhook",
          type: "Webhook Trigger",
          event: "candidate.interview_completed",
          notes: "Fired after the candidate completes their AI interview and scoring is done",
        },
        {
          name: "Fetch full results",
          type: "HTTP Request",
          method: "GET",
          url: "https://your-app.claimless.com/api/v1/results/{{application_id}}",
          headers: { Authorization: "Bearer clm_your_api_key" },
          notes: "Returns screening scores, interview scores, recommendation, skill assessments",
        },
        {
          name: "Push results to ATS",
          type: "HTTP Request",
          notes: "Update the candidate record in your ATS with Claimless scores and recommendation",
        },
        {
          name: "Notify Slack",
          type: "Slack Message",
          channel: "#hiring",
          message: "{{candidate.name}} scored {{scores.combined}}/100 for {{job.title}} — {{interview.recommendation}}",
        },
      ],
      n8n_import_url: null,
      zapier_template_url: null,
      make_template_url: null,
    },
  },
  {
    id: "wf_slack_notifications",
    name: "Slack Notifications for Hiring Events",
    description: "Get Slack alerts for key hiring events — new applications, screening results, interview completions",
    category: "automation_workflow",
    industries: [],
    tags: ["slack", "notifications", "simple"],
    content: {
      trigger: "Claimless Webhook",
      steps: [
        {
          name: "Configure Claimless webhook",
          type: "Setup",
          notes: "In Claimless → Integrations → Webhooks, create a webhook pointing to your N8N/Zapier/Make webhook URL. Subscribe to: candidate.applied, candidate.screening_completed, candidate.interview_completed",
        },
        {
          name: "Route by event type",
          type: "Switch",
          conditions: {
            "candidate.applied": "New application alert",
            "candidate.screening_completed": "Screening result alert",
            "candidate.interview_completed": "Interview complete alert",
          },
        },
        {
          name: "Format Slack message",
          type: "Code",
          examples: {
            applied: "#hiring: New application from {{candidate_name}} for {{job_title}}",
            screening_passed: "#hiring: {{candidate_name}} passed screening for {{job_title}} (Score: {{match_score}}/100)",
            screening_failed: "#hiring: {{candidate_name}} didn't pass screening for {{job_title}} (Score: {{match_score}}/100)",
            interview_done: "#hiring: {{candidate_name}} completed interview for {{job_title}} — Recommendation: {{recommendation}}",
          },
        },
        {
          name: "Send to Slack",
          type: "Slack Message",
          notes: "Post to your #hiring channel or DM the hiring manager",
        },
      ],
    },
  },
  {
    id: "wf_google_sheets_tracker",
    name: "Google Sheets Candidate Tracker",
    description: "Auto-populate a Google Sheet with candidate data and scores as they progress through the pipeline",
    category: "automation_workflow",
    industries: [],
    tags: ["google-sheets", "tracking", "reporting"],
    content: {
      trigger: "Claimless Webhook (candidate.screening_completed, candidate.interview_completed)",
      steps: [
        {
          name: "Receive webhook",
          type: "Webhook Trigger",
          notes: "Subscribe to candidate.screening_completed and candidate.interview_completed events",
        },
        {
          name: "Fetch full results from Claimless",
          type: "HTTP Request",
          method: "GET",
          url: "https://your-app.claimless.com/api/v1/results/{{application_id}}",
          headers: { Authorization: "Bearer clm_your_api_key" },
        },
        {
          name: "Append or update Google Sheet row",
          type: "Google Sheets",
          spreadsheet: "Candidate Pipeline Tracker",
          columns: [
            "Candidate Name",
            "Email",
            "Job Title",
            "ATS Score",
            "Interview Score",
            "Combined Score",
            "Recommendation",
            "Stage",
            "Applied Date",
            "Last Updated",
          ],
          notes: "Use candidate email as the lookup key to update existing rows instead of creating duplicates",
        },
      ],
    },
  },
  {
    id: "wf_email_hiring_manager",
    name: "Email Hiring Manager on Interview Complete",
    description: "Automatically email the hiring manager when a candidate completes their AI interview with a summary of results",
    category: "automation_workflow",
    industries: [],
    tags: ["email", "hiring-manager", "notification"],
    content: {
      trigger: "Claimless Webhook (candidate.interview_completed)",
      steps: [
        {
          name: "Receive interview_completed webhook",
          type: "Webhook Trigger",
        },
        {
          name: "Fetch full results",
          type: "HTTP Request",
          method: "GET",
          url: "https://your-app.claimless.com/api/v1/results/{{application_id}}",
        },
        {
          name: "Send email to hiring manager",
          type: "Email (Gmail/Outlook/SendGrid)",
          to: "hiring-manager@company.com",
          subject: "Interview Complete: {{candidate_name}} for {{job_title}}",
          body: `Hi,

{{candidate_name}} has completed their AI interview for {{job_title}}.

Results:
- ATS Score: {{scores.ats}}/100
- Interview Score: {{scores.interview}}/100
- Combined: {{scores.combined}}/100
- Recommendation: {{interview.recommendation}}

Top strengths:
{{#each interview.strengths}}
- {{this}}
{{/each}}

Areas to explore in next round:
{{#each interview.follow_up_questions}}
- {{this}}
{{/each}}

View full assessment: {{dashboard_link}}

— Claimless`,
        },
      ],
    },
  },
  {
    id: "wf_calendar_interview_booking",
    name: "Auto-Book Interview After Screening Pass",
    description: "When a candidate passes screening, automatically book a follow-up interview with the hiring manager via Calendly/Cal.com",
    category: "automation_workflow",
    industries: [],
    tags: ["calendar", "booking", "auto-invite"],
    content: {
      trigger: "Claimless Webhook (candidate.screening_completed, passed=true)",
      steps: [
        {
          name: "Receive screening webhook",
          type: "Webhook Trigger",
          notes: "Filter for events where passed=true",
        },
        {
          name: "Check if auto-invite is disabled",
          type: "IF Condition",
          condition: "If Claimless auto-invite is ON, skip this workflow (Claimless handles it). Only use this if you want to add a manual interview step AFTER the AI interview.",
        },
        {
          name: "Send Calendly/Cal.com booking link",
          type: "Email",
          to: "{{candidate_email}}",
          subject: "Book your interview — {{job_title}}",
          body: "Hi {{candidate_name}}, you've passed our initial screening! Please book a time for a follow-up conversation: {{calendly_link}}",
        },
      ],
    },
  },
  {
    id: "wf_airtable_crm",
    name: "Sync Candidates to Airtable CRM",
    description: "Keep an Airtable base in sync with all candidate data and scores from Claimless",
    category: "automation_workflow",
    industries: [],
    tags: ["airtable", "crm", "sync"],
    content: {
      trigger: "Claimless Webhook (all events)",
      steps: [
        {
          name: "Receive any Claimless webhook",
          type: "Webhook Trigger",
          notes: "Subscribe to all events: applied, screening_completed, interview_completed, stage_changed, hired, rejected",
        },
        {
          name: "Find or create Airtable record",
          type: "Airtable",
          action: "Search by candidate_email, create if not found",
        },
        {
          name: "Update record with latest data",
          type: "Airtable",
          fields: {
            "Name": "{{candidate_name}}",
            "Email": "{{candidate_email}}",
            "Job": "{{job_title}}",
            "Stage": "{{event_type}}",
            "ATS Score": "{{match_score}}",
            "Passed": "{{passed}}",
            "Last Updated": "{{timestamp}}",
          },
        },
      ],
    },
  },
];
