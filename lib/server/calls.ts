// Starting a study call with the FaceTime agent. Server-only.
import { env } from "./env";
import { startSession, type Session } from "./study";

export type CallStart =
  | { mode: "tap"; url: string; line: string; reason?: string; session?: Session };

// The agent's FaceTime line. It changes when Chert assigns a new line after re-verifying (chert onboard).
export const lineAddress = () => env("FACETIME_LINE_ADDRESS") ?? "+16282335326";

// Opens a FaceTime Video call (not facetime-audio://) on iPhone, iPad or Mac to the line `chert dev`
// routes to the agent, so Study Buddy can see the student's camera.
export const callUrl = () => `facetime://${lineAddress()}`;

export async function startCall(commitmentId?: string): Promise<CallStart> {
  const session = commitmentId ? startSession(commitmentId) : undefined;
  // Outbound calling through Chert's API goes here first once it is enabled; tap-to-call is the fallback.
  return { mode: "tap", url: callUrl(), line: lineAddress(), session };
}
