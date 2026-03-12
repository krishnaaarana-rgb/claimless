"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, PhoneOff, CheckCircle2 } from "lucide-react";

interface TranscriptEntry {
  role: "assistant" | "user";
  text: string;
  timestamp: Date;
}

type SessionStatus = "loading" | "connecting" | "active" | "ended" | "error";

export default function InterviewSession() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<SessionStatus>("loading");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");

  const vapiRef = useRef<Vapi | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Camera (video only — Vapi handles audio)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Initialize Vapi
  const startInterview = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const preferredName = searchParams.get("name") || "";

      const res = await fetch(`/api/interview/${token}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_name: preferredName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start interview");
        setStatus("error");
        return;
      }

      const { assistant_id, public_key, job_title } = await res.json();
      setJobTitle(job_title);
      setStatus("connecting");

      const vapi = new Vapi(public_key);
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("active"));

      vapi.on("call-end", () => {
        setStatus("ended");
        setTimeout(() => router.push(`/interview/${token}/complete`), 2000);
      });

      vapi.on("speech-start", () => setAiSpeaking(true));
      vapi.on("speech-end", () => setAiSpeaking(false));

      vapi.on("message", (message) => {
        const msg = message as {
          type: string;
          transcriptType?: string;
          role?: "assistant" | "user";
          transcript?: string;
        };
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          setTranscript((prev) => [
            ...prev,
            {
              role: msg.role || "user",
              text: msg.transcript || "",
              timestamp: new Date(),
            },
          ]);
        }
      });

      vapi.on("error", (err) => {
        console.error("[vapi] Error:", err);
        setError("Connection error. Please check your microphone.");
      });

      await vapi.start(assistant_id);
    } catch (err) {
      console.error("[interview] Start failed:", err);
      setError("Failed to start interview. Please try again.");
      setStatus("error");
    }
  }, [token, router, searchParams]);

  useEffect(() => {
    startInterview();
    return () => {
      vapiRef.current?.stop();
    };
  }, [startInterview]);

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const endInterview = () => {
    if (confirm("Are you sure you want to end the interview?")) {
      vapiRef.current?.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --- Loading ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-[13px] text-white/40 mt-4">
          Preparing your interview...
        </p>
      </div>
    );
  }

  // --- Error ---
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <PhoneOff size={20} className="text-red-400" />
        </div>
        <p className="text-[16px] text-white font-medium mb-2">
          Something went wrong
        </p>
        <p className="text-[13px] text-white/40 max-w-sm text-center mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-white/80 border border-white/10 hover:bg-white/5 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Ended ---
  if (status === "ended") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <CheckCircle2 size={40} className="text-emerald-400 mb-4" />
        <p className="text-[16px] text-white font-medium mb-1">
          Interview Complete
        </p>
        <p className="text-[13px] text-white/40">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A]">
      <div className="w-full max-w-[720px] mx-auto px-6 py-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {status === "connecting" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                <span className="text-[13px] text-white/40">Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-white/40">{jobTitle}</span>
              </div>
            )}
          </div>
          {status === "active" && (
            <div
              className="text-[14px] text-white/50 tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>

        {/* Camera Preview */}
        <div className="flex justify-center mb-5">
          <div className="relative w-full max-w-[480px] rounded-xl overflow-hidden bg-[#18181B]" style={{ aspectRatio: "4/3" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {status === "connecting" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* AI Status */}
        <div className="flex justify-center mb-5">
          {aiSpeaking ? (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-[3px] h-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-white/60"
                    style={{
                      animation: `speaking 0.${4 + i}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[12px] text-white/50">
                Interviewer is speaking
              </span>
            </div>
          ) : status === "active" ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.06] border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] text-emerald-400/70">
                Listening
              </span>
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              isMuted
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15"
                : "bg-white/[0.04] text-white/60 border border-white/[0.06] hover:bg-white/[0.08]"
            }`}
          >
            {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={endInterview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-red-400/80 border border-red-500/15 hover:bg-red-500/10 transition-colors"
          >
            <PhoneOff size={15} />
            End
          </button>
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="flex-1 min-h-0">
            <p className="text-[11px] text-white/20 uppercase tracking-wider font-medium mb-2">
              Transcript
            </p>
            <div
              className="rounded-lg overflow-y-auto space-y-1.5 pr-2"
              style={{
                maxHeight: "280px",
                padding: "12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${entry.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[85%] ${
                      entry.role === "user"
                        ? "bg-white/[0.06] text-white/70"
                        : "bg-white/[0.03] text-white/50"
                    }`}
                  >
                    <p className="text-[13px] leading-relaxed">{entry.text}</p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <p className="text-center text-[11px] text-white/10 mt-6 pb-2">
          Powered by Claimless
        </p>
      </div>

      {/* Speaking animation keyframes */}
      <style jsx>{`
        @keyframes speaking {
          0% { height: 3px; }
          100% { height: 12px; }
        }
      `}</style>
    </div>
  );
}
