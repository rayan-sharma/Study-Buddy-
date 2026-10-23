import type { NextRequest } from "next/server";
import { deleteNote, notePatch, updateNote } from "@/lib/server/board";
import { badRequest, notFound, parseBody, parseId } from "@/lib/server/http";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/notes/[id]">) {
  const id = parseId((await ctx.params).id);
  if (!id) return badRequest("invalid id");
  const body = await parseBody(req, notePatch);
  if ("error" in body) return body.error;
  const note = updateNote(id, body.data);
  return note ? Response.json({ note }) : notFound();
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/notes/[id]">) {
  const id = parseId((await ctx.params).id);
  if (!id) return badRequest("invalid id");
  return deleteNote(id) ? new Response(null, { status: 204 }) : notFound();
}
