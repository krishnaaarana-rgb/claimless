"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Play, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import Link from "next/link";

const SAMPLE_PAYLOADS: Record<string, object> = {
  generic: {
    candidate: {
      full_name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+61 412 345 678",
      linkedin_url: "https://linkedin.com/in/janesmith",
      github_username: "janesmith",
      portfolio_url: "https://janesmith.dev",
      resume_text:
        "Senior Software Engineer with 6 years experience in React, Node.js, and AWS. Led migration of monolithic Rails app to microservices at Canva. Built real-time collaboration features serving 2M+ users. Strong in TypeScript, PostgreSQL, and system design. Previously at Atlassian working on Jira Cloud performance optimizations.",
    },
    job: {
      title: "Senior Engineer",
    },
    external_candidate_id: "TEST-001",
  },
  jobadder: {
    candidate: {
      firstName: "Marcus",
      lastName: "Chen",
      contact: {
        email: "marcus.chen@example.com",
        phone: "+61 400 111 222",
        mobile: "+61 400 111 222",
      },
      social: {
        linkedin: "https://linkedin.com/in/marcuschen",
        github: "https://github.com/marcuschen",
        website: "https://marcuschen.io",
      },
      resumeText:
        "Data Engineer with 4 years experience. Built ETL pipelines processing 50TB/day at Commonwealth Bank. Expert in Python, Spark, Airflow, and dbt. AWS certified. Experience with Snowflake and BigQuery. Built internal data quality framework adopted across 3 business units.",
      candidateId: "JA-54321",
    },
    job: {
      title: "Data Engineer",
      jobAdId: "JA-JOB-100",
      workType: "Permanent",
    },
    applicationId: "JA-APP-200",
  },
  bullhorn: {
    candidate: {
      firstName: "Sarah",
      lastName: "O'Connor",
      email: "sarah.oconnor@example.com",
      phone: "+61 433 555 777",
      linkedInProfileUrl: "https://linkedin.com/in/sarahoconnor",
      customText1: "sarahoconnor-dev",
      companyURL: "https://sarahoconnor.design",
      description:
        "UX/UI Designer with 5 years experience. Redesigned patient portal for Medibank reducing support tickets by 40%. Expertise in Figma, user research, accessibility (WCAG AA), and design systems. Previously at REA Group designing property search experience for 12M monthly users.",
      id: "BH-98765",
    },
    jobOrder: {
      title: "UX Designer",
      id: "BH-JOB-50",
      employmentType: "Contract",
      publicDescription: "Looking for a senior UX designer...",
    },
    submissionId: "BH-SUB-300",
  },
  vincere: {
    candidate: {
      first_name: "Tom",
      last_name: "Nguyen",
      email: "tom.nguyen@example.com",
      phone: "+61 422 888 999",
      linkedin: "https://linkedin.com/in/tomnguyen",
      github: "tomnguyen",
      website: "https://tomnguyen.au",
      summary:
        "DevOps Engineer with 3 years experience. Managed Kubernetes clusters at Xero serving 3.5M subscribers. Built CI/CD pipelines reducing deploy time from 45min to 8min. Strong in Terraform, AWS, Docker, and GitHub Actions. Implemented zero-downtime deployment strategy.",
      candidate_id: "VC-11111",
    },
    position: {
      title: "DevOps Engineer",
      position_id: "VC-POS-75",
      employment_type: "full_time",
    },
  },
};

export default function TestATSPage() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<string>("generic");
  const [jobId, setJobId] = useState("");
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_PAYLOADS.generic, null, 2));
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  // Fetch active jobs for the dropdown
  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs || []).filter((j: { status: string }) => j.status === "active")))
      .catch(() => {});
  }, []);

  // Update payload when provider changes
  useEffect(() => {
    setPayload(JSON.stringify(SAMPLE_PAYLOADS[provider] || SAMPLE_PAYLOADS.generic, null, 2));
  }, [provider]);

  const sendTest = async () => {
    if (!apiKey.trim()) {
      setResponse("Error: Enter your API key first");
      setStatus(401);
      return;
    }

    setLoading(true);
    setResponse(null);
    setStatus(null);

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        setResponse("Error: Invalid JSON in payload");
        setStatus(400);
        setLoading(false);
        return;
      }

      const url = `/api/v1/inbound?provider=${provider}${jobId ? `&job_id=${jobId}` : ""}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setStatus(res.status);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
      setStatus(0);
    }

    setLoading(false);
  };

  const curlCommand = `curl -X POST "${typeof window !== "undefined" ? window.location.origin : "https://claimless.vercel.app"}/api/v1/inbound?provider=${provider}${jobId ? `&job_id=${jobId}` : ""}" \\
  -H "Authorization: Bearer ${apiKey || "clm_your_api_key"}" \\
  -H "Content-Type: application/json" \\
  -d '${payload.replace(/'/g, "'\\''")}'`;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 text-[12px] text-[#9B9A97] hover:text-[#37352F] mb-3"
        >
          <ArrowLeft size={12} /> Back to Integrations
        </Link>
        <h1 className="text-xl font-semibold text-[#37352F]">Test ATS Inbound API</h1>
        <p className="text-[13px] text-[#9B9A97] mt-1">
          Simulate pushing a candidate from an external ATS. Uses sample payloads for each provider format.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-[12px] font-medium text-[#37352F] mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="clm_..."
              className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
            />
            <p className="text-[11px] text-[#9B9A97] mt-1">
              Create one at{" "}
              <Link href="/integrations" className="text-[#2383E2] hover:underline">
                Integrations
              </Link>
            </p>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-[12px] font-medium text-[#37352F] mb-1">ATS Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {["generic", "jobadder", "bullhorn", "vincere"].map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-2 rounded-md text-[12px] font-medium border transition-colors ${
                    provider === p
                      ? "border-[#2383E2] bg-blue-50 text-[#2383E2]"
                      : "border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3]"
                  }`}
                >
                  {p === "generic" ? "Generic" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Job */}
          <div>
            <label className="block text-[12px] font-medium text-[#37352F] mb-1">
              Target Job <span className="text-[#9B9A97]">(or matched by title)</span>
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
            >
              <option value="">Auto-match by title</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Send button */}
          <button
            onClick={sendTest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white disabled:opacity-50 transition-colors"
            style={{ background: "#2383E2" }}
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Play size={14} /> Send Test Candidate
              </>
            )}
          </button>

          {/* cURL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-[#9B9A97]">cURL equivalent</label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlCommand);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-[#9B9A97] hover:text-[#37352F]"
              >
                {copied ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="bg-[#F7F6F3] rounded-md p-3 text-[11px] font-mono text-[#37352F] overflow-x-auto max-h-32 whitespace-pre-wrap break-all">
              {curlCommand}
            </pre>
          </div>
        </div>

        {/* Right: Payload + Response */}
        <div className="space-y-4">
          {/* Payload editor */}
          <div>
            <label className="block text-[12px] font-medium text-[#37352F] mb-1">
              Request Payload
              <span className="text-[#9B9A97] font-normal ml-1">({provider} format)</span>
            </label>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] resize-none"
              spellCheck={false}
            />
          </div>

          {/* Response */}
          {response && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-[12px] font-medium text-[#37352F]">Response</label>
                {status !== null && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      status >= 200 && status < 300
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {status >= 200 && status < 300 ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <XCircle size={10} />
                    )}
                    {status}
                  </span>
                )}
              </div>
              <pre className="bg-[#F7F6F3] rounded-md p-3 text-[12px] font-mono text-[#37352F] overflow-x-auto max-h-64 whitespace-pre-wrap">
                {response}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
