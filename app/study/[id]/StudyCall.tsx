"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Phone } from "lucide-react";

type Commitment = {
  id: string;
  topic: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "notified" | "started" | "completed" | "cancelled";
};

type CallStart = { mode: "tap"; url: string; line: string; reason?: string };

// How long the confirmation stays up before returning to the Dashboard.
const BACK_AFTER_MS = 2500;

// Opened from the "time to study" notification: start the call, snooze, or skip, then go back.
export default function StudyCall() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/commitments/${id}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("This study session wasn't found."))))
      .then((data) => setCommitment(data.commitment))
      .catch((err) => setError(err.message));
  }, [id]);

  const goBackSoon = () => setTimeout(() => router.push("/Dashboard"), BACK_AFTER_MS);

  async function startCall() {
    setBusy(true);
    try {
      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commitment_id: id }),
      });
      if (!res.ok) throw new Error(`Couldn't start the call (${res.status}).`);
      const call: CallStart = await res.json();
      setMessage(`Opening FaceTime to ${call.line}…`);
      window.location.href = call.url;
      goBackSoon();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  async function update(body: object, done: (c: Commitment) => string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/commitments/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Couldn't update the session (${res.status}).`);
      setMessage(done((await res.json()).commitment));
      goBackSoon();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const closed = commitment?.status === "cancelled" || commitment?.status === "completed";

  return (
    <main className="min-h-screen bg-neutral-background px-6 py-12 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <Link href="/Dashboard" className="mb-8 inline-flex items-center justify-center gap-2 self-center text-xl font-semibold">
          <BookOpen className="size-7 text-brand-primary" aria-hidden="true" />
          StudyBuddy
        </Link>

        <section className="rounded-2xl border border-border-light bg-white p-8 text-center shadow-soft sm:p-10">
          {error ? (
            <p className="text-sm text-text-secondary" role="alert">{error}</p>
          ) : !commitment ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-brand-primary">Time to study</p>
              <h1 className="mb-2 text-3xl font-semibold tracking-tight">{commitment.topic}</h1>
              <p className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary">
                <Clock className="size-4" aria-hidden="true" />
                {time(commitment.scheduled_at)} · {commitment.duration_minutes} min
              </p>

              {message ? (
                <p className="text-sm text-text-secondary" role="status">{message}</p>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={startCall}
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {closed ? "Call anyway" : "Start call"}
                  </button>
                  {!closed && commitment.status !== "started" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => update({ action: "snooze", minutes: 10 }, (c) => `Snoozed until ${time(c.scheduled_at)}.`)}
                        disabled={busy}
                        className="rounded-lg border border-border-light px-4 py-3 text-sm font-medium transition hover:bg-neutral-surface disabled:opacity-60"
                      >
                        Snooze 10 min
                      </button>
                      <button
                        type="button"
                        onClick={() => update({ action: "cancel" }, () => "Skipped. See you next time.")}
                        disabled={busy}
                        className="rounded-lg border border-border-light px-4 py-3 text-sm font-medium transition hover:bg-neutral-surface disabled:opacity-60"
                      >
                        Not now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <Link href="/Dashboard" className="mt-6 self-center text-sm font-medium text-text-secondary hover:text-text-primary">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
