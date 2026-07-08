import Link from "next/link";

const resourceCards = [
  {
    title: "Lesson Plans",
    description:
      "Standards-aligned classroom activities with clear preparation steps and instructional notes.",
    icon: "LP",
    link: "/lesson-plans"
  },
  {
    title: "Equipment",
    description:
      "Browse STEM tools, lending options, and implementation guidance for hands-on learning.",
    icon: "EQ",
    link: "/equipment"
  },
  {
    title: "Articles",
    description:
      "Access research-backed writing on pedagogy, emerging technology, and K-12 STEM practice.",
    icon: "AR",
    link: "/articles"
  },

];

export function CardGrid() {
  return (
    <section id="resources" className="py-20">
      <div className="section-shell space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
            Resource Categories
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resourceCards.map((card) => (
            <article
              key={card.title}
              className="surface-card group flex h-full flex-col justify-between p-6 hover:-translate-y-1 hover:border-cardinal/25"
            >
              <div className="space-y-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cardinal text-sm font-bold tracking-[0.2em] text-white">
                  {card.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-2xl text-ink">{card.title}</h3>
                  <p className="text-sm leading-7 text-stone-600">
                    {card.description}
                  </p>
                </div>
              </div>
              <Link href={card.link}
                  target="_blank"
                className="mt-8 inline-flex items-center text-sm font-semibold text-cardinal transition group-hover:translate-x-1"
              >
                Explore
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
