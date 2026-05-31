export type EquipmentCardItem = {
  image: string;
  title: string;
  description: string;
  href: string;
  tags?: string[];
};

type EquipmentCardProps = {
  item: EquipmentCardItem;
  active: boolean;
  adjacent: boolean;
};

export function EquipmentCard({ item, active, adjacent }: EquipmentCardProps) {
  return (
    <article
      className={[
        "surface-card h-[372px] overflow-hidden border transition-all duration-500 will-change-transform transform-gpu",
        active
          ? "scale-[1.06] border-cardinal/20 opacity-100 shadow-[0_30px_66px_-26px_rgba(153,0,0,0.52)]"
          : adjacent
            ? "scale-[0.97] border-stone-200 opacity-78 shadow-[0_16px_34px_-26px_rgba(31,26,23,0.22)]"
            : "scale-[0.92] border-stone-200 opacity-58 shadow-[0_10px_22px_-26px_rgba(31,26,23,0.14)]"
      ].join(" ")}
    >
      <div className="p-3 pb-0">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          <div className="relative h-44 w-full bg-stone-100">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/16 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <div className="flex h-[188px] flex-col p-4 pt-3 sm:p-5">
        <h3 className="font-display text-lg leading-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>
        <div className="mt-auto pt-4">
          <a
            href={item.href}
            className="inline-flex items-center rounded-full bg-cardinal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#7d0000]"
          >
            View Equipment
          </a>
        </div>
      </div>
    </article>
  );
}
