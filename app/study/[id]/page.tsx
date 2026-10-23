import { Suspense } from "react";
import StudyCall from "./StudyCall";

// The session id comes from the URL, so the client part streams in inside Suspense (Cache Components).
export default function StudyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-neutral-background" />}>
      <StudyCall />
    </Suspense>
  );
}
