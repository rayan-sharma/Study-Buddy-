import type { NextRequest } from "next/server";
import { deleteTask, taskPatch, updateTask } from "@/lib/server/board";
import { badRequest, notFound, parseBody, parseId } from "@/lib/server/http";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  const id = parseId((await ctx.params).id);
  if (!id) return badRequest("invalid id");
  const body = await parseBody(req, taskPatch);
  if ("error" in body) return body.error;
  const task = updateTask(id, body.data);
  return task ? Response.json({ task }) : notFound();
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  const id = parseId((await ctx.params).id);
  if (!id) return badRequest("invalid id");
  return deleteTask(id) ? new Response(null, { status: 204 }) : notFound();
}
