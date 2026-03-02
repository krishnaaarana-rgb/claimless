import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCompanyAndRole(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("company_users")
    .select("company_id, role")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getCompanyAndRole(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const admin = createAdminClient();

  // Get team members
  const { data: members } = await admin
    .from("company_users")
    .select("id, user_id, role, email, full_name, created_at")
    .eq("company_id", membership.company_id)
    .order("created_at", { ascending: true });

  // Get pending invites
  const { data: invites } = await admin
    .from("team_invites")
    .select("id, email, role, status, created_at, expires_at")
    .eq("company_id", membership.company_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    members: members || [],
    invites: invites || [],
    current_user_role: membership.role,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getCompanyAndRole(user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only owners and admins can invite members" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (role && !["admin", "member"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be admin or member" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Check if already a member
  const { data: existingMember } = await admin
    .from("company_users")
    .select("id")
    .eq("company_id", membership.company_id)
    .eq("email", email.trim().toLowerCase())
    .single();

  if (existingMember) {
    return NextResponse.json(
      { error: "This person is already a team member" },
      { status: 409 }
    );
  }

  // Upsert invite (replaces expired ones)
  const { data: invite, error } = await admin
    .from("team_invites")
    .upsert(
      {
        company_id: membership.company_id,
        email: email.trim().toLowerCase(),
        role: role || "member",
        invited_by: user.id,
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      { onConflict: "company_id,email" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("[team] Invite error:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invite });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getCompanyAndRole(user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json(
      { error: "Only owners and admins can remove members" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const admin = createAdminClient();

  if (body.invite_id) {
    // Cancel invite
    await admin
      .from("team_invites")
      .delete()
      .eq("id", body.invite_id)
      .eq("company_id", membership.company_id);
    return NextResponse.json({ success: true });
  }

  if (body.user_id) {
    // Check we're not removing the owner
    const { data: target } = await admin
      .from("company_users")
      .select("role")
      .eq("user_id", body.user_id)
      .eq("company_id", membership.company_id)
      .single();

    if (!target) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    if (target.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the owner" },
        { status: 403 }
      );
    }

    await admin
      .from("company_users")
      .delete()
      .eq("user_id", body.user_id)
      .eq("company_id", membership.company_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Provide user_id or invite_id" },
    { status: 400 }
  );
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getCompanyAndRole(user.id);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json(
      { error: "Only the owner can change roles" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { user_id, role } = body;

  if (!user_id || !role) {
    return NextResponse.json(
      { error: "user_id and role are required" },
      { status: 400 }
    );
  }

  if (!["admin", "member", "viewer"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Don't allow changing owner role
  const { data: target } = await admin
    .from("company_users")
    .select("role")
    .eq("user_id", user_id)
    .eq("company_id", membership.company_id)
    .single();

  if (!target) {
    return NextResponse.json(
      { error: "Member not found" },
      { status: 404 }
    );
  }

  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 403 }
    );
  }

  const { error } = await admin
    .from("company_users")
    .update({ role })
    .eq("user_id", user_id)
    .eq("company_id", membership.company_id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
