import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

interface ApiKeyValidation {
  valid: boolean;
  companyId?: string;
}

export async function validateApiKey(
  key: string
): Promise<ApiKeyValidation> {
  if (!key || !key.startsWith("clm_")) {
    return { valid: false };
  }

  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("api_keys")
    .select("id, company_id, is_active, expires_at")
    .eq("key_hash", keyHash)
    .single();

  if (!data || !data.is_active) {
    return { valid: false };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});

  return { valid: true, companyId: data.company_id };
}

export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
} {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const key = `clm_${randomBytes}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12) + "...";
  return { key, hash, prefix };
}
