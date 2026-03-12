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
  const [expanded, setExpanded] = useState(false);

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
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className="flex-shrink-0 flex flex-col fixed top-0 left-0 h-screen z-30"
          style={{
            background: "#F7F6F3",
            width: expanded ? 220 : 48,
            transition: "width 200ms ease-in-out",
          }}
        >
          {/* Logo */}
          <div className="py-5 flex items-center" style={{ paddingLeft: expanded ? 20 : 0, justifyContent: expanded ? "flex-start" : "center", transition: "padding 200ms ease-in-out" }}>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span
                className="text-[15px] font-semibold text-[#37352F] tracking-tight whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  width: expanded ? "auto" : 0,
                  overflow: "hidden",
                  transition: "opacity 200ms ease-in-out",
                }}
              >
                Claimless
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mt-6 first:mt-2">
                {/* Section label */}
                <div
                  className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.05em] whitespace-nowrap"
                  style={{
                    color: "#9B9A97",
                    opacity: expanded ? 1 : 0,
                    height: expanded ? "auto" : 0,
                    overflow: "hidden",
                    transition: "opacity 200ms ease-in-out",
                  }}
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
                      <div key={item.href} className="relative group/nav">
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                            isActive ? "text-[#37352F]" : "hover:bg-[#EFEFEF]"
                          }`}
                          style={{
                            ...(isActive
                              ? expanded
                                ? {
                                    background: "#EFEFEF",
                                    paddingLeft: 12,
                                    color: "#37352F",
                                    fontWeight: 600,
                                    justifyContent: "flex-start",
                                  }
                                : {
                                    background: "#EFEFEF",
                                    color: "#37352F",
                                    justifyContent: "center",
                                    paddingLeft: 0,
                                  }
                              : {
                                  color: "#73726E",
                                  paddingLeft: expanded ? 12 : 0,
                                  justifyContent: expanded ? "flex-start" : "center",
                                }),
                            transition: "padding 200ms ease-in-out",
                          }}
                        >
                          <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                          <span
                            className="flex-1 whitespace-nowrap"
                            style={{
                              opacity: expanded ? 1 : 0,
                              width: expanded ? "auto" : 0,
                              overflow: "hidden",
                              transition: "opacity 200ms ease-in-out",
                            }}
                          >
                            {item.label}
                          </span>
                          {item.label === "Candidates" && candidateCount != null && candidateCount > 0 && expanded && (
                            <span
                              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full leading-none mr-1"
                              style={{ background: "#EFEFEF", color: "#73726E" }}
                            >
                              {candidateCount}
                            </span>
                          )}
                        </Link>
                        {/* Tooltip when collapsed */}
                        {!expanded && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-[#37352F] text-white text-[12px] whitespace-nowrap opacity-0 group-hover/nav:opacity-100 pointer-events-none transition-opacity z-40">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User card */}
          <div className="px-2 py-4" style={{ borderTop: "1px solid #E9E9E7" }}>
            {userEmail ? (
              <div
                className="flex items-center gap-3 px-2"
                style={{ justifyContent: expanded ? "flex-start" : "center" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                  style={{ background: "#2383E2" }}
                >
                  {initials}
                </div>
                <div
                  className="flex-1 min-w-0"
                  style={{
                    opacity: expanded ? 1 : 0,
                    width: expanded ? "auto" : 0,
                    overflow: "hidden",
                    transition: "opacity 200ms ease-in-out",
                  }}
                >
                  <div className="text-[13px] font-medium text-[#37352F] truncate">
                    {userName || userEmail}
                  </div>
                  {userName && (
                    <div className="text-[11px] truncate" style={{ color: "#9B9A97" }}>
                      {userEmail}
                    </div>
                  )}
                </div>
                {expanded && (
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="p-1 rounded hover:bg-[#EFEFEF] transition-colors flex-shrink-0"
                    title="Sign out"
                  >
                    <LogOut size={14} style={{ color: "#9B9A97" }} />
                  </button>
                )}
              </div>
            ) : (
              <div
                className="px-2 text-[11px]"
                style={{
                  color: "#9B9A97",
                  opacity: expanded ? 1 : 0,
                  transition: "opacity 200ms ease-in-out",
                }}
              >
                Claimless v0.1
              </div>
            )}
          </div>
        </aside>

        {/* Content area */}
        <main
          className="flex-1 min-w-0"
          style={{
            background: "#FFFFFF",
            marginLeft: expanded ? 220 : 48,
            transition: "margin-left 200ms ease-in-out",
          }}
        >
          <div className="px-10 py-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
