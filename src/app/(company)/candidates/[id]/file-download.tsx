"use client";

export function FileDownloadRow({
  label,
  bucket,
  path,
  size,
  inline,
}: {
  label: string;
  bucket: string;
  path: string;
  size?: number;
  inline?: boolean;
}) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(
      `/api/files?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`
    );
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  };

  if (inline) {
    return (
      <a
        href="#"
        onClick={handleClick}
        className="block text-[13px] text-[#2383E2] hover:underline"
      >
        {label}
        {size != null && (
          <span className="text-[#9B9A97] text-[11px] ml-1">
            ({(size / 1024).toFixed(0)}KB)
          </span>
        )}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 px-0 py-2.5 border-b border-[#F7F6F3]">
      <span className="text-[13px] text-[#9B9A97] w-28 shrink-0">File</span>
      <a
        href="#"
        onClick={handleClick}
        className="text-[13px] text-[#2383E2] hover:underline"
      >
        {label}
        {size != null && (
          <span className="text-[#9B9A97] text-[11px] ml-1">
            ({(size / 1024).toFixed(0)}KB)
          </span>
        )}
      </a>
    </div>
  );
}
