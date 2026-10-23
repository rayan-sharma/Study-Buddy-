import { connection } from "next/server";
import { hasBearer } from "@/lib/server/auth";
import { currentPlan } from "@/lib/server/study";

// The voice agent asks at the start of each call what this session is about (same secret as transcripts).
export async function GET(req: Request) {
  await connection();
  if (!hasBearer(req, "INGEST_SECRET")) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ plan: currentPlan() ?? null });
}
