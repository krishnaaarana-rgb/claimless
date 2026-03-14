import type { Template } from "../types";

export const API_WEBHOOK_TEMPLATES: Template[] = [
  {
    id: "api_inbound_generic",
    name: "Inbound: Generic Candidate Submission",
    description: "Push a candidate to Claimless from any system",
    category: "api_payload",
    industries: [],
    tags: ["inbound", "generic", "candidate"],
    content: {
      method: "POST",
      endpoint: "/api/v1/inbound",
      headers: {
        Authorization: "Bearer clm_your_api_key",
        "Content-Type": "application/json",
      },
      body: {
        candidate: {
          full_name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+61412345678",
          linkedin_url: "https://linkedin.com/in/janesmith",
          portfolio_url: "https://janesmith.dev",
          resume_text: "Full resume text here...",
          cover_letter: "Optional cover letter...",
        },
        job_id: "uuid-of-the-job",
        source: "your_system_name",
      },
      curl: `curl -X POST https://your-app.claimless.com/api/v1/inbound \\
  -H "Authorization: Bearer clm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "candidate": {
      "full_name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+61412345678",
      "resume_text": "Full resume text..."
    },
    "job_id": "uuid-of-the-job"
  }'`,
      response: {
        success: true,
        application_id: "uuid",
        candidate_id: "uuid",
        job_id: "uuid",
        job_title: "Senior Engineer",
        message: "Candidate submitted. ATS screening completed.",
      },
    },
  },
  {
    id: "api_inbound_jobadder",
    name: "Inbound: JobAdder Format",
    description: "Push a candidate using JobAdder's field naming convention",
    category: "api_payload",
    industries: [],
    tags: ["inbound", "jobadder", "ats"],
    content: {
      method: "POST",
      endpoint: "/api/v1/inbound",
      headers: {
        Authorization: "Bearer clm_your_api_key",
        "Content-Type": "application/json",
        "X-ATS-Provider": "jobadder",
      },
      body: {
        candidate: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          mobile: "+61412345678",
          social: { linkedin: "https://linkedin.com/in/janesmith" },
          candidateId: "JA-12345",
        },
        job_id: "uuid-of-the-job",
      },
      curl: `curl -X POST https://your-app.claimless.com/api/v1/inbound \\
  -H "Authorization: Bearer clm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -H "X-ATS-Provider: jobadder" \\
  -d '{
    "candidate": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "mobile": "+61412345678",
      "candidateId": "JA-12345"
    },
    "job_id": "uuid-of-the-job"
  }'`,
    },
  },
  {
    id: "api_inbound_bullhorn",
    name: "Inbound: Bullhorn Format",
    description: "Push a candidate using Bullhorn's field naming convention",
    category: "api_payload",
    industries: [],
    tags: ["inbound", "bullhorn", "ats"],
    content: {
      method: "POST",
      endpoint: "/api/v1/inbound",
      headers: {
        Authorization: "Bearer clm_your_api_key",
        "Content-Type": "application/json",
        "X-ATS-Provider": "bullhorn",
      },
      body: {
        candidate: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+61412345678",
          linkedInProfileUrl: "https://linkedin.com/in/janesmith",
          externalID: "BH-67890",
          description: "Full resume text here...",
        },
        job_id: "uuid-of-the-job",
      },
      curl: `curl -X POST https://your-app.claimless.com/api/v1/inbound \\
  -H "Authorization: Bearer clm_your_api_key" \\
  -H "Content-Type: application/json" \\
  -H "X-ATS-Provider: bullhorn" \\
  -d '{
    "candidate": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "externalID": "BH-67890",
      "description": "Full resume text..."
    },
    "job_id": "uuid-of-the-job"
  }'`,
    },
  },
  {
    id: "api_inbound_vincere",
    name: "Inbound: Vincere Format",
    description: "Push a candidate using Vincere's field naming convention",
    category: "api_payload",
    industries: [],
    tags: ["inbound", "vincere", "ats"],
    content: {
      method: "POST",
      endpoint: "/api/v1/inbound",
      headers: {
        Authorization: "Bearer clm_your_api_key",
        "Content-Type": "application/json",
        "X-ATS-Provider": "vincere",
      },
      body: {
        candidate: {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          phone: "+61412345678",
          linkedin: "https://linkedin.com/in/janesmith",
          candidate_source: "Website",
          original_id: "VIN-54321",
        },
        job_id: "uuid-of-the-job",
      },
    },
  },
  {
    id: "api_results",
    name: "Get Candidate Results",
    description: "Fetch full screening and interview results for a candidate",
    category: "api_payload",
    industries: [],
    tags: ["results", "scores", "get"],
    content: {
      method: "GET",
      endpoint: "/api/v1/results/{application_id}",
      headers: {
        Authorization: "Bearer clm_your_api_key",
      },
      curl: `curl https://your-app.claimless.com/api/v1/results/APPLICATION_ID \\
  -H "Authorization: Bearer clm_your_api_key"`,
      response: {
        application_id: "uuid",
        stage: "stage_1_passed",
        scores: { ats: 72, interview: 85, combined: 80 },
        screening: {
          match_score: 72,
          recommendation: "pass",
          summary: "Strong candidate with relevant experience...",
          strengths: ["5+ years relevant experience", "Strong technical skills"],
          concerns: ["Limited team leadership experience"],
          consistency_flags: [],
        },
        interview: {
          recommendation: "hire",
          overall_score: 85,
          strengths: ["Handled live scenarios confidently"],
          skill_assessments: [
            { skill: "Node.js", assessed_level: "advanced", score: 88, evidence: "..." },
          ],
        },
      },
    },
  },
  {
    id: "api_webhook_events",
    name: "Webhook Events Reference",
    description: "All webhook events fired by Claimless with example payloads",
    category: "api_payload",
    industries: [],
    tags: ["webhook", "events", "reference"],
    content: {
      events: {
        "candidate.applied": {
          description: "Fired when a new application is submitted",
          payload: {
            application_id: "uuid",
            candidate_id: "uuid",
            candidate_name: "Jane Smith",
            candidate_email: "jane@example.com",
            job_id: "uuid",
            job_title: "Senior Engineer",
          },
        },
        "candidate.screening_completed": {
          description: "Fired when ATS screening finishes",
          payload: {
            application_id: "uuid",
            candidate_name: "Jane Smith",
            job_title: "Senior Engineer",
            match_score: 72,
            recommendation: "pass",
            passed: true,
            summary: "Strong match with relevant experience",
          },
        },
        "candidate.interview_completed": {
          description: "Fired when AI interview is complete and scored",
          payload: {
            application_id: "uuid",
            candidate_name: "Jane Smith",
            job_title: "Senior Engineer",
            duration_seconds: 920,
            recording_url: "https://...",
          },
        },
        "candidate.stage_changed": {
          description: "Fired when a candidate's stage is manually changed",
          payload: {
            application_id: "uuid",
            candidate_name: "Jane Smith",
            new_stage: "hired",
            previous_stage: "interview_completed",
          },
        },
        "candidate.rejected": {
          description: "Fired when a candidate is rejected (auto or manual)",
          payload: {
            application_id: "uuid",
            candidate_name: "Jane Smith",
            reason: "ATS screening: Below threshold",
            source: "ats_auto_reject",
          },
        },
        "candidate.hired": {
          description: "Fired when a candidate is moved to hired stage",
          payload: {
            application_id: "uuid",
            candidate_name: "Jane Smith",
            job_title: "Senior Engineer",
          },
        },
      },
    },
  },
];
