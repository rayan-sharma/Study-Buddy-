import { connection } from "next/server";
import { createTask, listTasks, taskCreate } from "@/lib/server/board";
import { parseBody } from "@/lib/server/http";

export async function GET() {
  await connection();
  return Response.json({ tasks: listTasks() });
}

export async function POST(req: Request) {
  const body = await parseBody(req, taskCreate);
  if ("error" in body) return body.error;
  return Response.json({ task: createTask(body.data) }, { status: 201 });
}
