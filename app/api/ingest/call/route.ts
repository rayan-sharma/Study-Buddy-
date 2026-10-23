import { hasBearer } from "@/lib/server/auth";
import { callIngest, ingestCall } from "@/lib/server/conversations";
import { parseBody } from "@/lib/server/http";

// The voice agent (my-agent) posts each FaceTime call's transcript here when the call ends.
export async function POST(req: Request) {
  if (!hasBearer(req, "INGEST_SECRET")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await parseBody(req, callIngest);
  if ("error" in body) return body.error;
  const result = ingestCall(body.data);
  return Response.json(result, { status: result.created ? 201 : 200 });
}
