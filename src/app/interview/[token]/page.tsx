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
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface InterviewData {
  candidate_name: string;
  candidate_email: string;
  github_username: string | null;
  job_title: string;
  company_name: string;
  github_required: boolean;
  interview_duration: number;
}

type PageState = "loading" | "ready" | "expired" | "used" | "error";

export default function InterviewPrepPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState<InterviewData | null>(null);

  // Media state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animRef = useRef<number>(0);

  // Form state
  const [preferredName, setPreferredName] = useState("");
  const [starting, setStarting] = useState(false);

  // Fetch interview data
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/interview/${token}`);
        const json = await res.json();
        if (!res.ok) {
          if (json.error === "used") {
            setPageState("used");
          } else if (json.error === "expired") {
            setPageState("expired");
          } else {
            setPageState("error");
            setErrorMessage(json.message || json.error || "Invalid link");
          }
          return;
        }
        setData(json);
        setPreferredName(json.candidate_name || "");
        setPageState("ready");
      } catch {
        setPageState("error");
        setErrorMessage("Failed to load interview data");
      }
    })();
  }, [token]);

  // Setup camera + mic
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

      // Audio level monitoring
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
    if (pageState === "ready") {
      setupMedia();
    }
    return () => {
      cancelAnimationFrame(animRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState]);

  // Attach stream to video element when it changes
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
      await fetch(`/api/interview/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferred_name: preferredName.trim() || data?.candidate_name,
          start_interview: true,
        }),
      });
      // Stop the preview stream before navigating
      stream?.getTracks().forEach((t) => t.stop());
      router.push(`/interview/${token}/session`);
    } catch {
      setStarting(false);
    }
  };

  // Error / expired / used states
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF9" }}>
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageState === "expired") {
    return <StatusPage icon={<AlertCircle size={32} className="text-amber-600" />} title="Link Expired" message="This interview link has expired. Please contact the company for a new link." />;
  }

  if (pageState === "used") {
    return <StatusPage icon={<Check size={32} className="text-emerald-600" />} title="Interview Completed" message="This interview has already been completed. If you believe this is an error, please contact the company." />;
  }

  if (pageState === "error") {
    return <StatusPage icon={<AlertCircle size={32} className="text-red-500" />} title="Invalid Link" message={errorMessage} />;
  }

  const canStart = cameraReady && micReady && (!data?.github_required || !!data?.github_username);

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF9" }}>
      <div className="max-w-[960px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[13px] text-stone-400 mb-2 tracking-wide">
            Claimless
          </p>
          <h1 className="text-[22px] font-bold text-stone-900">
            Interview for {data?.job_title}
          </h1>
          <p className="text-[14px] text-stone-500 mt-1">
            at {data?.company_name}
          </p>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: Camera Preview */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <div className="relative aspect-[4/3] bg-stone-900">
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
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {mediaError && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center">
                    <CameraOff size={32} className="text-stone-500 mx-auto mb-3" />
                    <p className="text-[13px] text-stone-400 leading-relaxed">
                      {mediaError}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status indicators */}
            <div className="p-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                {cameraReady ? (
                  <Camera size={16} className="text-emerald-500" />
                ) : (
                  <CameraOff size={16} className="text-stone-400" />
                )}
                <span className={`text-[13px] ${cameraReady ? "text-emerald-600" : "text-stone-400"}`}>
                  {cameraReady ? "Camera ready" : "No camera"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {micReady ? (
                  <Mic size={16} className="text-emerald-500" />
                ) : (
                  <MicOff size={16} className="text-stone-400" />
                )}
                <span className={`text-[13px] ${micReady ? "text-emerald-600" : "text-stone-400"}`}>
                  {micReady ? "Mic ready" : "No mic"}
                </span>
                {/* Audio level meter */}
                {micReady && (
                  <div className="flex items-end gap-[2px] h-3 ml-1">
                    {[0.15, 0.3, 0.45, 0.6, 0.75].map((threshold, i) => (
                      <div
                        key={i}
                        className="w-[3px] rounded-full transition-all duration-75"
                        style={{
                          height: `${(i + 1) * 3}px`,
                          background: audioLevel > threshold ? "#059669" : "#D6D3D1",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Instructions + Setup */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col">
            <h2 className="text-[15px] font-semibold text-stone-900 mb-4">
              Before you begin
            </h2>

            {/* Checklist */}
            <div className="space-y-3 mb-6">
              <CheckItem done={cameraReady} label="Camera is working" />
              <CheckItem done={micReady} label="Microphone is working" />
              {data?.github_required !== undefined && (
                <CheckItem
                  done={!!data?.github_username}
                  label={
                    data?.github_username
                      ? `GitHub connected @${data.github_username}`
                      : data?.github_required
                        ? "Connect GitHub (Required)"
                        : "Connect GitHub (Optional)"
                  }
                  optional={!data?.github_required}
                />
              )}
            </div>

            {/* Preferred name */}
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Preferred name
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-[14px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="What should we call you?"
              />
              <p className="text-[12px] text-stone-400 mt-1">
                This is how the interviewer will address you
              </p>
            </div>

            {/* What to expect */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-stone-900 mb-2">
                What to expect
              </h3>
              <ul className="space-y-2">
                <ExpectItem text={`${data?.interview_duration || 15}-minute conversation`} />
                <ExpectItem text="Questions about your experience and the role" />
                <ExpectItem text="Be yourself -- there are no trick questions" />
              </ul>
            </div>

            {/* GitHub connect button */}
            {!data?.github_username && (
              <button
                onClick={() => {
                  window.location.href = `/api/interview/${token}/github`;
                }}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors mb-4 ${
                  data?.github_required
                    ? "text-white hover:opacity-90"
                    : "border border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
                style={data?.github_required ? { background: "#D97706" } : undefined}
              >
                <Github size={14} />
                {data?.github_required
                  ? "Connect GitHub (Required)"
                  : "Connect GitHub (Optional)"}
              </button>
            )}

            <div className="flex-1" />
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="px-8 py-3 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: "#D97706" }}
          >
            {starting ? (
              "Starting..."
            ) : (
              <span className="flex items-center gap-2">
                Start Interview <ChevronRight size={18} />
              </span>
            )}
          </button>
          {!canStart && !starting && (
            <p className="text-[12px] text-stone-400 mt-3">
              {!cameraReady || !micReady
                ? "Enable your camera and microphone to continue"
                : "Connect your GitHub account to continue"}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-stone-400 mt-10">
          Powered by Claimless
        </p>
      </div>
    </div>
  );
}

function CheckItem({
  done,
  label,
  optional,
}: {
  done: boolean;
  label: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
          done
            ? "bg-emerald-50 text-emerald-600"
            : "border border-stone-300"
        }`}
      >
        {done && <Check size={12} strokeWidth={3} />}
      </div>
      <span
        className={`text-[13px] ${done ? "text-stone-700" : "text-stone-500"}`}
      >
        {label}
        {optional && !done && (
          <span className="text-stone-400 ml-1">{"--"} helps us ask better questions</span>
        )}
      </span>
    </div>
  );
}

function ExpectItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-stone-600">
      <span className="text-stone-400 shrink-0 mt-0.5">{"→"}</span>
      {text}
    </li>
  );
}

function StatusPage({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF9" }}>
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h1 className="text-[20px] font-bold text-stone-900 mb-2">{title}</h1>
        <p className="text-[14px] text-stone-500 leading-relaxed">{message}</p>
        <p className="text-[12px] text-stone-400 mt-8">Powered by Claimless</p>
      </div>
    </div>
  );
}
