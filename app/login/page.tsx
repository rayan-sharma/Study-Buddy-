"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import { ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/Dashboard");
  }

  return (
    <main className="min-h-screen bg-neutral-background px-6 py-12 text-text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center justify-center gap-2 self-center text-xl font-semibold"
        >
          <BookOpen className="size-7 text-brand-primary" aria-hidden="true" />
          StudyBuddy
        </Link>

        <section className="rounded-2xl border border-border-light bg-white p-8 shadow-soft sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              Sign in to continue to your study workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border-light px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border-light px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 py-3 font-medium text-white transition hover:bg-text-primary/90"
            >
              Continue in demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border-light" />
            <span className="text-xs uppercase tracking-wide text-text-secondary">
              or
            </span>
            <div className="h-px flex-1 bg-border-light" />
          </div>

          <Link
            href="/Dashboard"
            className="inline-flex w-full items-center justify-center rounded-lg border border-border-light px-4 py-3 text-sm font-medium transition hover:bg-neutral-surface"
          >
            Skip login and start learning
          </Link>

          <p className="mt-5 text-center text-xs leading-relaxed text-text-secondary">
            Demo sign-in only. Authentication is not connected, and these
            credentials are not saved or verified.
          </p>
        </section>

        <Link
          href="/"
          className="mt-6 self-center text-sm text-text-secondary transition hover:text-text-primary"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
