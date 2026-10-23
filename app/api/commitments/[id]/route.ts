import type { NextRequest } from "next/server";
import { notFound, parseBody } from "@/lib/server/http";
import { cancelCommitment, commitmentAction, getCommitment, snoozeCommitment } from "@/lib/server/study";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/commitments/[id]">) {
  const commitment = getCommitment((await ctx.params).id);
  return commitment ? Response.json({ commitment }) : notFound();
}

// { action: "snooze", minutes } or { action: "cancel" }
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/commitments/[id]">) {
  const { id } = await ctx.params;
  const body = await parseBody(req, commitmentAction);
  if ("error" in body) return body.error;
  const commitment =
    body.data.action === "snooze" ? snoozeCommitment(id, body.data.minutes) : cancelCommitment(id);
  return commitment ? Response.json({ commitment }) : notFound();
}
