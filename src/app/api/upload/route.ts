import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/upload
 * Upload a file to Supabase Storage.
 *
 * FormData fields:
 *   - file: File
 *   - bucket: "candidate-files" | "job-files"
 *   - path: optional subdirectory (e.g., application_id or job_id)
 */
export async function POST(request: NextRequest) {
  // Rate limit: 30 uploads per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { allowed } = await checkRateLimit(`upload:${ip}`, 30, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) || "candidate-files";
  const pathPrefix = (formData.get("path") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate bucket
  if (!["candidate-files", "job-files"].includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PDF, DOC, DOCX, PNG, JPG" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Generate unique filename
  const ext = file.name.split(".").pop() || "pdf";
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  const storagePath = pathPrefix
    ? `${pathPrefix}/${timestamp}-${safeName}`
    : `${timestamp}-${safeName}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[upload] Storage error:", error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }

  // Generate a signed URL (valid for 7 days)
  const { data: urlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 7 * 24 * 60 * 60);

  return NextResponse.json({
    success: true,
    path: data.path,
    bucket,
    filename: file.name,
    size: file.size,
    type: file.type,
    url: urlData?.signedUrl || null,
  });
}
