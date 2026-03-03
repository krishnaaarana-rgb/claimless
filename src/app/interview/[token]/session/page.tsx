"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import { Mic, MicOff, PhoneOff, Loader2, CheckCircle2 } from "lucide-react";

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

  // Start camera (video only -- Vapi handles audio)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Camera is optional for the interview
      });

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

      // Call our API to create the assistant and get credentials
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

      // Initialize Vapi Web SDK
      const vapi = new Vapi(public_key);
      vapiRef.current = vapi;

      // Event handlers
      vapi.on("call-start", () => {
        setStatus("active");
      });

      vapi.on("call-end", () => {
        setStatus("ended");
        setTimeout(() => {
          router.push(`/interview/${token}/complete`);
        }, 2000);
      });

      vapi.on("speech-start", () => {
        setAiSpeaking(true);
      });

      vapi.on("speech-end", () => {
        setAiSpeaking(false);
      });

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

      // Start the call with the dynamic assistant
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

  // Loading state
  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#0F0F0F" }}
      >
        <Loader2 size={32} className="text-amber-500 animate-spin" />
        <p className="text-[14px] text-stone-400">
          Preparing your interview...
        </p>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#0F0F0F" }}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <PhoneOff size={24} className="text-red-400" />
        </div>
        <p className="text-[16px] text-white font-medium">
          Something went wrong
        </p>
        <p className="text-[14px] text-stone-400 max-w-md text-center">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 rounded-lg text-[13px] font-medium text-white border border-stone-700 hover:bg-stone-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Ended state
  if (status === "ended") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "#0F0F0F" }}
      >
        <CheckCircle2 size={48} className="text-emerald-400" />
        <p className="text-[18px] text-white font-medium">
          Interview Complete!
        </p>
        <p className="text-[14px] text-stone-400">Redirecting...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#0F0F0F" }}
    >
      <div className="w-full max-w-[800px] px-6 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-6">
          {status === "connecting" ? (
            <p className="text-[14px] text-amber-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Connecting to interviewer...
            </p>
          ) : (
            <>
              <p className="text-[13px] text-stone-500 mb-1">
                Interview in Progress
              </p>
              <p className="text-[16px] text-white font-medium">{jobTitle}</p>
              <p
                className="text-[24px] text-stone-400 mt-1 tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {formatTime(elapsedTime)}
              </p>
            </>
          )}
        </div>

        {/* Camera Preview */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-[400px] rounded-2xl overflow-hidden border border-stone-800"
            style={{ aspectRatio: "4/3" }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Subtle overlay when connecting */}
            {status === "connecting" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 size={32} className="text-white animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center mb-6">
          {aiSpeaking ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[13px] text-amber-400">
                AI is speaking...
              </span>
              {/* Simple audio visualizer */}
              <div className="flex items-center gap-[2px] h-3 ml-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-amber-400"
                    style={{
                      height: `${Math.random() * 10 + 4}px`,
                      animation: `pulse 0.${3 + i}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] text-emerald-400">
                AI is listening...
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              isMuted
                ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                : "bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700"
            }`}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={endInterview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            <PhoneOff size={16} />
            End Interview
          </button>
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="flex-1 min-h-0">
            <p className="text-[13px] text-stone-500 font-medium mb-3">
              Live Transcript
            </p>
            <div
              className="rounded-xl overflow-y-auto space-y-2 pr-2"
              style={{
                background: "#1A1A1A",
                maxHeight: "300px",
                padding: "16px",
              }}
            >
              {transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${entry.role === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[11px] text-stone-600 mb-0.5">
                    {entry.role === "assistant" ? "Interviewer" : "You"}
                  </span>
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[85%] ${
                      entry.role === "user"
                        ? "bg-amber-500/10 text-amber-200"
                        : "bg-stone-800 text-stone-300"
                    }`}
                  >
                    <p className="text-[13px] leading-relaxed">{entry.text}</p>
                  </div>
                  <span className="text-[10px] text-stone-700 mt-0.5">
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-stone-700 mt-8">
          Powered by Claimless
        </p>
      </div>
    </div>
  );
}
