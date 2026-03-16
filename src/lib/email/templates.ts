interface TemplateVars {
  candidate_name: string;
  job_title: string;
  company_name: string;
  interview_link?: string;
}

// Replace {{variable}} placeholders with actual values
export function renderTemplate(template: string, vars: TemplateVars): string {
  let result = template;
  result = result.replace(/\{\{candidate_name\}\}/g, vars.candidate_name);
  result = result.replace(/\{\{job_title\}\}/g, vars.job_title);
  result = result.replace(/\{\{company_name\}\}/g, vars.company_name);
  result = result.replace(
    /\{\{interview_link\}\}/g,
    vars.interview_link || "#"
  );
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

  const logoHtml = options?.logoUrl
    ? `<div style="margin-bottom: 24px;"><img src="${options.logoUrl}" alt="${options.companyName || ""}" style="max-height: 40px; max-width: 200px;" /></div>`
    : options?.companyName
      ? `<div style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: ${options.accentColor || "#1C1917"};">${options.companyName}</div>`
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
