"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

function sanitizeRedirectPath(value: string | null) {
  if (!value) return "/profile";

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    return "/profile";
  }

  return "/profile";
}

export function LoginContent() {
  const returnTo = "/profile";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          next: returnTo
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to sign in.");
      }

      window.location.assign(sanitizeRedirectPath(payload.redirectTo ?? returnTo));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to sign in."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="py-16">
      <div className="section-shell grid gap-6 lg:grid-cols-2">
        <article className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Login</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Use your SCALE credentials to access the lesson plans and articles.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                placeholder="name@school.edu"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-cardinal px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d0000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>

              <a
                href="/api/auth/logout?next=/login"
                className="inline-flex items-center justify-center rounded-full border border-cardinal px-6 py-3 text-sm font-semibold text-cardinal transition hover:bg-cardinal hover:text-white"
              >
                Logout
              </a>
            </div>
          </form>
        </article>

        <article className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Request Access</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            New partners can request credentials using the access form.
          </p>
          <div className="mt-8 space-y-4">
            <p className="text-sm leading-7 text-stone-600">
              We&apos;ll review your request and get back to you with access details.
            </p>
            <Link
              href="/request-access"
              className="inline-flex items-center justify-center rounded-full border border-cardinal px-6 py-3 text-sm font-semibold text-cardinal transition hover:bg-cardinal hover:text-white"
            >
              Request Access
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
