// Shared-secret check for machine-to-machine routes (the voice agent posting transcripts).
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "./env";

const digest = (s: string) => createHash("sha256").update(s).digest();

export function hasBearer(req: Request, secretName: string): boolean {
  const secret = env(secretName);
  const header = req.headers.get("authorization") ?? "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  // Compare fixed-length digests so the check takes the same time for any input.
  return timingSafeEqual(digest(header.slice(7)), digest(secret));
}
