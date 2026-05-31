"use client";

import { useMemo, useState } from "react";

import { EquipmentCard, type EquipmentCardItem } from "@/components/EquipmentCard";

type EquipmentCarouselProps = {
  items: EquipmentCardItem[];
};

function getOffset(index: number, activeIndex: number, length: number) {
  const raw = index - activeIndex;
  if (Math.abs(raw) <= length / 2) return raw;
  return raw > 0 ? raw - length : raw + length;
}

export function EquipmentCarousel({ items }: EquipmentCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const visibleIndices = useMemo(() => {
    return items.map((_, index) => ({
      index,
      offset: getOffset(index, activeIndex, items.length)
    }));
  }, [activeIndex, items]);

  const goToIndex = (nextIndex: number) => {
    const normalized = (nextIndex + items.length) % items.length;
    setActiveIndex(normalized);
  };

  const handleTouchEnd = (touchEndX: number) => {
    if (touchStartX === null) return;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        goToIndex(activeIndex + 1);
      } else {
        goToIndex(activeIndex - 1);
      }
    }

    setTouchStartX(null);
  };

  return (
    <div className="relative overflow-visible py-2">
      <button
        type="button"
        onClick={() => goToIndex(activeIndex - 1)}
        className="absolute left-0 top-1/2 z-30 inline-flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-stone-700 shadow-[0_12px_28px_-16px_rgba(31,26,23,0.45)] transition hover:border-cardinal hover:text-cardinal sm:h-12 sm:w-12"
        aria-label="Previous equipment"
      >
        <span aria-hidden="true">{"<"}</span>
      </button>

      <button
        type="button"
        onClick={() => goToIndex(activeIndex + 1)}
        className="absolute right-0 top-1/2 z-30 inline-flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white text-stone-700 shadow-[0_12px_28px_-16px_rgba(31,26,23,0.45)] transition hover:border-cardinal hover:text-cardinal sm:h-12 sm:w-12"
        aria-label="Next equipment"
      >
        <span aria-hidden="true">{">"}</span>
      </button>

      <div
        className="relative mx-auto h-[400px] w-full overflow-hidden rounded-[2rem] bg-transparent shadow-[0_30px_80px_-34px_rgba(0,0,0,0)] sm:h-[410px] lg:h-[420px]"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        {visibleIndices.map(({ index, offset }) => {
          const item = items[index];
          const abs = Math.abs(offset);
          const active = offset === 0;
          const adjacent = abs === 1 || abs === 2;
          const hidden = abs > 3;

          const scale = active ? 1.06 : abs === 1 ? 0.94 : abs === 2 ? 0.86 : 0.78;
          const opacity = active ? 1 : abs === 1 ? 0.82 : abs === 2 ? 0.58 : 0.24;
          const translateY = active ? "-50%" : abs === 1 ? "-50%" : abs === 2 ? "-52%" : "-54%";
          const zIndex = 50 - abs * 5;

          return (
            <div
              key={item.title}
              id={item.href.split("#")[1]}
              className="absolute left-1/2 top-1/2 w-[280px] sm:w-[300px] lg:w-[320px] transition-all duration-500 ease-out"
              style={{
                transform: `translate(-50%, ${translateY}) translateX(calc(${offset} * clamp(7rem, 18vw, 15rem))) scale(${scale})`,
                opacity: hidden ? 0 : opacity,
                zIndex,
                pointerEvents: hidden ? "none" : "auto"
              }}
              onClick={() => goToIndex(index)}
            >
              <EquipmentCard item={item} active={active} adjacent={adjacent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
