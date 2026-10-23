import type { NextRequest } from "next/server";
import { getConversation } from "@/lib/server/conversations";
import { notFound } from "@/lib/server/http";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/conversations/[id]">) {
  const conversation = getConversation((await ctx.params).id);
  return conversation ? Response.json({ conversation }) : notFound();
}
