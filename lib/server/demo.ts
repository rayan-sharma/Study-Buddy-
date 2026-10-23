// One-click demo: a linear algebra session starts now, the student gets a "study time" text, and the
// browser opens FaceTime to the agent, which opens the call on that topic (see /api/agent/context).
import { callUrl, lineAddress } from "./calls";
import { callLinkText } from "./chert";
import { textStudent, type TextResult } from "./imessage";
import { scheduleStudy, startSession } from "./study";

const TOPIC = "Linear algebra";

export async function runDemo() {
  // Starting the session right away cancels its reminder job, so the worker won't text a second time.
  const commitment = scheduleStudy({ topic: TOPIC, start_at: new Date().toISOString(), duration_minutes: 25 });
  startSession(commitment.id);

  let text: TextResult;
  try {
    text = await textStudent(
      `Hey, it's our scheduled time to study! Let's work on ${TOPIC.toLowerCase()}. ${callLinkText()}`,
      `demo:${commitment.id}`
    );
  } catch (err) {
    text = { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  return { commitment, text, call: { url: callUrl(), line: lineAddress() } };
}
