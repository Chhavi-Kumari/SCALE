"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type RequestAccessState = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  reason: string;
};

type ActionLink = {
  label: string;
  href: string;
  external?: boolean;
};

type RequestAccessNotice = {
  title: string;
  message: string;
  actions?: ActionLink[];
  tone: "success" | "warning";
};

const initialState: RequestAccessState = {
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  reason: ""
};

export function RequestAccessForm() {
  const [form, setForm] = useState<RequestAccessState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<RequestAccessNotice | null>(null);

  function updateField(key: keyof RequestAccessState, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setNotice(null);

    try {
      const response = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        code?: string;
        title?: string;
        actions?: ActionLink[];
      };

      if (!response.ok) {
        if (payload.code) {
          setNotice({
            title: payload.title || "Request update",
            message:
              payload.message || payload.error || "Unable to submit request.",
            actions: payload.actions,
            tone: "warning"
          });
          return;
        }

        throw new Error(payload.error || payload.message || "Unable to submit request.");
      }

      setNotice({
        title: "Request submitted",
        message:
          payload.message || "Thank you. We will get back to you with access credentials.",
        actions: [
          {
            label: "Go to Login",
            href: "/login"
          }
        ],
        tone: "success"
      });
      setForm(initialState);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit request."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notice) {
    return (
      <section className="py-16">
        <div className="section-shell">
          <div className="surface-card mx-auto max-w-3xl p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
              Request Access
            </p>
            <h1 className="mt-4 font-display text-3xl text-ink">
              {notice.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">{notice.message}</p>
            {notice.actions?.length ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {notice.actions.map((action) =>
                  action.external ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                        notice.tone === "success"
                          ? "bg-cardinal text-white hover:bg-[#7d0000]"
                          : "border border-cardinal text-cardinal hover:bg-cardinal hover:text-white"
                      }`}
                    >
                      {action.label}
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                        notice.tone === "success"
                          ? "bg-cardinal text-white hover:bg-[#7d0000]"
                          : "border border-cardinal text-cardinal hover:bg-cardinal hover:text-white"
                      }`}
                    >
                      {action.label}
                    </Link>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="section-shell">
        <div className="surface-card mx-auto max-w-4xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
            Request Access
          </p>
          <h1 className="mt-4 font-display text-3xl text-ink">
            Request SCALE credentials
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Fill out the form below and we&apos;ll review your request.
          </p>

          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                First Name
              </span>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Last Name
              </span>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Organization
              </span>
              <input
                type="text"
                value={form.organization}
                onChange={(event) => updateField("organization", event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-stone-700">
                Reason
              </span>
              <textarea
                rows={5}
                value={form.reason}
                onChange={(event) => updateField("reason", event.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                {error}
              </div>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-cardinal px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d0000] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
