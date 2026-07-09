import { Suspense } from "react";

import { Footer } from "@/components/Footer";
import { LoginContent } from "@/components/LoginContent";
import { PageHero } from "@/components/PageHero";

function LoginContentFallback() {
  return (
    <section className="py-16">
      <div className="section-shell grid gap-6 lg:grid-cols-2">
        <article className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Login</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Use your SCALE credentials to access the lesson plans and articles.
          </p>
        </article>

        <article className="surface-card p-6 sm:p-8">
          <h2 className="font-display text-3xl text-ink">Request Sign-Up</h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Not yet a partner? Request access to start the onboarding process.
          </p>
        </article>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Login"
        title="Access the partner portal or request a new account"
        description="Approved partners can sign in to manage access and requests. New organizations can request sign-up using the same page."
      />

      <Suspense fallback={<LoginContentFallback />}>
        <LoginContent />
      </Suspense>

      <Footer />
    </main>
  );
}
