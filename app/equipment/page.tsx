import Link from "next/link";

import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";

const equipmentItems = [
  {
    title: "Sensor Kits",
    description: "Portable kits for data collection, observation, and analysis.",
    link: "/equipment/explore/#sensor-kits"
  },
  {
    title: "Robotics Sets",
    description: "Introductory robotics systems for classroom or club settings.",
    link: "/equipment/explore/#robotics"
  },
  {
    title: "Measurement Tools",
    description: "Reliable tools for experiments, labs, and student investigations.",
    link: "/equipment/explore/#robotics"
  },
  {
    title: "Maker Supplies",
    description: "General prototyping materials for engineering design activities.",
    link: "/equipment/explore/#robotics"
  }
];

export default function EquipmentPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Equipment"
        title="Browse STEM hardware and lending-ready tools"
        description="Equipment listings are organized for quick review, helping partners understand what is available and how each item supports classroom implementation."
      />

      <section className="py-10">
        <div className="section-shell">
          <div className="surface-card border-cardinal/10 bg-parchment/40 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
              COSMIC-System
            </p>
            <h2 className="mt-4 font-display text-3xl text-ink">
              Inventory tracking and lending coordination
            </h2>
            <p className="mt-5 max-w-6xl text-lg leading-8 text-stone-600">
              <a
                href="https://vk12cosmic.org/"
                className="font-semibold text-gold transition hover:text-cardinal"
              >
                COSMIC-System
              </a>{" "}
              is the{" "}
              <a
                href="https://viterbik12.usc.edu/"
                className="font-semibold text-cardinal transition hover:underline"
              >
                USC Viterbi K-12 STEM Center&apos;s
              </a>{" "}
              inventory management platform for STEM kits and equipment. It
              supports inventory tracking, lending operations, and resource
              traceability to help partners manage classroom-ready STEM tools.
              For account access, please contact the K-12 STEM Center Office.
            </p>
            <br></br>
            <div className="flex flex-col gap-5 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
              >
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="section-shell grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {equipmentItems.map((item) => (
            <article key={item.title} className="surface-card p-6">
              <h2 className="font-display text-2xl text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {item.description}
              </p>
              <Link
                href={item.link}
                target="_blank"
                className="mt-6 inline-flex items-center rounded-full bg-cardinal px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7d0000]"
              >
                Explore
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
