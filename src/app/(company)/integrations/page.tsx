"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Key,
  Webhook,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Zap,
  Eye,
  Pencil,
  RotateCw,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Circle,
  Link2,
  ArrowRightLeft,
} from "lucide-react";
import { useToast } from "@/components/toast";

/* ---------- types ---------- */
interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key?: string;
  last_used_at: string | null;
  created_at: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats_24h: { total: number; success: number; failed: number };
}

interface ATSIntegration {
  id: string;
  provider: string;
  name: string;
  is_active: boolean;
  callback_url: string | null;
  callback_events: string[];
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  inbound_count: number;
  outbound_count: number;
  created_at: string;
}

const ATS_PROVIDERS = [
  { value: "jobadder", label: "JobAdder", description: "Australia's leading recruitment platform" },
  { value: "bullhorn", label: "Bullhorn", description: "Global recruitment CRM & ATS" },
  { value: "vincere", label: "Vincere", description: "Recruitment OS for staffing agencies" },
  { value: "generic", label: "Generic / Custom", description: "Any ATS with API capabilities" },
];

const CALLBACK_EVENTS = [
  { value: "screening_completed", label: "Screening Completed", description: "ATS screening results are ready" },
  { value: "interview_completed", label: "Interview Completed", description: "Voice interview results are scored" },
];

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  status_code: number;
  success: boolean;
  duration_ms: number;
  attempted_at: string;
  payload?: Record<string, unknown>;
  response_body?: string;
}

const WEBHOOK_EVENTS: { value: string; label: string; description: string }[] = [
  { value: "candidate.applied", label: "Candidate Applied", description: "A new application is submitted" },
  { value: "candidate.screening_completed", label: "Screening Completed", description: "ATS screening finishes" },
  { value: "candidate.stage_changed", label: "Stage Changed", description: "A candidate moves to a new pipeline stage" },
  { value: "candidate.interview_completed", label: "Interview Completed", description: "A voice interview is completed" },
  { value: "candidate.email_sent", label: "Email Sent", description: "An automated email is sent to a candidate" },
  { value: "candidate.rejected", label: "Candidate Rejected", description: "A candidate is rejected (manual or auto)" },
  { value: "candidate.hired", label: "Candidate Hired", description: "A candidate is moved to hired" },
];

