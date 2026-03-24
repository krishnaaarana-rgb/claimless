import { NextRequest } from "next/server";

/**
 * Validates that a request is from an internal source.
 *
 * Checks for an `x-internal-secret` header matching the INTERNAL_API_SECRET env var.
 * If INTERNAL_API_SECRET is not set, allows all requests (development fallback).
 */
export function validateInternalRequest(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;

  // Development fallback: if no secret configured, allow all requests
  if (!secret) {
    return true;
  }

  const headerValue = request.headers.get("x-internal-secret");
  return headerValue === secret;
}
