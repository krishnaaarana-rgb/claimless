"use client";

export function TranscriptDownload({ transcript, candidateName }: { transcript: string; candidateName: string }) {
  return (
    <button
      onClick={() => {
        const blob = new Blob([transcript], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcript-${candidateName}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="text-[12px] font-medium text-[#9B9A97] hover:text-[#2383E2] transition-colors"
    >
      Download .txt
    </button>
  );
}
