type CanvasCourse = {
  id: number;
  name: string;
  course_code?: string;
};

type CanvasAssignment = {
  id: number;
  name: string;
  due_at: string | null;
  html_url: string | null;
  points_possible: number | null;
};

class CanvasApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCanvasCourse(value: unknown): value is CanvasCourse {
  return (
    isRecord(value) &&
    Number.isInteger(value.id) &&
    typeof value.name === "string"
  );
}

function isCanvasAssignment(value: unknown): value is CanvasAssignment {
  return (
    isRecord(value) &&
    Number.isInteger(value.id) &&
    typeof value.name === "string" &&
    (typeof value.due_at === "string" || value.due_at === null) &&
    (typeof value.html_url === "string" || value.html_url === null) &&
    (typeof value.points_possible === "number" ||
      value.points_possible === null)
  );
}

function getCanvasBaseUrl() {
  const configuredUrl = process.env.CANVAS_BASE_URL;
  if (!configuredUrl) {
    throw new CanvasApiError(
      "Canvas is not configured yet. Set CANVAS_BASE_URL in your local environment.",
      503
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredUrl);
  } catch {
    throw new CanvasApiError("CANVAS_BASE_URL must be a valid URL.", 500);
  }

  if (
    baseUrl.protocol !== "https:" ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new CanvasApiError(
      "CANVAS_BASE_URL must be an HTTPS Canvas instance URL without credentials or query parameters.",
      500
    );
  }

  return baseUrl;
}

async function fetchCanvasArray(
  url: URL,
  token: string
): Promise<unknown[]> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new CanvasApiError(
      "Could not reach Canvas. Check the configured instance URL and try again.",
      502
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new CanvasApiError(
        "Canvas did not accept that access token. Check it and try again.",
        401
      );
    }
    if (response.status === 403) {
      throw new CanvasApiError(
        "Canvas denied access. The token may not have permission to read courses and assignments.",
        403
      );
    }
    throw new CanvasApiError(
      `Canvas returned an error while loading your dashboard (HTTP ${response.status}).`,
      502
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CanvasApiError("Canvas returned an unreadable response.", 502);
  }

  if (!Array.isArray(payload)) {
    throw new CanvasApiError("Canvas returned an unexpected response.", 502);
  }

  return payload;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const tokenMatch = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!tokenMatch) {
    return Response.json(
      { error: "Enter a Canvas access token to connect your account." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const baseUrl = getCanvasBaseUrl();
    const coursesUrl = new URL("/api/v1/courses", baseUrl);
    coursesUrl.searchParams.set("enrollment_state", "active");
    coursesUrl.searchParams.set("per_page", "100");

    const coursePayload = await fetchCanvasArray(coursesUrl, tokenMatch[1]);
    const courses = coursePayload.filter(isCanvasCourse);
    if (courses.length !== coursePayload.length) {
      throw new CanvasApiError(
        "Canvas returned course data in an unexpected format.",
        502
      );
    }

    const assignments: Array<CanvasAssignment & { courseId: number; courseName: string }> = [];
    for (let index = 0; index < courses.length; index += 5) {
      const batch = courses.slice(index, index + 5);
      const assignmentPayloads = await Promise.all(
        batch.map((course) => {
          const url = new URL(
            `/api/v1/courses/${course.id}/assignments`,
            baseUrl
          );
          url.searchParams.set("bucket", "upcoming");
          url.searchParams.set("per_page", "100");
          return fetchCanvasArray(url, tokenMatch[1]);
        })
      );

      assignmentPayloads.forEach((payload, batchIndex) => {
        if (!payload.every(isCanvasAssignment)) {
          throw new CanvasApiError(
            "Canvas returned assignment data in an unexpected format.",
            502
          );
        }
        const course = batch[batchIndex];
        assignments.push(
          ...payload.map((assignment) => ({
            ...assignment,
            courseId: course.id,
            courseName: course.name,
          }))
        );
      });
    }

    assignments.sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return Date.parse(a.due_at) - Date.parse(b.due_at);
    });

    return Response.json(
      {
        courses: courses.map(({ id, name, course_code }) => ({
          id,
          name,
          course_code: course_code ?? null,
        })),
        assignments: assignments.slice(0, 12),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof CanvasApiError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      { error: "Could not load your Canvas dashboard. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
