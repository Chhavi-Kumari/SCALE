"use client";

import { useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/Footer";
import { LessonPlanCard } from "@/components/LessonPlanCard";
import { PageHero } from "@/components/PageHero";
import { SearchBar } from "@/components/SearchBar";
import {
  buildGradeLevelOptions,
  buildSubjectOptions,
  getDurationBucketOptions,
  getRandomLessonPlans,
  LESSON_PLANS_CSV_URL,
  matchesLessonFilters,
  normalizeText,
  parseCsv,
  rowsToLessonPlans,
  searchLessonPlans,
  type LessonPlan
} from "@/data/lessonPlans";

type Filters = {
  gradeLevel: string;
  subject: string;
  duration: string;
};

const defaultFilters: Filters = {
  gradeLevel: "",
  subject: "",
  duration: ""
};

function hasActiveFilters(filters: Filters) {
  return Boolean(filters.gradeLevel || filters.subject || filters.duration);
}

export default function LessonPlansPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [featuredLessonIds, setFeaturedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLessonPlans() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(LESSON_PLANS_CSV_URL, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Failed to load lesson plans: ${response.status}`);
        }

        const csvText = await response.text();
        const parsed = rowsToLessonPlans(parseCsv(csvText));

        if (!active) return;

        setLessonPlans(parsed);
        setFeaturedLessonIds(getRandomLessonPlans(parsed, 4).map((lesson) => lesson.id));
      } catch {
        if (!active) return;
        setLessonPlans([]);
        setFeaturedLessonIds([]);
        setLoadError("Unable to load lesson plans right now.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLessonPlans();

    return () => {
      active = false;
    };
  }, []);

  const filterOptions = useMemo(() => {
    return {
      gradeLevels: buildGradeLevelOptions(lessonPlans),
      subjects: buildSubjectOptions(lessonPlans),
      durations: getDurationBucketOptions()
    };
  }, [lessonPlans]);

  const normalizedQuery = normalizeText(appliedSearchQuery);
  const searchActive = Boolean(normalizedQuery) || hasActiveFilters(filters);

  const featuredLessons = useMemo(() => {
    return lessonPlans.filter((lesson) => featuredLessonIds.includes(lesson.id)).slice(0, 4);
  }, [featuredLessonIds, lessonPlans]);

  const defaultLessons = useMemo(
    () => lessonPlans.filter((lesson) => !featuredLessonIds.includes(lesson.id)),
    [featuredLessonIds, lessonPlans]
  );

  const matchingLessons = useMemo(() => {
    const searched = searchLessonPlans(lessonPlans, normalizedQuery);
    return searched.filter((lesson) => matchesLessonFilters(lesson, filters));
  }, [filters, lessonPlans, normalizedQuery]);

  const visibleLessons = searchActive ? matchingLessons : defaultLessons;
  const noResults = searchActive && visibleLessons.length === 0;
  const showAllSection = !searchActive || visibleLessons.length > 0 || noResults;

  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Lesson Plans"
        title="Classroom-ready lesson plans"
        description=" "
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={(value) => {
          setSearchQuery(value);
          setAppliedSearchQuery(value);
        }}
        onSearchSubmit={() => setAppliedSearchQuery(searchQuery.trim())}
        onReset={() => {
          setSearchQuery("");
          setAppliedSearchQuery("");
          setFilters(defaultFilters);
        }}
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((current) => ({
            ...current,
            [key]: value
          }))
        }
        options={filterOptions}
      />

      {loading ? (
        <section className="py-16">
          <div className="section-shell">
            <div className="surface-card px-6 py-16 text-center text-stone-600">
              Loading lesson plans...
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
        <>
          {!searchActive ? (
            <section className="py-10">
              <div className="section-shell space-y-8">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
                    Featured Lesson Plans
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {featuredLessons.map((lesson) => (
                    <LessonPlanCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {showAllSection ? (
            <section className="pb-20 pt-4">
              <div className="section-shell space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cardinal">
                      {searchActive ? "Search Results" : "All Lesson Plans"}
                    </p>
                    <h2 className="section-heading">
                      {searchActive ? "Matching lesson plans" : "Browse the full lesson plan library"}
                    </h2>
                  </div>
                </div>

                {noResults ? (
                  <div className="surface-card border-dashed border-stone-300 bg-white px-6 py-16 text-center">
                    <p className="text-lg font-semibold text-ink">
                      No lesson plans found. Try adjusting your search or filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {visibleLessons.map((lesson) => (
                      <LessonPlanCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </>
      )}

      <Footer />
    </main>
  );
}
