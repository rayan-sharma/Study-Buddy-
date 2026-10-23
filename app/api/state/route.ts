import { connection } from "next/server";
import { listNotes, listTasks } from "@/lib/server/board";
import { lineAddress } from "@/lib/server/calls";
import { activeSession, nextCommitment } from "@/lib/server/study";

// Everything /Dashboard needs in one poll.
export async function GET() {
  await connection(); // SQLite reads are synchronous; opt out of prerendering explicitly.
  return Response.json({
    tasks: listTasks(),
    notes: listNotes(),
    nextCommitment: nextCommitment() ?? null,
    activeSession: activeSession() ?? null,
    callLine: lineAddress(),
  });
}
