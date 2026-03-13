// ============================================================
// ATS ADAPTER LAYER
// ============================================================
// Normalizes candidate + job data from external ATS providers
// into Claimless's internal format. Each adapter maps the
// provider's field names to our standard payload.
// ============================================================

export interface NormalizedCandidate {
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_username?: string;
  portfolio_url?: string;
  resume_text?: string;
  cover_letter?: string;
}

export interface NormalizedJob {
  external_job_id?: string;
  title: string;
  description?: string;
  employment_type?: string;
}

export interface NormalizedInboundPayload {
  candidate: NormalizedCandidate;
  job: NormalizedJob;
  external_candidate_id?: string;
  external_application_id?: string;
  custom_answers?: { question: string; answer: string }[];
  metadata?: Record<string, unknown>;
}

export type ATSProvider = "jobadder" | "bullhorn" | "vincere" | "generic";

// ────────────────────────────────────────────────────────
// GENERIC ADAPTER (Claimless standard format)
// ────────────────────────────────────────────────────────

function normalizeGeneric(
  payload: Record<string, unknown>
): NormalizedInboundPayload {
  const candidate = (payload.candidate || {}) as Record<string, unknown>;
  const job = (payload.job || {}) as Record<string, unknown>;

  return {
    candidate: {
      full_name: (candidate.full_name || candidate.name || "") as string,
      email: (candidate.email || "") as string,
      phone: (candidate.phone || candidate.mobile) as string | undefined,
      linkedin_url: (candidate.linkedin_url || candidate.linkedin) as string | undefined,
      github_username: (candidate.github_username || candidate.github) as string | undefined,
      portfolio_url: (candidate.portfolio_url || candidate.website) as string | undefined,
      resume_text: (candidate.resume_text || candidate.resume) as string | undefined,
      cover_letter: (candidate.cover_letter) as string | undefined,
    },
    job: {
      external_job_id: (job.id || job.external_id) as string | undefined,
      title: (job.title || "") as string,
      description: (job.description) as string | undefined,
      employment_type: (job.employment_type || job.type) as string | undefined,
    },
    external_candidate_id: (payload.external_candidate_id || candidate.id) as string | undefined,
    external_application_id: (payload.external_application_id) as string | undefined,
    custom_answers: payload.custom_answers as { question: string; answer: string }[] | undefined,
    metadata: payload.metadata as Record<string, unknown> | undefined,
  };
}

// ────────────────────────────────────────────────────────
// JOBADDER ADAPTER
// ────────────────────────────────────────────────────────
// JobAdder sends candidate data in their API format:
// https://api.jobadder.com/v2/candidates

function normalizeJobAdder(
  payload: Record<string, unknown>
): NormalizedInboundPayload {
  const candidate = (payload.candidate || payload) as Record<string, unknown>;
  const job = (payload.job || payload.requisition || {}) as Record<string, unknown>;

  // JobAdder splits name into firstName/lastName
  const firstName = (candidate.firstName || candidate.first_name || "") as string;
  const lastName = (candidate.lastName || candidate.last_name || "") as string;
  const fullName = `${firstName} ${lastName}`.trim();

  // JobAdder uses nested contact object
  const contact = (candidate.contact || {}) as Record<string, unknown>;
  const socials = (candidate.social || candidate.links || {}) as Record<string, unknown>;

  return {
    candidate: {
      full_name: fullName || (candidate.name as string) || "",
      email: (contact.email || candidate.email || "") as string,
      phone: (contact.phone || contact.mobile || candidate.phone) as string | undefined,
      linkedin_url: (socials.linkedin || candidate.linkedInUrl) as string | undefined,
      github_username: extractGithubUsername(socials.github as string | undefined),
      portfolio_url: (socials.website || candidate.website) as string | undefined,
      resume_text: (candidate.resumeText || candidate.resume_text) as string | undefined,
    },
    job: {
      external_job_id: (job.jobAdId || job.id) as string | undefined,
      title: (job.title || job.jobTitle || "") as string,
      description: (job.description || job.jobDescription) as string | undefined,
      employment_type: mapJobAdderEmploymentType(job.workType as string | undefined),
    },
    external_candidate_id: (candidate.candidateId || candidate.id) as string | undefined,
    external_application_id: (payload.applicationId || payload.application_id) as string | undefined,
    metadata: { source: "jobadder", raw_payload: payload },
  };
}

function mapJobAdderEmploymentType(workType?: string): string | undefined {
  if (!workType) return undefined;
  const map: Record<string, string> = {
    "Permanent": "full_time",
    "Full Time": "full_time",
    "Part Time": "part_time",
    "Contract": "contract",
    "Casual": "casual",
    "Temp": "contract",
    "Fixed Term": "contract",
  };
  return map[workType] || workType.toLowerCase().replace(/\s+/g, "_");
}

// ────────────────────────────────────────────────────────
// BULLHORN ADAPTER
// ────────────────────────────────────────────────────────
// Bullhorn REST API format:
// https://bullhorn.github.io/rest-api-docs/

