import { connection } from "next/server";
import { listConversations } from "@/lib/server/conversations";

export async function GET() {
  await connection();
  return Response.json({ conversations: listConversations() });
}
