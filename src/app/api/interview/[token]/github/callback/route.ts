import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const interviewUrl = `${baseUrl}/interview/${token}`;

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  // Verify state matches token
  if (!code || state !== token) {
    return NextResponse.redirect(interviewUrl);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/api/interview/${token}/github/callback`,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[github-oauth] No access token:", tokenData);
      return NextResponse.redirect(interviewUrl);
    }

    // Fetch GitHub user profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const githubUser = await userRes.json();
    if (!githubUser.login) {
      console.error("[github-oauth] No login in user data:", githubUser);
      return NextResponse.redirect(interviewUrl);
    }

    // Save github_username to candidate via the interview token
    const supabase = createAdminClient();

    const { data: interviewToken } = await supabase
      .from("interview_tokens")
      .select("application_id")
      .eq("token", token)
      .single();

    if (interviewToken) {
      const { data: app } = await supabase
        .from("applications")
        .select("candidate_id")
        .eq("id", interviewToken.application_id)
        .single();

      if (app) {
        await supabase
          .from("candidates")
          .update({ github_username: githubUser.login })
          .eq("id", app.candidate_id);
      }
    }

    return NextResponse.redirect(interviewUrl);
  } catch (err) {
    console.error("[github-oauth] Error:", err);
    return NextResponse.redirect(interviewUrl);
  }
}
