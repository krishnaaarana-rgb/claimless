"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  MoreHorizontal,
  X,
  Shield,
  ShieldCheck,
  Crown,
  Eye,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; icon: typeof Crown; color: string; bg: string }
> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "#D97706",
    bg: "#FEF3C7",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  member: {
    label: "Member",
    icon: Shield,
    color: "#059669",
    bg: "#D1FAE5",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "#6B7280",
    bg: "#F3F4F6",
  },
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function timeUntil(date: string): string {
  const seconds = Math.floor(
    (new Date(date).getTime() - Date.now()) / 1000
  );
  if (seconds <= 0) return "expired";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m left`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h left`;
  return `${Math.floor(seconds / 86400)}d left`;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const canManage = currentRole === "owner" || currentRole === "admin";
  const isOwner = currentRole === "owner";

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setInvites(data.invites || []);
        setCurrentRole(data.current_user_role || "");
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || "Failed to send invite");
        return;
      }
      setInviteEmail("");
      setInviteRole("member");
      setShowInvite(false);
      fetchTeam();
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    fetchTeam();
  };

  const handleCancelInvite = async (inviteId: string) => {
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_id: inviteId }),
    });
    fetchTeam();
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    });
    setMenuOpen(null);
    fetchTeam();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Team</h1>
        <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Team</h1>
          <p className="text-[13px] text-stone-500 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {invites.length > 0 &&
              ` · ${invites.length} pending invite${invites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setShowInvite(true);
              setInviteError("");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#D97706" }}
          >
            <UserPlus size={14} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border border-stone-200">
        <div className="px-5 py-3 border-b border-stone-100">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Members
          </span>
        </div>
        <div>
          {members.map((member, i) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
            const RoleIcon = roleConfig.icon;
            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{
                  borderBottom:
                    i < members.length - 1 ? "1px solid #F5F5F4" : "none",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                  style={{
                    background: roleConfig.bg,
                    color: roleConfig.color,
                  }}
                >
                  {getInitials(member.full_name, member.email)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-stone-900 truncate">
                      {member.full_name || member.email}
                    </span>
                  </div>
                  <span className="text-[12px] text-stone-400 truncate block">
                    {member.email}
                  </span>
                </div>

                {/* Role Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                  style={{
                    background: roleConfig.bg,
                    color: roleConfig.color,
                  }}
                >
                  <RoleIcon size={11} />
                  {roleConfig.label}
                </div>

                {/* Joined */}
                <span className="text-[12px] text-stone-400 shrink-0 w-16 text-right">
                  {timeAgo(member.created_at)}
                </span>

                {/* Actions */}
                <div className="w-8 shrink-0 relative">
                  {canManage && member.role !== "owner" ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(
                            menuOpen === member.user_id
                              ? null
                              : member.user_id
                          );
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {menuOpen === member.user_id && (
                        <div
                          className="absolute right-0 top-9 w-44 bg-white rounded-lg border border-stone-200 shadow-lg py-1 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isOwner && (
                            <>
                              <div className="px-3 py-1.5 text-[11px] text-stone-400 font-medium">
                                Change role
                              </div>
                              {["admin", "member", "viewer"]
                                .filter((r) => r !== member.role)
                                .map((r) => {
                                  const rc = ROLE_CONFIG[r];
                                  const Icon = rc.icon;
                                  return (
                                    <button
                                      key={r}
                                      onClick={() =>
                                        handleChangeRole(member.user_id, r)
                                      }
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-stone-700 hover:bg-stone-50 transition-colors"
                                    >
                                      <ArrowUpDown
                                        size={12}
                                        className="text-stone-400"
                                      />
                                      <Icon size={12} style={{ color: rc.color }} />
                                      {rc.label}
                                    </button>
                                  );
                                })}
                              <div className="border-t border-stone-100 my-1" />
                            </>
                          )}
                          <button
                            onClick={() =>
                              handleRemoveMember(member.user_id)
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="px-5 py-8 text-center text-[13px] text-stone-400">
              No team members yet.
            </div>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200">
          <div className="px-5 py-3 border-b border-stone-100">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Pending Invites
            </span>
          </div>
          <div>
            {invites.map((invite, i) => {
              const roleConfig =
                ROLE_CONFIG[invite.role] || ROLE_CONFIG.member;
              const RoleIcon = roleConfig.icon;
              const expired =
                new Date(invite.expires_at).getTime() < Date.now();
              return (
                <div
                  key={invite.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{
                    borderBottom:
                      i < invites.length - 1 ? "1px solid #F5F5F4" : "none",
                  }}
                >
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-[12px] font-semibold text-stone-400 shrink-0">
                    {invite.email.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] text-stone-700 truncate block">
                      {invite.email}
                    </span>
                    <span
                      className={`text-[12px] ${expired ? "text-red-400" : "text-stone-400"}`}
                    >
                      {expired
                        ? "Expired"
                        : `Expires ${timeUntil(invite.expires_at)}`}
                      {" · Sent "}
                      {timeAgo(invite.created_at)}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                    style={{
                      background: roleConfig.bg,
                      color: roleConfig.color,
                    }}
                  >
                    <RoleIcon size={11} />
                    {roleConfig.label}
                  </div>

                  {/* Cancel */}
                  {canManage && (
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-[12px] text-stone-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note about email */}
      <p className="text-[12px] text-stone-400">
        Invite notifications require an email provider configured in{" "}
        <a href="/settings" className="text-amber-600 hover:text-amber-700">
          Settings → Email Provider
        </a>
        .
      </p>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowInvite(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl border border-stone-200 shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold text-stone-900">
                Invite Team Member
              </h2>
              <button
                onClick={() => setShowInvite(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError("");
                  }}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="colleague@company.com"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInvite();
                  }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-[14px] text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="member">Member — can view and manage candidates</option>
                  <option value="admin">Admin — can also manage team and settings</option>
                </select>
              </div>

              {inviteError && (
                <p className="text-[13px] text-red-500">{inviteError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#D97706" }}
                >
                  {inviting ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
