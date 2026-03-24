interface TemplateVars {
  candidate_name: string;
  job_title: string;
  company_name: string;
  interview_link?: string;
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip {{...}} patterns from a value to prevent template variable injection */
function sanitizeTemplateValue(value: string): string {
  return value.replace(/\{\{.*?\}\}/g, "");
}

// Replace {{variable}} placeholders with actual values
export function renderTemplate(template: string, vars: TemplateVars): string {
  let result = template;
  const safeName = sanitizeTemplateValue(vars.candidate_name);
  const safeTitle = sanitizeTemplateValue(vars.job_title);
  const safeCompany = sanitizeTemplateValue(vars.company_name);
  const safeLink = sanitizeTemplateValue(vars.interview_link || "#");

  result = result.replace(/\{\{candidate_name\}\}/g, safeName);
  result = result.replace(/\{\{job_title\}\}/g, safeTitle);
  result = result.replace(/\{\{company_name\}\}/g, safeCompany);
  result = result.replace(/\{\{interview_link\}\}/g, safeLink);
  return result;
}

// Convert plain text template to branded HTML email
export function textToHtml(
  text: string,
  options?: { logoUrl?: string; accentColor?: string; companyName?: string }
): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const paragraphs = escaped
    .split("\n\n")
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; line-height: 1.6;">${p.replace(/\n/g, "<br>")}</p>`
    )
    .join("");

  const safeLogoUrl = options?.logoUrl ? escapeHtml(options.logoUrl) : "";
  const safeCompanyName = options?.companyName
    ? escapeHtml(options.companyName)
    : "";

  const logoHtml = options?.logoUrl
    ? `<div style="margin-bottom: 24px;"><img src="${safeLogoUrl}" alt="${safeCompanyName}" style="max-height: 40px; max-width: 200px;" /></div>`
    : options?.companyName
      ? `<div style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: ${options.accentColor || "#1C1917"};">${safeCompanyName}</div>`
      : "";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1C1917;">
      ${logoHtml}
      ${paragraphs}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E9E9E7; font-size: 12px; color: #9B9A97;">
        Powered by Claimless
      </div>
    </div>
  `;
}
