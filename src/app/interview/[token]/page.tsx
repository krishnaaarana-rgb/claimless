"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Mic,
  CameraOff,
  MicOff,
  Github,
  Check,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";

interface InterviewData {
  candidate_name: string;
  candidate_email: string;
  github_username: string | null;
  job_title: string;
  company_name: string;
  company_logo_url: string | null;
  company_color: string;
  github_required: boolean;
  interview_duration: number;
}

function isValidGithubUsername(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return false;
  const lower = value.toLowerCase();
  if (lower.includes("linkedin.com") || lower.includes("localhost") || lower.includes("http")) return false;
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(value.trim());
}

type PageState = "loading" | "ready" | "expired" | "used" | "active" | "error";

export default function InterviewPrepPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<InterviewData | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animRef = useRef<number>(0);

  const [preferredName, setPreferredName] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/interview/${token}`);
        const json = await res.json();
        if (!res.ok) {
          if (json.error === "completed") setPageState("used");
          else if (json.error === "expired") setPageState("expired");
          else {
            setPageState("error");
            setErrorMessage(json.message || json.error || "Invalid link");
          }
          return;
        }
        setData(json);
        setPreferredName(json.candidate_name || "");
        setPageState(json.token_status === "active" ? "active" : "ready");
      } catch {
        setPageState("error");
        setErrorMessage("Failed to load interview data");
      }
    })();
  }, [token]);

  const setupMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      setCameraReady(true);
      setMicReady(true);
      setMediaError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animRef.current = requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch {
      setMediaError(
        "Camera or microphone access denied. Please allow access in your browser settings and refresh."
      );
    }
  }, []);

  useEffect(() => {
    if (pageState === "ready") setupMedia();
    return () => {
      cancelAnimationFrame(animRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStart = async () => {
    if (!cameraReady || !micReady) return;
    if (data?.github_required && !data?.github_username) return;

    setStarting(true);
    try {
      const name = preferredName.trim() || data?.candidate_name || "";
      await fetch(`/api/interview/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_name: name }),
      });
      stream?.getTracks().forEach((t) => t.stop());
      router.push(`/interview/${token}/session?name=${encodeURIComponent(name)}`);
    } catch {
      setStarting(false);
    }
  };

  // --- Status pages ---
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-[#37352F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageState === "expired") {
    return (
      <StatusPage
        icon={<Clock size={24} className="text-[#9B9A97]" />}
        title="Link Expired"
        message="This interview link has expired. Please contact the company for a new link."
      />
    );
  }

  if (pageState === "used") {
    return (
      <StatusPage
        icon={<Check size={24} className="text-emerald-600" />}
        title="Interview Completed"
        message="This interview has already been completed. If you believe this is an error, please contact the company."
        linkHref={`/interview/${token}/complete`}
        linkText="View completion page"
      />
    );
  }

  if (pageState === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm px-6">
          <div className="w-12 h-12 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto mb-5">
            <Mic size={20} className="text-[#37352F]" />
          </div>
          <h1 className="text-[18px] font-semibold text-[#37352F] mb-2">Interview in Progress</h1>
          <p className="text-[14px] text-[#9B9A97] leading-relaxed mb-8">
            Your interview is currently active. Rejoin below.
          </p>
          <a
            href={`/interview/${token}/session`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-medium text-white bg-[#37352F] hover:bg-[#2C2B28] transition-colors"
          >
            Rejoin Interview <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <StatusPage
        icon={<AlertCircle size={24} className="text-red-500" />}
        title="Invalid Link"
        message={errorMessage}
      />
    );
  }

  const githubConnected = isValidGithubUsername(data?.github_username);
  const canStart = cameraReady && micReady && (!data?.github_required || githubConnected);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[880px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full" style={{ background: data?.company_color || "#059669" }} />
            <span className="text-[13px] text-[#9B9A97] font-medium">{data?.company_name || "Interview"}</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#37352F] tracking-tight">
            {data?.job_title}
          </h1>
          <p className="text-[15px] text-[#9B9A97] mt-1">
            {data?.company_name}
          </p>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Left: Camera Preview (3 cols) */}
          <div className="md:col-span-3">
            <div className="rounded-xl overflow-hidden border border-[#E9E9E7] bg-[#18181B]">
              <div className="relative aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!cameraReady && !mediaError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {mediaError && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <CameraOff size={28} className="text-white/30 mx-auto mb-3" />
                      <p className="text-[13px] text-white/50 leading-relaxed max-w-[280px]">
                        {mediaError}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Device status bar */}
              <div className="px-4 py-3 flex items-center gap-5 bg-[#18181B]">
                <div className="flex items-center gap-2">
                  {cameraReady ? (
                    <Camera size={14} className="text-emerald-400" />
                  ) : (
                    <CameraOff size={14} className="text-white/30" />
                  )}
                  <span className={`text-[12px] ${cameraReady ? "text-emerald-400" : "text-white/30"}`}>
                    Camera
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {micReady ? (
                    <Mic size={14} className="text-emerald-400" />
                  ) : (
                    <MicOff size={14} className="text-white/30" />
                  )}
                  <span className={`text-[12px] ${micReady ? "text-emerald-400" : "text-white/30"}`}>
                    Mic
                  </span>
                  {micReady && (
                    <div className="flex items-end gap-[2px] h-3 ml-1">
                      {[0.15, 0.3, 0.45, 0.6, 0.75].map((threshold, i) => (
                        <div
                          key={i}
                          className="w-[2px] rounded-full transition-all duration-75"
                          style={{
                            height: `${(i + 1) * 2.5}px`,
                            background: audioLevel > threshold ? "#34D399" : "rgba(255,255,255,0.15)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Setup (2 cols) */}
          <div className="md:col-span-2 flex flex-col">
            {/* Checklist */}
            <div className="mb-6">
              <h2 className="text-[13px] font-semibold text-[#37352F] uppercase tracking-wide mb-3">
                Checklist
              </h2>
              <div className="space-y-2.5">
                <CheckItem done={cameraReady} label="Camera is working" />
                <CheckItem done={micReady} label="Microphone is working" />
                {data?.github_required !== undefined && (
                  <CheckItem
                    done={githubConnected}
                    label={
                      githubConnected
                        ? `GitHub connected`
                        : data?.github_required
                          ? "Connect GitHub"
                          : "Connect GitHub"
                    }
                    subtitle={githubConnected ? `@${data?.github_username}` : undefined}
                    optional={!data?.github_required}
                  />
                )}
              </div>
            </div>

            {/* GitHub connect */}
            {!githubConnected && (
              <button
                onClick={() => {
                  window.location.href = `/api/interview/${token}/github`;
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors mb-6 border border-[#E9E9E7] text-[#37352F] hover:bg-[#F7F6F3]"
              >
                <Github size={14} />
                Connect GitHub {data?.github_required ? "" : "(optional)"}
              </button>
            )}

            {/* Preferred name */}
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
                Preferred name
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full rounded-lg border border-[#E9E9E7] px-3.5 py-2.5 text-[14px] text-[#37352F] placeholder:text-[#D3D1CB] focus:outline-none focus:ring-2 focus:ring-[#37352F]/10 focus:border-[#37352F]/30 transition-colors bg-white"
                placeholder="What should we call you?"
              />
            </div>

            {/* What to expect */}
            <div className="border-t border-[#E9E9E7] pt-5">
              <h3 className="text-[13px] font-semibold text-[#37352F] uppercase tracking-wide mb-3">
                What to expect
              </h3>
              <ul className="space-y-2">
                <ExpectItem text={`${data?.interview_duration || 15}-minute conversation`} />
                <ExpectItem text="Questions about your experience and the role" />
                <ExpectItem text="Be yourself — no trick questions" />
              </ul>
            </div>
          </div>
        </div>

        {/* Start Interview */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="group px-8 py-3.5 rounded-lg text-[15px] font-semibold text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: data?.company_color || "#37352F" }}
          >
            {starting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Start Interview
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </button>
          {!canStart && !starting && (
            <p className="text-[12px] text-[#9B9A97] mt-3">
              {!cameraReady || !micReady
                ? "Enable your camera and microphone to continue"
                : "Connect your GitHub account to continue"}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-[#D3D1CB] mt-16">
          Powered by Claimless
        </p>
      </div>
    </div>
  );
}

function CheckItem({
  done,
  label,
  subtitle,
  optional,
}: {
  done: boolean;
  label: string;
  subtitle?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
          done
            ? "bg-emerald-500 text-white"
            : "border-[1.5px] border-[#D3D1CB]"
        }`}
      >
        {done && <Check size={10} strokeWidth={3} />}
      </div>
      <div className="flex flex-col">
        <span className={`text-[13px] ${done ? "text-[#37352F]" : "text-[#9B9A97]"}`}>
          {label}
          {optional && !done && (
            <span className="text-[#D3D1CB] ml-1">· optional</span>
          )}
        </span>
        {subtitle && (
          <span className="text-[11px] text-[#9B9A97]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

function ExpectItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] text-[#9B9A97]">
      <span className="text-[#D3D1CB] shrink-0 mt-0.5 text-[10px]">{"●"}</span>
      {text}
    </li>
  );
}

function StatusPage({
  icon,
  title,
  message,
  linkHref,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm px-6">
        <div className="w-12 h-12 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto mb-5">
          {icon}
        </div>
        <h1 className="text-[18px] font-semibold text-[#37352F] mb-2">{title}</h1>
        <p className="text-[14px] text-[#9B9A97] leading-relaxed">{message}</p>
        {linkHref && linkText && (
          <a
            href={linkHref}
            className="inline-block mt-5 text-[13px] text-[#37352F] font-medium hover:underline underline-offset-2"
          >
            {linkText} →
          </a>
        )}
        <p className="text-[11px] text-[#D3D1CB] mt-12">Powered by Claimless</p>
      </div>
    </div>
  );
}
