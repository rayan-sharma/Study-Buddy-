import { runDemo } from "@/lib/server/demo";

// Dashboard "Demo" button: start a linear algebra session, text the student, return the call link.
export async function POST() {
  return Response.json(await runDemo());
}
