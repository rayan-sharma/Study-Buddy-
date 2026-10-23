// Chert iMessage on a shared FaceTime line (API only): send texts to the verified phone and read replies.
// Limits from Chert: verified phone only, text only, 10 messages/hour on trial (100 for the hackathon).
// Server-only. Without CHERT_API_KEY every call reports "not configured" and callers fall back.
import { randomUUID } from "node:crypto";
import { env } from "./env";
import { lineAddress } from "./calls";

// Overridable for local testing against a stand-in server.
const base = () => env("CHERT_API_BASE") ?? "https://facetime.trychert.com/api/v1";

export type ChertMessage = {
  id: string;
  direction: "inbound" | "outbound" | "unknown";
  text: string;
  handle: string | null; // the other party's phone or email
  at: string;
};

export class ChertError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export const chertConfigured = () => !!env("CHERT_API_KEY");

async function request(path: string, init: RequestInit = {}) {
  const key = env("CHERT_API_KEY");
  if (!key) throw new ChertError("CHERT_API_KEY is not set");
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${key}`, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const detail = typeof body === "object" && body ? JSON.stringify(body).slice(0, 300) : String(body).slice(0, 300);
    throw new ChertError(`Chert ${init.method ?? "GET"} ${path} failed (${res.status}): ${detail}`, res.status);
  }
  return body;
}

// Chert's list responses may wrap items as {data: [...]}, {lines|messages|items: [...]} or a bare array.
function items(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    for (const key of ["data", "lines", "messages", "items", "results"]) {
      const value = (body as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

const str = (...values: unknown[]) => values.find((v): v is string => typeof v === "string" && v.length > 0);
const digits = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");

export async function listLines() {
  return items(await request("/lines"));
}

let cachedLineId: string | undefined;

// CHERT_LINE_ID wins; otherwise the line whose number matches FACETIME_LINE_ADDRESS, else the first line.
export async function lineId(): Promise<string> {
  const configured = env("CHERT_LINE_ID");
  if (configured) return configured;
  if (cachedLineId) return cachedLineId;
  const lines = await listLines();
  const want = digits(lineAddress());
  const match =
    lines.find((l) => digits(str(l.address, l.phone_number, l.number, l.handle, l.receiving_number)) === want) ??
    lines[0];
  const id = match && str(match.id, match.line_id);
  if (!id) throw new ChertError("no line returned by GET /lines");
  cachedLineId = id;
  return id;
}

export async function sendText(recipient: string, text: string, idempotencyKey: string = randomUUID()) {
  const body = await request("/shared-messages", {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": idempotencyKey },
    body: JSON.stringify({ line_id: await lineId(), recipient, text }),
  });
  const record = (body && typeof body === "object" && "data" in body ? (body as { data: unknown }).data : body) as
    | Record<string, unknown>
    | null;
  return { id: (record && str(record.id, record.message_id)) ?? null, raw: body };
}

function normalize(m: Record<string, unknown>): ChertMessage | null {
  const id = str(m.id, m.message_id);
  if (!id) return null;
  const rawDirection = str(m.direction, m.type, m.kind)?.toLowerCase() ?? "";
  const direction = rawDirection.includes("in")
    ? "inbound"
    : rawDirection.includes("out")
      ? "outbound"
      : m.is_from_me === true || m.from_me === true
        ? "outbound"
        : m.is_from_me === false || m.from_me === false
          ? "inbound"
          : "unknown";
  return {
    id,
    direction,
    text: str(m.text, m.body, m.content, m.message) ?? "",
    handle: str(m.sender, m.from, m.handle, m.recipient, m.to) ?? null,
    at: str(m.created_at, m.received_at, m.sent_at, m.timestamp) ?? new Date().toISOString(),
  };
}

export async function listMessages(): Promise<ChertMessage[]> {
  return items(await request("/shared-messages"))
    .map(normalize)
    .filter((m): m is ChertMessage => !!m);
}

// A FaceTime Audio link to the agent's line, plus the number itself (iMessage makes it tappable).
export function callLinkText() {
  const line = lineAddress();
  return `Tap to call your study buddy: facetime-audio://${line} (or FaceTime ${line})`;
}

export const sameNumber = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && digits(a).slice(-10) === digits(b).slice(-10);
