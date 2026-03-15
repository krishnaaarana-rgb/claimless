import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/files?bucket=candidate-files&path=resumes/xxx/file.pdf
 * Generate a fresh signed URL for a stored file.
 */
export async function GET(request: NextRequest) {
  const bucket = request.nextUrl.searchParams.get("bucket");
  const path = request.nextUrl.searchParams.get("path");

  if (!bucket || !path) {
    return NextResponse.json({ error: "bucket and path required" }, { status: 400 });
  }

  if (!["candidate-files", "job-files"].includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
