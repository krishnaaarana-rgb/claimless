/**
 * Loom transcript scraper.
 *
 * Technique: fetch the Loom share page HTML, extract the transcript
 * source URL from the embedded JSON, fetch the transcript, and
 * concatenate phrases into plain text.
 */

export interface LoomTranscriptResult {
  transcript: string;
  durationSeconds: number | null;
}

/**
 * Given a Loom share URL, fetch and return the video transcript.
 * Returns null if the URL is invalid or transcript isn't available.
 */
export async function scrapeLoomTranscript(
  loomUrl: string
): Promise<LoomTranscriptResult | null> {
  try {
    // Normalise URL — accept both loom.com/share/xxx and full URLs
    const url = loomUrl.includes("loom.com")
      ? loomUrl
      : `https://www.loom.com/share/${loomUrl}`;

    // 1. Fetch the Loom share page HTML
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    // 2. Extract transcript source URL from the page
    const sourceMatch = html.match(/"source_url":"([^"]+)"/);
    const transcriptMatch = html.match(/"transcript_url":"([^"]+)"/);

    const rawUrl = sourceMatch?.[1] || transcriptMatch?.[1];
    if (!rawUrl) return null;

    const transcriptUrl = rawUrl.replace(/\\/g, "");
    if (!transcriptUrl) return null;

    // SSRF protection: only fetch from known Loom CDN domains
    try {
      const parsedUrl = new URL(transcriptUrl);
      const allowedHosts = ["cdn.loom.com", "www.loom.com", "loom.com"];
      const isLoomDomain = allowedHosts.some(
        (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith(`.${h}`)
      );
      const isS3 = parsedUrl.hostname.endsWith(".amazonaws.com");
      if (!isLoomDomain && !isS3) {
        console.warn("[loom] Blocked non-Loom transcript URL:", parsedUrl.hostname);
        return null;
      }
    } catch {
      return null;
    }

    // 3. Extract duration if available
    let durationSeconds: number | null = null;
    const durationMatch = html.match(/"duration_in_seconds":(\d+)/);
    if (durationMatch) {
      durationSeconds = parseInt(durationMatch[1], 10);
    }

    // 4. Fetch the transcript JSON
    const transcriptRes = await fetch(transcriptUrl);
    if (!transcriptRes.ok) return null;
    const transcriptData = await transcriptRes.json();

    // 5. Concatenate phrases into plain text
    let transcript = "";
    if (transcriptData.phrases && Array.isArray(transcriptData.phrases)) {
      transcript = transcriptData.phrases
        .map((phrase: { value: string }) => phrase.value)
        .join(" ");
    } else if (typeof transcriptData === "string") {
      transcript = transcriptData;
    }

    if (!transcript.trim()) return null;

    return { transcript: transcript.trim(), durationSeconds };
  } catch (err) {
    console.error("[loom] Scrape failed:", err);
    return null;
  }
}
