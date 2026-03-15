"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#37352F", marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: "#9B9A97", marginBottom: 24 }}>An unexpected error occurred. Our team has been notified.</p>
          <button
            onClick={reset}
            style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #E9E9E7", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
