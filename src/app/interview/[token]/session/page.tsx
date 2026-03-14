"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Vapi from "@vapi-ai/web";
import {
  Mic,
  MicOff,
  PhoneOff,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";

interface TranscriptEntry {
  role: "assistant" | "user";
  text: string;
  timestamp: Date;
}

type SessionStatus = "loading" | "connecting" | "active" | "ended" | "error";

const SILENCE_WARN_SECONDS = 15;

const CLOSING_PHRASES = [
  "we'll be in touch",
  "enjoyed this conversation",
  "that wraps up",
  "that's all the time",
  "all done",
  "thanks for your time",
  "good luck",
  "we'll get back to you",
  "best of luck",
  "pleasure chatting",
  "really enjoyed",
  "we're all done",
  "that's everything",
];

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
  const [candidateName, setCandidateName] = useState("");
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  // Silence warning
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());

  // End-of-interview countdown
  const [endCountdown, setEndCountdown] = useState<number | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const closingDetectedRef = useRef(false);
  const aiSpeakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset silence timer on any activity
  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSilenceSeconds(0);
  }, []);

  // Camera (video only — Vapi handles audio)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      })
      .catch(() => {
        setCameraActive(false);
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

  // Main timer — handles elapsed time + silence tracking
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);

        // Track silence
        const silenceDuration = Math.floor(
          (Date.now() - lastActivityRef.current) / 1000
        );
        setSilenceSeconds(silenceDuration);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // End-of-interview countdown timer
  useEffect(() => {
    if (endCountdown === null) return;

    if (endCountdown <= 0) {
      vapiRef.current?.stop();
      return;
    }

    const timer = setTimeout(() => {
      setEndCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [endCountdown]);

  // Detect closing phrases in transcript
  useEffect(() => {
    if (
      transcript.length === 0 ||
      closingDetectedRef.current ||
      endCountdown !== null
    )
      return;

    const lastEntry = transcript[transcript.length - 1];
    if (lastEntry.role === "assistant") {
      const text = lastEntry.text.toLowerCase();
      const isClosing = CLOSING_PHRASES.some((phrase) =>
        text.includes(phrase)
      );
      if (isClosing) {
        closingDetectedRef.current = true;
        // Start 10-second countdown
        setEndCountdown(10);
      }
    }
  }, [transcript, endCountdown]);

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

      const { assistant_id, public_key, job_title, candidate_name } =
        await res.json();
      setJobTitle(job_title);
      setCandidateName(candidate_name || preferredName || "You");
      setStatus("connecting");

      const vapi = new Vapi(public_key);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setStatus("active");
        markActivity();
      });

      vapi.on("call-end", () => {
        setStatus("ended");
        setTimeout(() => router.push(`/interview/${token}/complete`), 2000);
      });

      vapi.on("speech-start", () => {
        setAiSpeaking(true);
        markActivity();
        // Safety timeout: reset aiSpeaking if speech-end never fires (30s max)
        if (aiSpeakingTimeoutRef.current) clearTimeout(aiSpeakingTimeoutRef.current);
        aiSpeakingTimeoutRef.current = setTimeout(() => setAiSpeaking(false), 30000);
      });
      vapi.on("speech-end", () => {
        if (aiSpeakingTimeoutRef.current) clearTimeout(aiSpeakingTimeoutRef.current);
        setAiSpeaking(false);
        markActivity();
      });

      vapi.on("message", (message) => {
        const msg = message as {
          type: string;
          transcriptType?: string;
          role?: "assistant" | "user";
          transcript?: string;
        };
        if (msg.type === "transcript" && msg.transcriptType === "final") {
          markActivity();
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
  }, [token, router, searchParams, markActivity]);

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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const silenceRemaining = 30 - silenceSeconds;
  const showSilenceWarning =
    status === "active" &&
    silenceSeconds >= SILENCE_WARN_SECONDS &&
    endCountdown === null;

  // --- Loading ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 size={24} className="text-[#2383E2] animate-spin" />
        <p className="text-[13px] text-[#9B9A97] mt-4 font-medium">
          Preparing your interview...
        </p>
      </div>
    );
  }

  // --- Error ---
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <PhoneOff size={20} className="text-red-500" />
        </div>
        <p className="text-[16px] text-[#37352F] font-semibold mb-2">
          Something went wrong
        </p>
        <p className="text-[13px] text-[#9B9A97] max-w-sm text-center mb-6">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-[#37352F] border border-[#E9E9E7] hover:bg-[#F7F6F3] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Ended ---
  if (status === "ended") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={28} className="text-emerald-500" />
        </div>
        <p className="text-[18px] text-[#37352F] font-semibold mb-1">
          Interview Complete
        </p>
        <p className="text-[13px] text-[#9B9A97]">
          Great job! Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#F7F6F3", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E9E9E7]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[14px] font-semibold text-[#37352F]">
              Claimless
            </span>
          </div>
          <span className="text-[#D3D1CB]">|</span>
          <span className="text-[13px] text-[#9B9A97]">{jobTitle}</span>
        </div>

        <div className="flex items-center gap-4">
          {status === "connecting" ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-[#2383E2] animate-spin" />
              <span className="text-[13px] text-[#9B9A97]">
                Connecting...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[12px] font-medium text-emerald-600">
                Live
              </span>
            </div>
          )}
          {status === "active" && (
            <div
              className="text-[13px] text-[#9B9A97] tabular-nums px-2.5 py-1 rounded-md bg-[#F7F6F3]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 p-3 gap-3">
        {/* Left: Video Area */}
        <div className="flex-[3] relative rounded-xl overflow-hidden bg-[#18181B]">
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${cameraActive ? "" : "hidden"}`}
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Camera off fallback */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <span className="text-[36px] font-semibold text-white/60">
                  {candidateName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-[13px] text-white/30">Camera is off</p>
              <button
                onClick={() => {
                  navigator.mediaDevices
                    .getUserMedia({ video: true, audio: false })
                    .then((stream) => {
                      if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setCameraActive(true);
                      }
                    })
                    .catch(() => {});
                }}
                className="mt-3 px-4 py-2 rounded-lg text-[12px] font-medium text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Silence warning — overlaid on video */}
          {showSilenceWarning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/90 backdrop-blur-sm shadow-lg">
                <Clock size={15} className="text-white shrink-0" />
                <span className="text-[13px] font-medium text-white">
                  Are you still there? Call ends in{" "}
                  <span
                    className="tabular-nums font-semibold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {silenceRemaining}s
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* End-of-interview countdown — overlaid on video */}
          {endCountdown !== null && endCountdown > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2383E2]/90 backdrop-blur-sm shadow-lg">
                <CheckCircle2 size={15} className="text-white shrink-0" />
                <span className="text-[13px] font-medium text-white">
                  Interview wrapping up in{" "}
                  <span
                    className="tabular-nums font-semibold"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {endCountdown}s
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Candidate name overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm">
              <span className="text-[12px] font-medium text-white/90">
                {candidateName}
              </span>
            </div>
          </div>

          {/* AI Interviewer card — floating bottom-right of video */}
          <div className="absolute bottom-4 right-4">
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                aiSpeaking
                  ? "bg-white/95 shadow-lg"
                  : "bg-white/80 backdrop-blur-sm shadow-md"
              }`}
            >
              {/* AI avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  aiSpeaking ? "bg-[#2383E2]" : "bg-[#E9E9E7]"
                }`}
              >
                {aiSpeaking ? (
                  <div className="flex items-center gap-[2px] h-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-[2.5px] rounded-full bg-white"
                        style={{
                          animation: `wave 0.${3 + i}s ease-in-out infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Mic size={16} className="text-[#9B9A97]" />
                )}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#37352F] leading-tight">
                  AI Interviewer
                </p>
                <p className="text-[11px] text-[#9B9A97] leading-tight">
                  {aiSpeaking ? "Speaking..." : "Listening"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Transcript Panel */}
        <div className="flex-[1.2] flex flex-col bg-white rounded-xl border border-[#E9E9E7] min-w-[280px] max-w-[380px]">
          {/* Transcript Header */}
          <div className="px-4 py-3 border-b border-[#E9E9E7] shrink-0">
            <h3 className="text-[12px] font-semibold text-[#37352F] uppercase tracking-wide">
              Live Transcript
            </h3>
          </div>

          {/* Transcript Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
            {transcript.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-10 h-10 rounded-full bg-[#F7F6F3] flex items-center justify-center mb-3">
                  <Mic size={18} className="text-[#D3D1CB]" />
                </div>
                <p className="text-[12px] text-[#D3D1CB]">
                  Transcript will appear here
                  <br />
                  as the conversation flows
                </p>
              </div>
            ) : (
              transcript.map((entry, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] font-semibold ${
                        entry.role === "assistant"
                          ? "text-[#2383E2]"
                          : "text-[#37352F]"
                      }`}
                    >
                      {entry.role === "assistant"
                        ? "Interviewer"
                        : candidateName}
                    </span>
                    <span className="text-[10px] text-[#D3D1CB] opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#37352F] leading-relaxed">
                    {entry.text}
                  </p>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="px-5 py-3 bg-white border-t border-[#E9E9E7]">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              isMuted
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-[#F7F6F3] text-[#37352F] border border-[#E9E9E7] hover:bg-[#EFEFEF]"
            }`}
          >
            {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={endInterview}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={15} />
            End Interview
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0% {
            height: 4px;
          }
          100% {
            height: 14px;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -8px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
