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

// Convert plain text template to simple HTML email
export function textToHtml(text: string): string {
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

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1C1917;">
      ${paragraphs}
    </div>
  `;
}
