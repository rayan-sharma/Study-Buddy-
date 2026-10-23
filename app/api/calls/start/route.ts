import { z } from "zod";
import { startCall } from "@/lib/server/calls";
import { parseBody } from "@/lib/server/http";

const startInput = z.object({ commitment_id: z.string().min(1).optional() });

// "Start call" on /study/[id]: starts the session and says how to reach the agent.
export async function POST(req: Request) {
  const body = await parseBody(req, startInput);
  if ("error" in body) return body.error;
  return Response.json(await startCall(body.data.commitment_id));
}