function normalizeBullhorn(
  payload: Record<string, unknown>
): NormalizedInboundPayload {
  const candidate = (payload.candidate || payload) as Record<string, unknown>;
  const job = (payload.jobOrder || payload.job || {}) as Record<string, unknown>;
  const address = (candidate.address || {}) as Record<string, unknown>;

  const firstName = (candidate.firstName || "") as string;
  const lastName = (candidate.lastName || "") as string;

  return {
    candidate: {
      full_name: `${firstName} ${lastName}`.trim() || (candidate.name as string) || "",
      email: (candidate.email || candidate.email2) as string,
      phone: (candidate.phone || candidate.mobile || address?.phone) as string | undefined,
      linkedin_url: extractLinkedInUrl(candidate),
      github_username: extractGithubUsername(
        (candidate.customText1 as string) || (candidate.github as string)
      ),
      portfolio_url: (candidate.companyURL || candidate.website) as string | undefined,
      resume_text: (candidate.description || candidate.resumeText) as string | undefined,
    },
    job: {
      external_job_id: (job.id || job.jobOrderId) as string | undefined,
      title: (job.title || "") as string,
      description: (job.publicDescription || job.description) as string | undefined,
      employment_type: mapBullhornEmploymentType(job.employmentType as string | undefined),
    },
    external_candidate_id: (candidate.id || candidate.candidateId) as string | undefined,
    external_application_id: (payload.submissionId || payload.application_id) as string | undefined,
    metadata: { source: "bullhorn", raw_payload: payload },
  };
}

function mapBullhornEmploymentType(type?: string): string | undefined {
  if (!type) return undefined;
  const map: Record<string, string> = {
    "Permanent": "full_time",
    "Contract": "contract",
    "Part-Time": "part_time",
    "Temporary": "contract",
    "Temp to Perm": "contract",
    "Direct Hire": "full_time",
  };
  return map[type] || type.toLowerCase().replace(/[\s-]+/g, "_");
}

// ────────────────────────────────────────────────────────
// VINCERE ADAPTER
// ────────────────────────────────────────────────────────
// Vincere API format:
// https://api.vincere.io/docs

function normalizeVincere(
  payload: Record<string, unknown>
): NormalizedInboundPayload {
  const candidate = (payload.candidate || payload) as Record<string, unknown>;
  const job = (payload.position || payload.job || {}) as Record<string, unknown>;

  const firstName = (candidate.first_name || "") as string;
  const lastName = (candidate.last_name || "") as string;

  return {
    candidate: {
      full_name: `${firstName} ${lastName}`.trim() || (candidate.name as string) || "",
      email: (candidate.email || candidate.primary_email) as string,
      phone: (candidate.phone || candidate.mobile_phone) as string | undefined,
      linkedin_url: (candidate.linkedin || candidate.linkedin_url) as string | undefined,
      github_username: extractGithubUsername(candidate.github as string | undefined),
      portfolio_url: (candidate.website || candidate.portfolio_url) as string | undefined,
      resume_text: (candidate.resume_text || candidate.summary) as string | undefined,
    },
    job: {
      external_job_id: (job.id || job.position_id) as string | undefined,
      title: (job.title || job.position_title || "") as string,
      description: (job.description || job.job_description) as string | undefined,
      employment_type: (job.employment_type || job.contract_type) as string | undefined,
    },
    external_candidate_id: (candidate.id || candidate.candidate_id) as string | undefined,
    external_application_id: (payload.application_id) as string | undefined,
    metadata: { source: "vincere", raw_payload: payload },
  };
}

// ────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────

function extractGithubUsername(input?: string): string | undefined {
  if (!input) return undefined;
  // Handle full URL: https://github.com/username
  const match = input.match(/github\.com\/([a-zA-Z0-9-]+)/);
  if (match) return match[1];
  // Handle raw username (strip @)
  return input.replace(/^@/, "").trim() || undefined;
}

function extractLinkedInUrl(candidate: Record<string, unknown>): string | undefined {
  // Bullhorn stores LinkedIn in various custom fields
  for (const field of ["linkedInProfileUrl", "linkedin", "customText2", "linkedInUrl"]) {
    const val = candidate[field] as string | undefined;
    if (val && val.includes("linkedin")) return val;
  }
  return undefined;
}

// ────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ────────────────────────────────────────────────────────

const ADAPTERS: Record<ATSProvider, (payload: Record<string, unknown>) => NormalizedInboundPayload> = {
  generic: normalizeGeneric,
  jobadder: normalizeJobAdder,
  bullhorn: normalizeBullhorn,
  vincere: normalizeVincere,
};

/**
 * Normalize an inbound ATS payload using the appropriate adapter.
 * Optionally accepts custom field_mapping overrides from the integration config.
 */
export function normalizeATSPayload(
  provider: ATSProvider,
  payload: Record<string, unknown>,
  fieldMapping?: Record<string, string> | null
): NormalizedInboundPayload {
  // First, apply custom field mapping if provided
  const mappedPayload = fieldMapping
    ? applyFieldMapping(payload, fieldMapping)
    : payload;

  const adapter = ADAPTERS[provider] || ADAPTERS.generic;
  const normalized = adapter(mappedPayload);

  // Validate minimum required fields
  if (!normalized.candidate.email) {
    throw new Error("Candidate email is required");
  }
  if (!normalized.candidate.full_name) {
    throw new Error("Candidate name is required");
  }

  return normalized;
}

/**
 * Apply custom field mapping: { "our_field": "their.nested.field" }
 * Supports dot-notation for nested access.
 */
function applyFieldMapping(
  payload: Record<string, unknown>,
  mapping: Record<string, string>
): Record<string, unknown> {
  const result = { ...payload };
  const candidate = { ...((payload.candidate || {}) as Record<string, unknown>) };
  const job = { ...((payload.job || {}) as Record<string, unknown>) };

  for (const [targetField, sourceField] of Object.entries(mapping)) {
    const value = getNestedValue(payload, sourceField);
    if (value === undefined) continue;

    if (targetField.startsWith("candidate.")) {
      candidate[targetField.replace("candidate.", "")] = value;
    } else if (targetField.startsWith("job.")) {
      job[targetField.replace("job.", "")] = value;
    } else {
      result[targetField] = value;
    }
  }

  result.candidate = candidate;
  result.job = job;
  return result;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
