import { parseBody } from "@/lib/server/http";
import { scheduleInput, scheduleStudy, StudyError } from "@/lib/server/study";

// Schedule a study session; the worker sends a push notification when it is due.
export async function POST(req: Request) {
  const body = await parseBody(req, scheduleInput);
  if ("error" in body) return body.error;
  try {
    return Response.json({ commitment: scheduleStudy(body.data) }, { status: 201 });
  } catch (err) {
    if (err instanceof StudyError) return Response.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
