"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { articles } from "@/data/articles";
import {
  LESSON_PLANS_CSV_URL,
  getRandomLessonPlans,
  parseCsv,
  rowsToLessonPlans,
  type LessonPlan
} from "@/data/lessonPlans";
import {
  electronicsEquipment,
  kitsEquipment,
  roboticsEquipment
} from "@/components/equipmentShowcaseData";

type FeaturedCard = {
  key: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

function shuffle<T>(items: T[]) {
  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool;
}

function mapLessonToCard(lesson: LessonPlan): FeaturedCard | null {
  if (!lesson.fileUrl) return null;

  return {
    key: `lesson:${lesson.id}`,
    badge: "Lesson Plan",
    title: lesson.title,
    description: lesson.description || "Lesson plan preview.",
    href: lesson.fileUrl,
    external: true
  };
}

function mapEquipmentToCard(
  item: (typeof roboticsEquipment)[number],
  sectionId: "robotics" | "electronics" | "kits"
): FeaturedCard {
  return {
    key: `equipment:${sectionId}:${item.href}`,
    badge: "Equipment",
    title: item.title,
    description: item.description || "Equipment preview.",
    href: `/equipment#${sectionId}`
  };
}

function mapArticleToCard(item: (typeof articles)[number]): FeaturedCard {
  return {
    key: `article:${item.link}`,
    badge: "Article",
    title: item.title,
    description: item.description || "Article preview.",
    href: item.link,
    external: true
  };
}

function pickRandomUnique<T extends { key: string }>(
  pool: T[],
  count: number,
  pickedKeys: Set<string>
) {
  return shuffle(pool.filter((item) => !pickedKeys.has(item.key))).slice(0, count);
}

export function FeaturedContent() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [featuredCards, setFeaturedCards] = useState<FeaturedCard[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLessonPlans() {
      try {
        const response = await fetch(LESSON_PLANS_CSV_URL, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) return;

        const csvText = await response.text();
        const parsed = rowsToLessonPlans(parseCsv(csvText));
        setLessonPlans(parsed);
      } catch {
        if (!controller.signal.aborted) {
          setLessonPlans([]);
        }
      }
    }

    loadLessonPlans();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const lessonCards = getRandomLessonPlans(lessonPlans, 2)
      .map(mapLessonToCard)
      .filter((card): card is FeaturedCard => Boolean(card));

    const equipmentCards = shuffle([
      ...roboticsEquipment.map((item) => mapEquipmentToCard(item, "robotics")),
      ...electronicsEquipment.map((item) => mapEquipmentToCard(item, "electronics")),
      ...kitsEquipment.map((item) => mapEquipmentToCard(item, "kits"))
    ]);

    const articleCards = shuffle(articles.map(mapArticleToCard));

    const selected: FeaturedCard[] = [];
    const pickedKeys = new Set<string>();

    const addCards = (cards: FeaturedCard[], count: number) => {
      for (const card of pickRandomUnique(cards, count, pickedKeys)) {
        pickedKeys.add(card.key);
        selected.push(card);
      }
    };

    addCards(lessonCards, 2);
    addCards(equipmentCards, 2);
    addCards(articleCards, 2);

    if (selected.length < 6) {
      const remaining = shuffle([
        ...lessonCards,
        ...equipmentCards,
        ...articleCards
      ]).filter((card) => !pickedKeys.has(card.key));

      for (const card of remaining) {
        if (selected.length >= 6) break;
        pickedKeys.add(card.key);
        selected.push(card);
      }
    }

    setFeaturedCards(selected.slice(0, 6));
  }, [lessonPlans]);

  return (
    <section className="py-20">
      <div className="section-shell space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
              Featured Content
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCards.map((item) => (
            <article
              key={item.key}
              className="surface-card flex h-full flex-col gap-5 p-6 hover:-translate-y-1 hover:border-cardinal/25"
            >
              <span className="w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
                {item.badge}
              </span>
              <div className="space-y-3">
                <h3 className="font-display text-2xl text-ink">{item.title}</h3>
                <p className="text-sm leading-7 text-stone-600">
                  {item.description}
                </p>
              </div>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-auto inline-flex w-fit items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
                >
                  View
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="mt-auto inline-flex w-fit items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
                >
                  View
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
