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
  }, [fetchKeys, fetchWebhooks]);

  /* ---------- render ---------- */
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-stone-900">Integrations</h1>
        <p className="text-[13px] text-stone-500 mt-1">
          Connect Claimless to your CRM, Zapier, Make, or n8n with API keys and webhooks.
        </p>
      </div>

      {/* ===================== API KEYS SECTION ===================== */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-stone-500" />
            <h2 className="text-[15px] font-semibold text-stone-800">API Keys</h2>
          </div>
          <button
            onClick={() => { setShowCreateKey(true); setCreatedKey(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#D97706" }}
          >
            <Plus size={14} /> Create Key
          </button>
        </div>

        {/* Create key modal */}
        {showCreateKey && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[15px] font-semibold text-stone-800 mb-4">
                {createdKey ? "API Key Created" : "Create API Key"}
              </h3>

              {createdKey ? (
                <div>
                  <div className="flex items-start gap-2 p-3 rounded-md mb-4" style={{ background: "#FEF3C7" }}>
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-800">
                      Copy this key now. You won&apos;t be able to see it again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-stone-100 rounded text-[12px] font-mono text-stone-700 break-all">
                      {createdKey}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(createdKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
                      className="p-2 rounded hover:bg-stone-100"
                    >
                      {copiedKey ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-stone-500" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}
                    className="w-full mt-4 py-2 rounded-md text-[13px] font-medium text-white"
                    style={{ background: "#D97706" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-[12px] font-medium text-stone-600 mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production, Zapier, n8n"
                    className="w-full px-3 py-2 border border-stone-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    onKeyDown={(e) => e.key === "Enter" && createKey()}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowCreateKey(false)}
                      className="flex-1 py-2 rounded-md text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createKey}
                      disabled={!newKeyName.trim() || creatingKey}
                      className="flex-1 py-2 rounded-md text-[13px] font-medium text-white disabled:opacity-50"
                      style={{ background: "#D97706" }}
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
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          {loadingKeys ? (
            <div className="p-6 text-center text-[13px] text-stone-400">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center">
              <Key size={24} className="mx-auto text-stone-300 mb-2" />
              <p className="text-[13px] text-stone-500">No API keys yet. Create one to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100" style={{ background: "#FAFAF9" }}>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-stone-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-stone-500 uppercase tracking-wide">Key</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-stone-500 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-stone-500 uppercase tracking-wide">Last Used</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium text-stone-500 uppercase tracking-wide w-16"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-[13px] font-medium text-stone-800">{k.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-[12px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{k.key_prefix}</code>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-stone-500">{formatDate(k.created_at)}</td>
                    <td className="px-4 py-3 text-[12px] text-stone-500">{timeAgo(k.last_used_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
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
            <Webhook size={16} className="text-stone-500" />
            <h2 className="text-[15px] font-semibold text-stone-800">Webhooks</h2>
          </div>
          <button
            onClick={openCreateWebhook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors"
            style={{ background: "#D97706" }}
          >
            <Plus size={14} /> Add Webhook
          </button>
        </div>

        {/* Webhook list */}
        <div className="space-y-3">
          {loadingWebhooks ? (
            <div className="border border-stone-200 rounded-lg p-6 bg-white text-center text-[13px] text-stone-400">Loading...</div>
          ) : webhooks.length === 0 ? (
            <div className="border border-stone-200 rounded-lg p-8 bg-white text-center">
              <Webhook size={24} className="mx-auto text-stone-300 mb-2" />
              <p className="text-[13px] text-stone-500">No webhooks configured. Add one to start receiving events.</p>
            </div>
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="border border-stone-200 rounded-lg bg-white p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Circle
                      size={8}
                      fill={wh.is_active ? "#10B981" : "#9CA3AF"}
                      stroke="none"
                    />
                    <div>
                      <div className="text-[13px] font-semibold text-stone-800">{wh.name}</div>
                      <div className="text-[12px] text-stone-500 font-mono mt-0.5">{wh.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => testWebhook(wh.id)}
                      disabled={testingWebhook === wh.id}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      {testingWebhook === wh.id ? <RotateCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      Test
                    </button>
                    <button
                      onClick={() => fetchLogs(wh.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Eye size={12} /> Logs
                    </button>
                    <button
                      onClick={() => openEditWebhook(wh)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => deleteWebhook(wh.id)}
                      className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
                      style={{ background: "#F5F5F4", color: "#78716C" }}
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                {/* 24h stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400">Last 24h:</span>
                  <span className="text-[11px] text-stone-600">{wh.stats_24h.total} deliveries</span>
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
              <h3 className="text-[15px] font-semibold text-stone-800">
                {editingWebhook ? "Edit Webhook" : "Add Webhook"}
              </h3>
              <button onClick={() => setShowWebhookModal(false)} className="p-1 rounded hover:bg-stone-100">
                <X size={16} className="text-stone-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1">Name</label>
                <input
                  type="text"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Zapier, n8n Workflow, CRM Sync"
                  className="w-full px-3 py-2 border border-stone-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Secret */}
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-1">
                  Signing Secret <span className="text-stone-400">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookForm.secret}
                    onChange={(e) => setWebhookForm((p) => ({ ...p, secret: e.target.value }))}
                    placeholder="whsec_..."
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-md text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    onClick={generateSecret}
                    className="px-3 py-2 border border-stone-200 rounded-md text-[12px] font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Used to sign payloads with HMAC-SHA256. Verify with the X-Webhook-Signature header.
                </p>
              </div>

              {/* Events */}
              <div>
                <label className="block text-[12px] font-medium text-stone-600 mb-2">Events</label>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map((ev) => (
                    <label key={ev.value} className="flex items-start gap-3 p-2 rounded hover:bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(ev.value)}
                        onChange={() => toggleEvent(ev.value)}
                        className="mt-0.5 accent-amber-600"
                      />
                      <div>
                        <div className="text-[12px] font-medium text-stone-700">{ev.label}</div>
                        <div className="text-[11px] text-stone-400">{ev.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              {editingWebhook && (
                <label className="flex items-center gap-3 p-2 rounded hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookForm.is_active}
                    onChange={(e) => setWebhookForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="accent-amber-600"
                  />
                  <span className="text-[12px] font-medium text-stone-700">Active</span>
                </label>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-stone-600 border border-stone-200 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={saveWebhook}
                disabled={savingWebhook}
                className="flex-1 py-2 rounded-md text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: "#D97706" }}
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
              <h3 className="text-[15px] font-semibold text-stone-800">Delivery Logs</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchLogs(showLogs)} className="p-1 rounded hover:bg-stone-100">
                  <RefreshCw size={14} className={`text-stone-400 ${loadingLogs ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => { setShowLogs(null); setExpandedLog(null); }} className="p-1 rounded hover:bg-stone-100">
                  <X size={16} className="text-stone-400" />
                </button>
              </div>
            </div>

            {loadingLogs ? (
              <div className="py-8 text-center text-[13px] text-stone-400">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-stone-400">No delivery logs yet.</div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="border border-stone-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: log.success ? "#10B981" : "#EF4444" }}
                      />
                      <span className="text-[12px] font-mono text-stone-600 w-48 truncate">{log.event}</span>
                      <span
                        className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          log.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {log.status_code || "ERR"}
                      </span>
                      <span className="text-[11px] text-stone-400">{log.duration_ms}ms</span>
                      <span className="text-[11px] text-stone-400 ml-auto">{timeAgo(log.attempted_at)}</span>
                      {expandedLog === log.id ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
                    </button>
                    {expandedLog === log.id && (
                      <div className="px-4 pb-3 border-t border-stone-100">
                        {log.payload && (
                          <div className="mt-2">
                            <div className="text-[11px] font-medium text-stone-500 mb-1">Payload</div>
                            <pre className="bg-stone-50 rounded p-2 text-[11px] font-mono text-stone-600 overflow-x-auto max-h-40">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.response_body && (
                          <div className="mt-2">
                            <div className="text-[11px] font-medium text-stone-500 mb-1">Response</div>
                            <pre className="bg-stone-50 rounded p-2 text-[11px] font-mono text-stone-600 overflow-x-auto max-h-40">
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

      {/* ===================== API DOCUMENTATION ===================== */}
      <section className="mb-10">
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center gap-2 text-[15px] font-semibold text-stone-800 hover:text-stone-600 transition-colors"
        >
          {showDocs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          API Documentation
        </button>

        {showDocs && (
          <div className="mt-4 border border-stone-200 rounded-lg bg-white p-6 space-y-6">
            {/* Auth */}
            <div>
              <h4 className="text-[13px] font-semibold text-stone-700 mb-2">Authentication</h4>
              <p className="text-[12px] text-stone-500 mb-2">
                Include your API key as a Bearer token in the Authorization header:
              </p>
              <pre className="bg-stone-50 rounded p-3 text-[12px] font-mono text-stone-600 overflow-x-auto">
{`Authorization: Bearer clm_your_api_key_here`}
              </pre>
            </div>

            {/* Endpoints */}
            <div>
              <h4 className="text-[13px] font-semibold text-stone-700 mb-2">Endpoints</h4>
              <div className="space-y-3">
                <div className="border border-stone-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-stone-700">/api/v1/candidates</code>
                  </div>
                  <p className="text-[11px] text-stone-500">List candidates. Params: job_id, stage, limit, offset</p>
                </div>
                <div className="border border-stone-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-stone-700">/api/v1/candidates/:id</code>
                  </div>
                  <p className="text-[11px] text-stone-500">Get full candidate details including screening results and skills</p>
                </div>
                <div className="border border-stone-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-stone-700">/api/v1/jobs</code>
                  </div>
                  <p className="text-[11px] text-stone-500">List jobs. Params: status (open, closed, draft)</p>
                </div>
                <div className="border border-stone-100 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50">GET</span>
                    <code className="text-[12px] font-mono text-stone-700">/api/v1/webhooks/logs</code>
                  </div>
                  <p className="text-[11px] text-stone-500">View delivery logs. Params: webhook_id, limit, offset</p>
                </div>
              </div>
            </div>

            {/* Webhook payload */}
            <div>
              <h4 className="text-[13px] font-semibold text-stone-700 mb-2">Webhook Payload Format</h4>
              <pre className="bg-stone-50 rounded p-3 text-[12px] font-mono text-stone-600 overflow-x-auto">
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

            {/* Signature verification */}
            <div>
              <h4 className="text-[13px] font-semibold text-stone-700 mb-2">Signature Verification</h4>
              <p className="text-[12px] text-stone-500 mb-2">
                If a signing secret is set, verify the <code className="text-stone-700">X-Webhook-Signature</code> header:
              </p>
              <pre className="bg-stone-50 rounded p-3 text-[12px] font-mono text-stone-600 overflow-x-auto">
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
