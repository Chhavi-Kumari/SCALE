import Link from "next/link";

import type { ArticleCatalogItem } from "@/data/articlesCatalog";

type ArticleCardProps = {
  article: ArticleCatalogItem;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="surface-card group flex h-full min-h-[20rem] flex-col justify-between p-6 sm:min-h-[22rem]">
      <div className="space-y-4">
        <span className="w-fit rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
          {article.tag || "Article"}
        </span>

        <div className="space-y-3">
          <h2 className="font-display text-2xl text-ink">{article.title}</h2>
          <p
            className="text-sm leading-7 text-stone-600"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden"
            }}
          >
            {article.description || "Description coming soon."}
          </p>
        </div>
      </div>

      {article.link ? (
        <Link
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
        >
          View
        </Link>
      ) : (
        <span className="mt-8 inline-flex items-center justify-center rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-400">
          View
        </span>
      )}
    </article>
  );
}
