import { connection } from "next/server";
import { listNotes, listTasks } from "@/lib/server/board";

// Everything /Dashboard needs in one poll.
export async function GET() {
  await connection(); // SQLite reads are synchronous; opt out of prerendering explicitly.
  return Response.json({ tasks: listTasks(), notes: listNotes() });
}
