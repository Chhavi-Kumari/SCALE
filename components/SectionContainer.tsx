import type { ReactNode } from "react";

type SectionContainerProps = {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  children: ReactNode;
};

export function SectionContainer({
  id,
  eyebrow,
  heading,
  description,
  children
}: SectionContainerProps) {
  return (
    <section id={id} className="scroll-mt-28 py-12 sm:py-14 lg:py-16">
      <div className="section-shell space-y-6">
        <div className="max-w-4xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
            {eyebrow}
          </p>
          <h2 className="section-heading">{heading}</h2>
          <p className="section-copy">{description}</p>
        </div>

        {children}
      </div>
    </section>
  );
}
