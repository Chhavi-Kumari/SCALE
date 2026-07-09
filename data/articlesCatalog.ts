import { parseCsv, normalizeDisplayText, normalizeText } from "@/data/lessonPlans";

type CsvRow = Record<string, string>;

export type ArticleCatalogItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  link: string;
  uploaded: string;
};

export function isTruthyUploadedValue(value: unknown) {
  return ["y", "yes", "true", "1", "uploaded", "published"].includes(
    normalizeText(value)
  );
}

function headerKey(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function pickValue(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    const normalizedKey = headerKey(key);
    if (row[normalizedKey]) {
      return row[normalizedKey];
    }
  }

  return "";
}

function splitKeywords(value: unknown) {
  return normalizeDisplayText(value)
    .split(/[;,|\/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function rowsToArticles(rows: CsvRow[]): ArticleCatalogItem[] {
  return rows
    .map((row, index) => {
      if (!isTruthyUploadedValue(pickValue(row, ["uploaded", "uploaded (y/n)", "uploadedyn"]))) {
        return null;
      }

      const title = normalizeDisplayText(
        pickValue(row, ["title", "title of article", "titleofarticle", "article", "name"])
      );
      const description = normalizeDisplayText(
        pickValue(row, ["description", "oneline", "one line", "summary", "abstract", "details"])
      );
      const tag = normalizeDisplayText(
        pickValue(row, ["tag", "type", "category", "source type", "source"])
      );
      const link = normalizeDisplayText(
        pickValue(row, ["link", "url", "source url", "sourceurl", "article url", "file url"])
      );
      const id =
        normalizeDisplayText(pickValue(row, ["id"])) ||
        `${normalizeText(title) || "article"}-${index + 1}`;

      return {
        id,
        title,
        description,
        tag: tag || normalizeDisplayText(pickValue(row, ["type"])) || "Article",
        link,
        uploaded: "Y"
      };
    })
    .filter((article): article is ArticleCatalogItem => Boolean(article && article.title));
}

export function buildArticleSearchBlob(article: ArticleCatalogItem) {
  return normalizeText(
    [
      article.title,
      article.description,
      article.tag,
      article.link
    ].join(" ")
  );
}

export function searchArticles(articles: ArticleCatalogItem[], query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return articles;

  const titleMatches = articles.filter((article) => normalizeText(article.title) === normalizedQuery);
  if (titleMatches.length > 0) {
    return titleMatches;
  }

  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return articles
    .map((article, index) => ({
      article,
      index,
      score: scoreArticleForSearch(article, queryTokens, normalizedQuery)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.article);
}

function scoreArticleForSearch(
  article: ArticleCatalogItem,
  queryTokens: string[],
  normalizedQuery: string
) {
  const title = normalizeText(article.title);
  const blob = buildArticleSearchBlob(article);

  if (!queryTokens.every((token) => blob.includes(token))) {
    return 0;
  }

  let score = 0;
  if (title.startsWith(normalizedQuery)) score += 4000;
  if (title.includes(normalizedQuery)) score += 3000;
  if (blob.includes(normalizedQuery)) score += 1000;

  score += queryTokens.filter((token) => title.includes(token)).length * 250;
  score += queryTokens.filter((token) => blob.includes(token)).length * 50;

  return score;
}
