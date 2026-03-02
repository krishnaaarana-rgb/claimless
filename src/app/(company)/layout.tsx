"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  UserCog,
  Plug,
  LogOut,
} from "lucide-react";
import { ToastProvider } from "@/components/toast";

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/candidates", label: "Candidates", icon: Users },
      { href: "/jobs", label: "Jobs", icon: Briefcase },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/integrations", label: "Integrations", icon: Plug },
      { href: "/team", label: "Team", icon: UserCog },
    ],
  },
];

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name ?? null);
      }
    });
    // Fetch candidate count for sidebar badge
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setCandidateCount(d.total_candidates ?? null))
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail
      ? userEmail[0].toUpperCase()
      : "?";

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: "#1A1A1A" }}>
          {/* Logo */}
          <div className="px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[15px] font-semibold text-white tracking-tight">
                Claimless
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mt-6 first:mt-2">
                <div
                  className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.05em]"
                  style={{ color: "#6B7280" }}
                >
                  {section.label}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                          isActive
                            ? "text-white"
                            : "hover:bg-[#232323]"
                        }`}
                        style={
                          isActive
                            ? {
                                background: "#2A2A2A",
                                borderLeft: "2px solid #D97706",
                                paddingLeft: "10px",
                                color: "#FFFFFF",
                              }
                            : { color: "#A8A29E" }
                        }
                      >
                        <Icon size={16} strokeWidth={1.8} />
                        <span className="flex-1">{item.label}</span>
                        {item.label === "Candidates" && candidateCount != null && candidateCount > 0 && (
                          <span
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded-full leading-none"
                            style={{ background: "#E7E5E4", color: "#78716C" }}
                          >
                            {candidateCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User card */}
          <div className="px-3 py-4" style={{ borderTop: "1px solid #2A2A2A" }}>
            {userEmail ? (
              <div className="flex items-center gap-3 px-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                  style={{ background: "#D97706" }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">
                    {userName || userEmail}
                  </div>
                  {userName && (
                    <div className="text-[11px] truncate" style={{ color: "#78716C" }}>
                      {userEmail}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-1 rounded hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
                  title="Sign out"
                >
                  <LogOut size={14} style={{ color: "#78716C" }} />
                </button>
              </div>
            ) : (
              <div className="px-2 text-[11px]" style={{ color: "#78716C" }}>
                Claimless v0.1
              </div>
            )}
          </div>
        </aside>

        {/* Content area */}
        <main className="flex-1 min-w-0" style={{ background: "#FAFAF9" }}>
          <div className="px-10 py-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
