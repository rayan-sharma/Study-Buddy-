// Answers a student's question using what their recent study calls covered. Server-only.
import { getConversation, listConversations, type Message } from "./conversations";
import { openai, textModel } from "./openai";

const SYSTEM = `You are Study Buddy, an AI study partner replying by text message.
Use the student's recent study-call summaries below when they are relevant, and say so ("on Thursday's call we...").
Be Socratic and brief: at most 3 short sentences, plain text, no markdown or bullet points.
If you don't know something about the student, don't invent it.`;

export async function answerFollowUp(question: string, thread: Message[] = []): Promise<string> {
  const calls = listConversations()
    .filter((c) => c.source === "facetime" && c.summary_status === "done")
    .slice(0, 3)
    .map((c) => getConversation(c.id))
    .filter((c) => !!c?.summary)
    .map((c) => `- ${new Date(c!.started_at).toDateString()}: ${c!.summary!.title}. ${c!.summary!.summary}`);

  const response = await openai().responses.create({
    model: textModel(),
    input: [
      { role: "system", content: `${SYSTEM}\n\nRecent study calls:\n${calls.join("\n") || "(none yet)"}` },
      ...thread.slice(-10).map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: question },
    ],
  });
  return response.output_text.trim().slice(0, 600);
}
