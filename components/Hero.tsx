import Image from "next/image";
import stemPhoto from "./stem-photo.jpg";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-stone-200 bg-hero-glow">
      <div className="section-shell grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-cardinal/15 bg-cardinal/5 px-4 py-2 text-sm text-cardinal">
            <span className="h-2 w-2 rounded-full bg-gold" />
            USC Viterbi K-12 STEM Center Resource Hub
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-5xl leading-none text-ink sm:text-6xl">
              SCALE
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              SCALE (STEM Center Articles, Lessons, Equipment) is a centralized
              resource hub designed to provide school and community partners with
              tools and knowledge to inspire the next generation of innovators.
            </p>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              Our mission is to bridge the gap between high-quality STEM hardware
              and classroom implementation through a seamless lending library and
              research-backed pedagogical support.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#resources"
              className="inline-flex items-center justify-center rounded-full bg-cardinal px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7d0000]"
            >
              Explore Resources
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
            >
              Partner Access
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 hidden h-32 w-32 rounded-full bg-gold/25 blur-3xl lg:block" />
          <div className="surface-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-cardinal/20 via-transparent to-transparent" />
            <Image
              src={stemPhoto}
              alt="Students participating in a STEM classroom activity"
              width={1200}
              height={900}
              className="h-full min-h-[320px] w-full object-cover"
              priority
            />
          </div>
          <div className="surface-card absolute -bottom-6 left-6 hidden max-w-xs p-5 lg:block">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Featured Focus
            </p>
            <p className="mt-2 font-display text-2xl text-ink">
              Classroom-ready STEM implementation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
