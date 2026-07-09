"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import {
  rowsToArticles,
  searchArticles,
  type ArticleCatalogItem
} from "@/data/articlesCatalog";
import { normalizeText, parseCsv } from "@/data/lessonPlans";

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [articleType, setArticleType] = useState("");
  const [articles, setArticles] = useState<ArticleCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch("/api/articles", {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(
            payload?.error || `Failed to load articles: ${response.status}`
          );
        }

        const csvText = await response.text();
        const parsed = rowsToArticles(parseCsv(csvText));
        if (!controller.signal.aborted) {
          setArticles(parsed);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setArticles([]);
          setLoadError(
            error instanceof Error ? error.message : "Unable to load articles right now."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      controller.abort();
    };
  }, []);

  const normalizedQuery = normalizeText(appliedSearchQuery);

  const typeOptions = useMemo(() => {
    const seen = new Set<string>();

    articles.forEach((article) => {
      const tag = article.tag.trim();
      if (tag) {
        seen.add(tag);
      }
    });

    return Array.from(seen).sort((left, right) => left.localeCompare(right));
  }, [articles]);

  const visibleArticles = useMemo(() => {
    return searchArticles(articles, normalizedQuery).filter((article) => {
      if (!articleType) return true;
      return normalizeText(article.tag) === normalizeText(articleType);
    });
  }, [articleType, articles, normalizedQuery]);

  const searchActive = Boolean(normalizedQuery || articleType);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearchQuery(searchQuery.trim());
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Articles"
        title="K12 Center's Educational and Journal Articles Collection"
        description=" "
      />

      <section className="py-8">
        <div className="section-shell">
          <div className="surface-card border-cardinal/10 bg-parchment/60 p-6 sm:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Search
                  </span>
                  <input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-cardinal px-6 text-sm font-semibold text-white transition hover:bg-[#7d0000]"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setAppliedSearchQuery("");
                    setArticleType("");
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-700 transition hover:border-cardinal hover:text-cardinal"
                >
                  Clear / Reset
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Type
                  </span>
                  <select
                    value={articleType}
                    onChange={(event) => setArticleType(event.target.value)}
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-cardinal focus:ring-2 focus:ring-cardinal/10"
                  >
                    <option value="">All Types</option>
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </form>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="py-16">
          <div className="section-shell">
            <div className="surface-card px-6 py-16 text-center text-stone-600">
              Loading articles...
            </div>
          </div>
        </section>
      ) : loadError ? (
        <section className="py-16">
          <div className="section-shell">
            <div className="surface-card border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-semibold text-ink">{loadError}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12">
          <div className="section-shell space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
                  {searchActive ? "Search Results" : "All Articles"}
                </p>
                <h2 className="section-heading">
                  {searchActive ? "Matching articles" : "Browse the article library"}
                </h2>
              </div>
            </div>

            {searchActive && visibleArticles.length === 0 ? (
              <div className="surface-card border-dashed border-stone-300 bg-white px-6 py-16 text-center">
                <p className="text-lg font-semibold text-ink">
                  No articles found. Try adjusting your search.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
