import { Resend } from "resend";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

export async function sendEmail(
  input: SendEmailInput,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = new Resend(apiKey);

    const fromAddress = input.from
      ? `${input.fromName || "Claimless"} <${input.from}>`
      : "Claimless <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("[email] Sent to:", input.to, "subject:", input.subject);
    return { success: true };
  } catch (error) {
    console.error(
      "[email] Failed:",
      error instanceof Error ? error.message : error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
