import { connection } from "next/server";
import { createNote, listNotes, noteCreate } from "@/lib/server/board";
import { parseBody } from "@/lib/server/http";

export async function GET() {
  await connection();
  return Response.json({ notes: listNotes() });
}

export async function POST(req: Request) {
  const body = await parseBody(req, noteCreate);
  if ("error" in body) return body.error;
  return Response.json({ note: createNote(body.data) }, { status: 201 });
}