/* ---------- helpers ---------- */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ---------- page ---------- */
export default function IntegrationsPage() {
  const { toast } = useToast();

  // API Keys state
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loadingWebhooks, setLoadingWebhooks] = useState(true);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    url: "",
    secret: "",
    events: [] as string[],
    is_active: true,
  });
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  // Logs state
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // ATS integrations state
  const [atsIntegrations, setAtsIntegrations] = useState<ATSIntegration[]>([]);
  const [loadingATS, setLoadingATS] = useState(true);
  const [showATSModal, setShowATSModal] = useState(false);
  const [atsForm, setAtsForm] = useState({
    provider: "jobadder",
    name: "",
    callback_url: "",
    callback_secret: "",
    callback_events: ["screening_completed", "interview_completed"],
  });
  const [savingATS, setSavingATS] = useState(false);

  // API docs state
  const [showDocs, setShowDocs] = useState(false);

  /* ---------- API Key methods ---------- */
  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    const res = await fetch("/api/settings/api-keys");
    const data = await res.json();
    setKeys(data.keys || []);
    setLoadingKeys(false);
  }, []);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    const res = await fetch("/api/settings/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } else {
      toast(data.error || "Failed to create API key", "error");
    }
    setCreatingKey(false);
  };

  const revokeKey = async (id: string) => {
    const res = await fetch(`/api/settings/api-keys?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("API key revoked", "success");
      fetchKeys();
    }
  };

  /* ---------- Webhook methods ---------- */
  const fetchWebhooks = useCallback(async () => {
    setLoadingWebhooks(true);
    const res = await fetch("/api/settings/webhooks");
    const data = await res.json();
    setWebhooks(data.webhooks || []);
    setLoadingWebhooks(false);
  }, []);

  const openCreateWebhook = () => {
    setEditingWebhook(null);
    setWebhookForm({ name: "", url: "", secret: "", events: [], is_active: true });
    setShowWebhookModal(true);
  };

  const openEditWebhook = (wh: WebhookItem) => {
    setEditingWebhook(wh);
    setWebhookForm({
      name: wh.name,
      url: wh.url,
      secret: wh.secret || "",
      events: wh.events,
      is_active: wh.is_active,
    });
    setShowWebhookModal(true);
  };

  const saveWebhook = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim() || webhookForm.events.length === 0) {
      toast("Name, URL, and at least one event are required", "error");
      return;
    }
    setSavingWebhook(true);
    if (editingWebhook) {
      const res = await fetch("/api/settings/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingWebhook.id, ...webhookForm }),
      });
      if (res.ok) {
        toast("Webhook updated", "success");
        setShowWebhookModal(false);
        fetchWebhooks();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to update webhook", "error");
      }
    } else {
      const res = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookForm),
      });
      if (res.ok) {
        toast("Webhook created", "success");
        setShowWebhookModal(false);
        fetchWebhooks();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to create webhook", "error");
      }
    }
    setSavingWebhook(false);
  };

  const deleteWebhook = async (id: string) => {
    const res = await fetch(`/api/settings/webhooks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Webhook deleted", "success");
      fetchWebhooks();
    }
  };

  const testWebhook = async (id: string) => {
    setTestingWebhook(id);
    const res = await fetch("/api/settings/webhooks/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook_id: id }),
    });
    const data = await res.json();
    if (data.success) {
      toast(`Test delivered (${data.status_code}, ${data.duration_ms}ms)`, "success");
    } else {
      toast(`Test failed: ${data.error || "Unknown error"}`, "error");
    }
    setTestingWebhook(null);
  };

  const toggleEvent = (event: string) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const generateSecret = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const secret = "whsec_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    setWebhookForm((prev) => ({ ...prev, secret }));
  };

  /* ---------- ATS Integration methods ---------- */
  const fetchATSIntegrations = useCallback(async () => {
    setLoadingATS(true);
    const res = await fetch("/api/v1/integrations");
    const data = await res.json();
    setAtsIntegrations(data.integrations || []);
    setLoadingATS(false);
  }, []);

  const createATSIntegration = async () => {
    if (!atsForm.provider) return;
    setSavingATS(true);
    const res = await fetch("/api/v1/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atsForm),
    });
    if (res.ok) {
      toast("ATS integration created", "success");
      setShowATSModal(false);
      fetchATSIntegrations();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create integration", "error");
    }
    setSavingATS(false);
  };

  const toggleATSIntegration = async (id: string, isActive: boolean) => {
    await fetch("/api/v1/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    fetchATSIntegrations();
  };

  const deleteATSIntegration = async (id: string) => {
    const res = await fetch("/api/v1/integrations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast("Integration deleted", "success");
      fetchATSIntegrations();
    }
  };

  /* ---------- Logs methods ---------- */
  const fetchLogs = async (webhookId: string) => {
    setLoadingLogs(true);
    setShowLogs(webhookId);
    const res = await fetch(`/api/settings/webhooks/logs?webhook_id=${webhookId}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setLoadingLogs(false);
  };

  /* ---------- load on mount ---------- */
  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
    fetchATSIntegrations();
  }, [fetchKeys, fetchWebhooks, fetchATSIntegrations]);

  /* ---------- render ---------- */
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#37352F]">Integrations</h1>
        <p className="text-[13px] text-[#9B9A97] mt-1">
          Connect Claimless to your CRM, Zapier, Make, or n8n with API keys and webhooks.
        </p>
      </div>

      {/* ===================== API KEYS SECTION ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#9B9A97]" />
            <h2 className="text-[15px] font-semibold text-[#37352F]">API Keys</h2>
          </div>
          <button
            onClick={() => { setShowCreateKey(true); setCreatedKey(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#2383E2" }}
          >
            <Plus size={14} /> Create Key
          </button>
        </div>

        {/* Create key modal */}
        {showCreateKey && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[15px] font-semibold text-[#37352F] mb-4">
                {createdKey ? "API Key Created" : "Create API Key"}
              </h3>

              {createdKey ? (
                <div>
                  <div className="flex items-start gap-2 p-3 rounded-md mb-4" style={{ background: "#DBEAFE" }}>
                    <AlertTriangle size={16} className="text-[#2383E2] mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-[#37352F]">
                      Copy this key now. You won&apos;t be able to see it again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-[#F7F6F3] rounded text-[12px] font-mono text-[#37352F] break-all">
                      {createdKey}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(createdKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
                      className="p-2 rounded hover:bg-[#F7F6F3]"
                    >
                      {copiedKey ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-[#9B9A97]" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}
                    className="w-full mt-4 py-2 rounded-md text-[13px] font-medium text-white"
                    style={{ background: "#2383E2" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-[12px] font-medium text-[#37352F] mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production, Zapier, n8n"
                    className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                    onKeyDown={(e) => e.key === "Enter" && createKey()}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowCreateKey(false)}
                      className="flex-1 py-2 rounded-md text-[13px] font-medium text-[#37352F] border border-[#E9E9E7] hover:bg-[#F7F6F3]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createKey}
                      disabled={!newKeyName.trim() || creatingKey}
                      className="flex-1 py-2 rounded-md text-[13px] font-medium text-white disabled:opacity-50"
                      style={{ background: "#2383E2" }}
                    >
                      {creatingKey ? "Creating..." : "Create Key"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keys table */}
        <div className="border border-[#E9E9E7] rounded-lg overflow-hidden bg-white">
          {loadingKeys ? (
            <div className="p-6 text-center text-[13px] text-[#9B9A97]">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center">
              <Key size={24} className="mx-auto text-[#D3D1CB] mb-2" />
              <p className="text-[13px] text-[#9B9A97]">No API keys yet. Create one to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E9E9E7]" style={{ background: "#F7F6F3" }}>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide">Key</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide">Created</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide">Last Used</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-[#9B9A97] uppercase tracking-wide w-16"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-[#E9E9E7] hover:bg-[#F7F6F3]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#37352F]">{k.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-[12px] font-mono text-[#9B9A97] bg-[#F7F6F3] px-2 py-0.5 rounded">{k.key_prefix}</code>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#9B9A97]">{formatDate(k.created_at)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#9B9A97]">{timeAgo(k.last_used_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="p-1 rounded hover:bg-red-50 text-[#9B9A97] hover:text-red-500 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ===================== WEBHOOKS SECTION ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Webhook size={16} className="text-[#9B9A97]" />
            <h2 className="text-[15px] font-semibold text-[#37352F]">Webhooks</h2>
          </div>
          <button
            onClick={openCreateWebhook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#2383E2" }}
          >
            <Plus size={14} /> Add Webhook
          </button>
        </div>

        {/* Webhook list */}
        <div className="space-y-3">
          {loadingWebhooks ? (
            <div className="border border-[#E9E9E7] rounded-lg p-6 bg-white text-center text-[13px] text-[#9B9A97]">Loading...</div>
          ) : webhooks.length === 0 ? (
            <div className="border border-[#E9E9E7] rounded-lg p-8 bg-white text-center">
              <Webhook size={24} className="mx-auto text-[#D3D1CB] mb-2" />
              <p className="text-[13px] text-[#9B9A97]">No webhooks configured. Add one to start receiving events.</p>
            </div>
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="border border-[#E9E9E7] rounded-lg bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Circle
                      size={8}
                      fill={wh.is_active ? "#10B981" : "#9CA3AF"}
                      stroke="none"
                    />
                    <div>
                      <div className="text-[13px] font-semibold text-[#37352F]">{wh.name}</div>
                      <div className="text-[12px] text-[#9B9A97] font-mono mt-0.5">{wh.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => testWebhook(wh.id)}
                      disabled={testingWebhook === wh.id}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                    >
                      {testingWebhook === wh.id ? <RotateCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      Test
                    </button>
                    <button
                      onClick={() => fetchLogs(wh.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                    >
                      <Eye size={12} /> Logs
                    </button>
                    <button
                      onClick={() => openEditWebhook(wh)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => deleteWebhook(wh.id)}
                      className="p-1 rounded text-[#9B9A97] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Events pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {wh.events.map((ev) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "#F7F6F3", color: "#9B9A97" }}
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                {/* 24h stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E9E9E7]">
                  <span className="text-[11px] text-[#9B9A97]">Last 24h:</span>
                  <span className="text-[11px] text-[#37352F]">{wh.stats_24h.total} deliveries</span>
                  {wh.stats_24h.success > 0 && (
                    <span className="text-[11px] text-emerald-600">{wh.stats_24h.success} success</span>
                  )}
                  {wh.stats_24h.failed > 0 && (
                    <span className="text-[11px] text-red-500">{wh.stats_24h.failed} failed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===================== WEBHOOK MODAL ===================== */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowWebhookModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#37352F]">
                {editingWebhook ? "Edit Webhook" : "Add Webhook"}
              </h3>
              <button onClick={() => setShowWebhookModal(false)} className="p-1 rounded hover:bg-[#F7F6F3]">
                <X size={16} className="text-[#9B9A97]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">Name</label>
                <input
                  type="text"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Zapier, n8n Workflow, CRM Sync"
                  className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                />
              </div>

              {/* Secret */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">
                  Signing Secret <span className="text-[#9B9A97]">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookForm.secret}
                    onChange={(e) => setWebhookForm((p) => ({ ...p, secret: e.target.value }))}
                    placeholder="whsec_..."
                    className="flex-1 px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                  />
                  <button
                    onClick={generateSecret}
                    className="px-3 py-2 border border-[#E9E9E7] rounded-md text-[12px] font-medium text-[#37352F] hover:bg-[#F7F6F3]"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[11px] text-[#9B9A97] mt-1">
                  Used to sign payloads with HMAC-SHA256. Verify with the X-Webhook-Signature header.
                </p>
              </div>

              {/* Events */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-2">Events</label>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map((ev) => (
                    <label key={ev.value} className="flex items-start gap-3 p-2 rounded hover:bg-[#F7F6F3] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(ev.value)}
                        onChange={() => toggleEvent(ev.value)}
                        className="mt-0.5 accent-[#2383E2]"
                      />
                      <div>
                        <div className="text-[12px] font-medium text-[#37352F]">{ev.label}</div>
                        <div className="text-[11px] text-[#9B9A97]">{ev.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              {editingWebhook && (
                <label className="flex items-center gap-3 p-2 rounded hover:bg-[#F7F6F3] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookForm.is_active}
                    onChange={(e) => setWebhookForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="accent-[#2383E2]"
                  />
                  <span className="text-[12px] font-medium text-[#37352F]">Active</span>
                </label>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-[#37352F] border border-[#E9E9E7] hover:bg-[#F7F6F3]"
              >
                Cancel
              </button>
              <button
                onClick={saveWebhook}
                disabled={savingWebhook}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: "#2383E2" }}
              >
                {savingWebhook ? "Saving..." : editingWebhook ? "Update Webhook" : "Create Webhook"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELIVERY LOGS MODAL ===================== */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setShowLogs(null); setExpandedLog(null); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#37352F]">Delivery Logs</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchLogs(showLogs)} className="p-1 rounded hover:bg-[#F7F6F3]">
                  <RefreshCw size={14} className={`text-[#9B9A97] ${loadingLogs ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => { setShowLogs(null); setExpandedLog(null); }} className="p-1 rounded hover:bg-[#F7F6F3]">
                  <X size={16} className="text-[#9B9A97]" />
                </button>
              </div>
            </div>

            {loadingLogs ? (
              <div className="py-8 text-center text-[13px] text-[#9B9A97]">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-[#9B9A97]">No delivery logs yet.</div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="border border-[#E9E9E7] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F6F3]"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: log.success ? "#10B981" : "#EF4444" }}
                      />
                      <span className="text-[12px] font-mono text-[#37352F] w-48 truncate">{log.event}</span>
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          log.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {log.status_code || "ERR"}
                      </span>
                      <span className="text-[11px] text-[#9B9A97]">{log.duration_ms}ms</span>
                      <span className="text-[11px] text-[#9B9A97] ml-auto">{timeAgo(log.attempted_at)}</span>
                      {expandedLog === log.id ? <ChevronUp size={14} className="text-[#9B9A97]" /> : <ChevronDown size={14} className="text-[#9B9A97]" />}
                    </button>
                    {expandedLog === log.id && (
                      <div className="px-4 pb-3 border-t border-[#E9E9E7]">
                        {log.payload && (
                          <div className="mt-2">
                            <div className="text-[11px] font-medium text-[#9B9A97] mb-1">Payload</div>
                            <pre className="bg-[#F7F6F3] rounded p-2 text-[11px] font-mono text-[#37352F] overflow-x-auto max-h-40">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.response_body && (
                          <div className="mt-2">
                            <div className="text-[11px] font-medium text-[#9B9A97] mb-1">Response</div>
                            <pre className="bg-[#F7F6F3] rounded p-2 text-[11px] font-mono text-[#37352F] overflow-x-auto max-h-40">
                              {log.response_body}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== ATS INTEGRATIONS ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-[#9B9A97]" />
            <h2 className="text-[15px] font-semibold text-[#37352F]">ATS Integrations</h2>
          </div>
          <button
            onClick={() => {
              setAtsForm({ provider: "jobadder", name: "", callback_url: "", callback_secret: "", callback_events: ["screening_completed", "interview_completed"] });
              setShowATSModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#2383E2" }}
          >
            <Link2 size={14} /> Connect ATS
          </button>
        </div>

        <p className="text-[12px] text-[#9B9A97] mb-4">
          Push candidates from your ATS into Claimless for screening. Results are automatically sent back.
        </p>

        <div className="space-y-3">
          {loadingATS ? (
            <div className="border border-[#E9E9E7] rounded-lg p-6 bg-white text-center text-[13px] text-[#9B9A97]">Loading...</div>
          ) : atsIntegrations.length === 0 ? (
            <div className="border border-[#E9E9E7] rounded-lg p-8 bg-white text-center">
              <ArrowRightLeft size={24} className="mx-auto text-[#D3D1CB] mb-2" />
              <p className="text-[13px] text-[#9B9A97]">No ATS connected. Connect JobAdder, Bullhorn, or Vincere to sync candidates.</p>
            </div>
          ) : (
            atsIntegrations.map((ats) => {
              const providerInfo = ATS_PROVIDERS.find((p) => p.value === ats.provider);
              return (
                <div key={ats.id} className="border border-[#E9E9E7] rounded-lg bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Circle size={8} fill={ats.is_active ? "#10B981" : "#9CA3AF"} stroke="none" />
                      <div>
                        <div className="text-[13px] font-semibold text-[#37352F]">
                          {ats.name}
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F7F6F3] text-[#9B9A97]">
                            {providerInfo?.label || ats.provider}
                          </span>
                        </div>
                        {ats.callback_url && (
                          <div className="text-[12px] text-[#9B9A97] font-mono mt-0.5 truncate max-w-md">{ats.callback_url}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleATSIntegration(ats.id, ats.is_active)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
                      >
                        {ats.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => deleteATSIntegration(ats.id)}
                        className="p-1 rounded text-[#9B9A97] hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#E9E9E7]">
                    <div>
                      <span className="text-[11px] text-[#9B9A97]">Inbound: </span>
                      <span className="text-[11px] font-medium text-[#37352F]">{ats.inbound_count}</span>
                      <span className="text-[10px] text-[#9B9A97] ml-1">({timeAgo(ats.last_inbound_at)})</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#9B9A97]">Outbound: </span>
                      <span className="text-[11px] font-medium text-[#37352F]">{ats.outbound_count}</span>
                      <span className="text-[10px] text-[#9B9A97] ml-1">({timeAgo(ats.last_outbound_at)})</span>
                    </div>
                    <div className="flex gap-1.5">
                      {ats.callback_events.map((ev) => (
                        <span key={ev} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F7F6F3] text-[#9B9A97]">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ===================== ATS INTEGRATION MODAL ===================== */}
      {showATSModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowATSModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#37352F]">Connect ATS</h3>
              <button onClick={() => setShowATSModal(false)} className="p-1 rounded hover:bg-[#F7F6F3]">
                <X size={16} className="text-[#9B9A97]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-2">ATS Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {ATS_PROVIDERS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setAtsForm((prev) => ({ ...prev, provider: p.value, name: prev.name || `${p.label} Integration` }))}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        atsForm.provider === p.value
                          ? "border-[#2383E2] bg-blue-50"
                          : "border-[#E9E9E7] hover:bg-[#F7F6F3]"
                      }`}
                    >
                      <div className="text-[12px] font-semibold text-[#37352F]">{p.label}</div>
                      <div className="text-[11px] text-[#9B9A97]">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">Integration Name</label>
                <input
                  type="text"
                  value={atsForm.name}
                  onChange={(e) => setAtsForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. JobAdder Production"
                  className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                />
              </div>

              {/* Callback URL */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">
                  Callback URL <span className="text-[#9B9A97]">(results pushed here)</span>
                </label>
                <input
                  type="url"
                  value={atsForm.callback_url}
                  onChange={(e) => setAtsForm((p) => ({ ...p, callback_url: e.target.value }))}
                  placeholder="https://your-ats.com/webhook/claimless"
                  className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                />
              </div>

              {/* Callback Secret */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-1">
                  Signing Secret <span className="text-[#9B9A97]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={atsForm.callback_secret}
                  onChange={(e) => setAtsForm((p) => ({ ...p, callback_secret: e.target.value }))}
                  placeholder="Optional HMAC signing secret"
                  className="w-full px-3 py-2 border border-[#E9E9E7] rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
                />
              </div>

              {/* Callback Events */}
              <div>
                <label className="block text-[12px] font-medium text-[#37352F] mb-2">Push Results When</label>
                <div className="space-y-2">
                  {CALLBACK_EVENTS.map((ev) => (
                    <label key={ev.value} className="flex items-start gap-3 p-2 rounded hover:bg-[#F7F6F3] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={atsForm.callback_events.includes(ev.value)}
                        onChange={() => {
                          setAtsForm((prev) => ({
                            ...prev,
                            callback_events: prev.callback_events.includes(ev.value)
                              ? prev.callback_events.filter((e) => e !== ev.value)
                              : [...prev.callback_events, ev.value],
                          }));
                        }}
                        className="mt-0.5 accent-[#2383E2]"
                      />
                      <div>
                        <div className="text-[12px] font-medium text-[#37352F]">{ev.label}</div>
                        <div className="text-[11px] text-[#9B9A97]">{ev.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Inbound instructions */}
              <div className="p-3 rounded-md bg-[#F7F6F3]">
                <div className="text-[12px] font-medium text-[#37352F] mb-1">Inbound Endpoint</div>
                <p className="text-[11px] text-[#9B9A97] mb-2">
                  Configure your ATS to push candidates to this URL:
                </p>
                <code className="text-[11px] font-mono text-[#37352F] break-all">
                  POST {typeof window !== "undefined" ? window.location.origin : ""}/api/v1/inbound?provider={atsForm.provider}
                </code>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowATSModal(false)}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-[#37352F] border border-[#E9E9E7] hover:bg-[#F7F6F3]"
              >
                Cancel
              </button>
              <button
                onClick={createATSIntegration}
                disabled={savingATS}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: "#2383E2" }}
              >
                {savingATS ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== API DOCUMENTATION ===================== */}
      <section className="mb-10">
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center gap-2 text-[15px] font-semibold text-[#37352F] hover:text-[#37352F] transition-colors"
        >
          {showDocs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          API Documentation
        </button>

        {showDocs && (
          <div className="mt-4 border border-[#E9E9E7] rounded-lg bg-white p-6 space-y-6">
            {/* Auth */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Authentication</h4>
              <p className="text-[12px] text-[#9B9A97] mb-2">
                Include your API key as a Bearer token in the Authorization header:
              </p>
              <pre className="bg-[#F7F6F3] rounded p-3 text-[12px] font-mono text-[#37352F] overflow-x-auto">
{`Authorization: Bearer clm_your_api_key_here`}
              </pre>
            </div>

            {/* Endpoints */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Endpoints</h4>
              <div className="space-y-3">
                <div className="border border-[#E9E9E7] rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/candidates</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">List candidates. Params: job_id, stage, limit, offset</p>
                </div>
                <div className="border border-[#E9E9E7] rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/candidates/:id</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">Get full candidate details including screening results and skills</p>
                </div>
                <div className="border border-[#E9E9E7] rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/jobs</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">List jobs. Params: status (open, closed, draft)</p>
                </div>
                <div className="border border-[#E9E9E7] rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/webhooks/logs</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">View delivery logs. Params: webhook_id, limit, offset</p>
                </div>
                <div className="border border-[#E9E9E7] rounded p-3 border-l-2 border-l-[#2383E2]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#2383E2] bg-blue-50">POST</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/inbound</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">Push a candidate from an external ATS. Params: provider, job_id. Auto-triggers screening.</p>
                </div>
                <div className="border border-[#E9E9E7] rounded p-3 border-l-2 border-l-[#2383E2]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-[#37352F]">/api/v1/results/:application_id</code>
                  </div>
                  <p className="text-[11px] text-[#9B9A97]">Fetch full screening + interview results for an application</p>
                </div>
              </div>
            </div>

            {/* Webhook payload */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Webhook Payload Format</h4>
              <pre className="bg-[#F7F6F3] rounded p-3 text-[12px] font-mono text-[#37352F] overflow-x-auto">
{`{
  "event": "candidate.applied",
  "timestamp": "2026-03-02T12:00:00.000Z",
  "data": {
    "application_id": "uuid",
    "candidate_name": "Jane Doe",
    "candidate_email": "jane@example.com",
    "job_id": "uuid",
    "job_title": "Senior Engineer"
  }
}`}
              </pre>
            </div>

            {/* Inbound payload */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Inbound Payload (ATS → Claimless)</h4>
              <pre className="bg-[#F7F6F3] rounded p-3 text-[12px] font-mono text-[#37352F] overflow-x-auto">
{`POST /api/v1/inbound?provider=jobadder&job_id=uuid
Authorization: Bearer clm_your_api_key

{
  "candidate": {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+61 412 345 678",
    "linkedin_url": "https://linkedin.com/in/janedoe",
    "github_username": "janedoe",
    "portfolio_url": "https://janedoe.dev",
    "resume_text": "Full resume text..."
  },
  "job": {
    "title": "Senior Engineer",
    "description": "Optional — matched by job_id"
  },
  "external_candidate_id": "JA-12345",
  "external_application_id": "APP-67890"
}`}
              </pre>
              <p className="text-[11px] text-[#9B9A97] mt-2">
                Adapters for JobAdder, Bullhorn, and Vincere automatically map their field names. Use the <code>X-ATS-Provider</code> header or <code>?provider=</code> query param.
              </p>
            </div>

            {/* Signature verification */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#37352F] mb-2">Signature Verification</h4>
              <p className="text-[12px] text-[#9B9A97] mb-2">
                If a signing secret is set, verify the <code className="text-[#37352F]">X-Webhook-Signature</code> header:
              </p>
              <pre className="bg-[#F7F6F3] rounded p-3 text-[12px] font-mono text-[#37352F] overflow-x-auto">
{`// Node.js example
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', YOUR_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
const valid = header === \`sha256=\${signature}\`;`}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
