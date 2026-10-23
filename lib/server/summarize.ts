// Turns a FaceTime call transcript into a summary and a Dashboard note. Server-only.
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { createNote } from "./board";
import { callSummary, getConversation, saveSummary } from "./conversations";
import { openai, textModel } from "./openai";
import { SUBJECTS } from "./subjects";

const SYSTEM = `You summarize a voice study session between a student and their AI study partner, for the student to read later.

Return:
- title: 3-6 words naming the main topic
- subject: the closest school subject from the allowed list
- summary: 2-3 plain sentences on what was studied and where the student ended up
- topicsCovered, strengths, areasForImprovement: short phrases, only what the transcript supports
- followUps: 1-3 questions the student could ask or practise next
- engagementScore, comprehensionScore: 0.0-1.0

Use only what is in the transcript. If the call was mostly greetings or setup, say so plainly and keep lists short or empty.`;

const summaryWithSubject = callSummary.extend({ subject: z.enum(SUBJECTS) });

export async function summarizeConversation(conversationId: string) {
  const conversation = getConversation(conversationId);
  if (!conversation) throw new Error(`conversation ${conversationId} not found`);
  if (!conversation.messages.length) return null;

  const transcript = conversation.messages
    .map((m) => `${m.role === "user" ? "Student" : "Study partner"}: ${m.text}`)
    .join("\n");

  const response = await openai().responses.parse({
    model: textModel(),
    input: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Transcript (${conversation.started_at}):\n${transcript}` },
    ],
    text: { format: zodTextFormat(summaryWithSubject, "call_summary") },
  });
  const parsed = response.output_parsed;
  if (!parsed) throw new Error("model returned no summary");

  const { subject, ...summary } = parsed;
  saveSummary(conversationId, summary);

  const lines = [summary.summary];
  if (summary.topicsCovered.length) lines.push(`Covered: ${summary.topicsCovered.join(", ")}`);
  if (summary.followUps.length) lines.push(`Next:\n${summary.followUps.map((q) => `- ${q}`).join("\n")}`);
  createNote({
    title: `Call: ${summary.title}`,
    subject,
    body: lines.join("\n\n"),
  });
  return summary;
}
