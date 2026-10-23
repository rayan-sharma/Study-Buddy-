// Helpers shared by route handlers.
import type { z } from "zod";

export function badRequest(message: string, issues?: unknown) {
  return Response.json({ error: message, issues }, { status: 400 });
}

export const notFound = () => Response.json({ error: "not found" }, { status: 404 });

// Parse a JSON body against a zod schema; returns either the data or a 400 response.
export async function parseBody<S extends z.ZodType>(
  req: Request,
  schema: S
): Promise<{ data: z.infer<S> } | { error: Response }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: badRequest("body must be JSON") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { error: badRequest("invalid body", parsed.error.issues) };
  return { data: parsed.data };
}

export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
