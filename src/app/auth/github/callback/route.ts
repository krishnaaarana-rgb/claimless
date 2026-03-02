import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/onboard?error=github_denied", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
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
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("[GitHub OAuth] Token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL("/onboard?error=token_failed", request.url)
      );
    }

    // Fetch GitHub user profile using their token
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResponse.json();

    // Store candidate in Supabase
    const supabase = createAdminClient();

    // Check if candidate already exists
    const { data: existingCandidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("github_username", githubUser.login)
      .single();

    let candidateId: string;

    if (existingCandidate) {
      candidateId = existingCandidate.id;
      await supabase
        .from("candidates")
        .update({
          full_name: githubUser.name || githubUser.login,
          email: githubUser.email,
          personal_website_url: githubUser.blog || null,
          location: githubUser.location || null,
          github_access_token: tokenData.access_token,
        })
        .eq("id", candidateId);
    } else {
      const { data: newCandidate, error: insertError } = await supabase
        .from("candidates")
        .insert({
          github_username: githubUser.login,
          full_name: githubUser.name || githubUser.login,
          email: githubUser.email,
          personal_website_url: githubUser.blog || null,
          location: githubUser.location || null,
          github_access_token: tokenData.access_token,
        })
        .select("id")
        .single();

      if (insertError || !newCandidate) {
        console.error("[GitHub OAuth] Candidate insert failed:", insertError);
        return NextResponse.redirect(
          new URL("/onboard?error=save_failed", request.url)
        );
      }

      candidateId = newCandidate.id;
    }

    // Redirect to processing page
    return NextResponse.redirect(
      new URL(
        `/onboard/processing?candidate_id=${candidateId}&github_username=${githubUser.login}`,
        request.url
      )
    );
  } catch (err) {
    console.error("[GitHub OAuth] Error:", err);
    return NextResponse.redirect(
      new URL("/onboard?error=server_error", request.url)
    );
  }
}
