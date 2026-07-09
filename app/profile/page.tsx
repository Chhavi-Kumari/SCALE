import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionToken, process.env.SESSION_SECRET ?? "");

  if (!session || session.active === false) {
    redirect("/login?next=/profile");
  }

  const fullName = [session.firstName, session.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || session.email;
  const organization = session.organization?.trim() || "Not provided";

  return (
    <main className="py-16 sm:py-20">
      <div className="section-shell">
        <section className="mx-auto max-w-xl">
          <div className="surface-card overflow-hidden p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-cardinal/10 text-4xl text-cardinal"
                aria-hidden="true"
              >
                {"\u{1F464}"}
              </div>

              <h1 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
                {displayName}
              </h1>

              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-cardinal">
                User Profile
              </p>
            </div>

            <dl className="mt-8 space-y-5 text-left">
              <div className="rounded-2xl bg-stone-50 px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Email Address
                </dt>
                <dd className="mt-2 text-base font-medium text-ink">{session.email}</dd>
              </div>

              <div className="rounded-2xl bg-stone-50 px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Organization
                </dt>
                <dd className="mt-2 text-base font-medium text-ink">{organization}</dd>
              </div>

              <div className="rounded-2xl bg-stone-50 px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                  Account Status
                </dt>
                <dd className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    Active
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex justify-center">
              <a
                href="/api/auth/logout?next=/login"
                className="inline-flex items-center justify-center rounded-full bg-cardinal px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7d0000]"
              >
                Log Out
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
