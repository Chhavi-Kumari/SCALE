import Link from "next/link";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const navigationItems = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Lesson Plans", link: "/lesson-plans" },
  { name: "Equipment", link: "/equipment" },
  { name: "Articles", link: "/articles" },
  //{ name: "Resources", link: "/resources" }
];

export async function Navbar() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(
    sessionToken && (await verifySessionToken(sessionToken, process.env.SESSION_SECRET ?? ""))
  );

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <div className="section-shell flex min-h-20 flex-col justify-center gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <Link href="https://viterbischool.usc.edu/" className="flex flex-col">
              <span className="font-display text-xl tracking-wide text-cardinal">
                USC Viterbi
              </span>
            </Link>
          </div>

          <div className="hidden h-10 w-px bg-stone-300 lg:block" />

          <div className="text-sm font-medium uppercase tracking-[0.28em] text-stone-600 lg:block">
            <Link href="https://viterbik12.usc.edu/">K-12 STEM Center</Link>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="flex flex-wrap items-center gap-2 lg:justify-end">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-cardinal"
            >
              {item.name}
              </Link>
          ))}

          {isAuthenticated ? (
            <Link
              href="/profile"
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-cardinal"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-cardinal"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
