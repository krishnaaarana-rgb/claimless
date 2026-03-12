"use client";

import { useState, useEffect, useCallback } from "react";

interface Note {
  id: string;
  content: string;
  author_name: string | null;
  author_id: string;
  created_at: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function NotesSection({
  candidateId,
  applicationId,
}: {
  candidateId: string;
  applicationId: string | null;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          application_id: applicationId,
        }),
      });
      if (res.ok) {
        setContent("");
        fetchNotes();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Add note form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add an internal note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-[#E9E9E7] bg-white text-[13px] text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2]"
        />
        <button
          onClick={handleAdd}
          disabled={saving || !content.trim()}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors disabled:opacity-50 shrink-0"
          style={{ background: "#2383E2" }}
        >
          {saving ? "..." : "Add"}
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="py-4 text-center">
          <div className="w-4 h-4 border-2 border-[#2383E2] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-[13px] text-[#9B9A97]">No notes yet.</p>
      ) : (
        <div className="space-y-0">
          {notes.map((note, i) => (
            <div
              key={note.id}
              className="py-3"
              style={
                i < notes.length - 1
                  ? { borderBottom: "1px solid #E9E9E7" }
                  : undefined
              }
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium text-[#37352F]">
                  {note.author_name || "Team member"}
                </span>
                <span className="text-[11px] text-[#9B9A97]">
                  {relativeTime(note.created_at)}
                </span>
              </div>
              <p className="text-[13px] text-[#37352F] whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
