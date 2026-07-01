export type LessonPlan = {
  id: string;
  title: string;
  description: string;
  gradeLevel: string;
  subject: string;
  duration: string;
  keywords: string[];
  fileUrl: string;
};

type CsvRow = Record<string, string>;

export const LESSON_PLANS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1OPFK42_U-FsgcmR36QBdAZThk7oRF4s21auZx-TKTpI/export?format=csv&gid=0";

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .toLowerCase()
    .trim();
}

export function normalizeDisplayText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isTruthyCheckboxValue(value: unknown) {
  const normalized = normalizeText(value);

  return [
    "true",
    "checked",
    "yes",
    "1",
    "completed",
    "complete",
    "done"
  ].includes(normalized);
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      if (/^[A-Z0-9&/-]{2,}$/.test(word)) return word;
      if (/^\d/.test(word)) return word;

      const [prefix, ...rest] = word.split("-");
      const titleCasedPrefix =
        prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();

      if (rest.length === 0) return titleCasedPrefix;

      return [titleCasedPrefix, ...rest.map((part) => part.toLowerCase())].join("-");
    })
    .join(" ");
}

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  const pushCell = () => {
    currentRow.push(currentCell);
    currentCell = "";
  };

  const pushRow = () => {
    rows.push(currentRow);
    currentRow = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushCell();
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      if (currentCell.length > 0 || currentRow.length > 0) {
        pushCell();
        pushRow();
      }
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    pushCell();
    pushRow();
  }

  const [headerRow, ...dataRows] = rows.filter((row) => row.some((cell) => cell.trim()));
  if (!headerRow) return [];

  const headers = headerRow.map((header) => normalizeHeader(header));

  return dataRows.map((row) => {
    const record: CsvRow = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function pickValue(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    const normalizedKey = normalizeHeader(key);
    if (row[normalizedKey]) {
      return row[normalizedKey];
    }
  }

  return "";
}

function splitMultiValueField(value: unknown) {
  return normalizeDisplayText(value)
    .split(/[;,|\/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseGradeToken(token: string) {
  const normalized = normalizeText(token)
    .replace(/^grades?\s*/, "")
    .replace(/^grade\s*/, "");

  if (!normalized) return null;
  if (normalized === "k" || normalized === "kindergarten") return 0;
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return null;
}

function expandGradeToken(token: string) {
  const normalized = normalizeText(token).replace(/^grades?\s*/, "");
  const rangeMatch = normalized.match(/^(k|\d+)\s*[-–—]\s*(k|\d+)$/);

  if (rangeMatch) {
    const start = parseGradeToken(rangeMatch[1]);
    const end = parseGradeToken(rangeMatch[2]);

    if (start === null || end === null) return [];

    const from = Math.min(start, end);
    const to = Math.max(start, end);

    const grades: number[] = [];
    for (let value = from; value <= to; value += 1) {
      grades.push(value);
    }
    return grades;
  }

  const single = parseGradeToken(normalized);
  return single === null ? [] : [single];
}

export function parseGradeLevels(value: unknown) {
  const grades = new Set<number>();

  for (const token of splitMultiValueField(value)) {
    expandGradeToken(token).forEach((grade) => grades.add(grade));
  }

  return Array.from(grades).sort((left, right) => left - right);
}

export function normalizeGradeLevels(value: unknown) {
  return parseGradeLevels(value).map((grade) => (grade === 0 ? "K" : String(grade)));
}

export function normalizeSubjects(value: unknown) {
  const items = splitMultiValueField(value);
  const seen = new Map<string, string>();

  for (const item of items) {
    const key = normalizeText(item);
    const label = toTitleCase(normalizeDisplayText(item).replace(/\s+/g, " "));

    if (key && !seen.has(key)) {
      seen.set(key, label);
    }
  }

  return Array.from(seen.values()).sort((left, right) => left.localeCompare(right));
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDurationMinutes(value: unknown) {
  const text = normalizeText(value);
  if (!text) return { min: null as number | null, max: null as number | null };

  const underMatch = text.match(/^under\s+(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|hours?|hrs?|hr)?$/);
  if (underMatch) {
    const amount = parseNumber(underMatch[1]);
    if (amount === null) return { min: null, max: null };
    return { min: null, max: Math.max(0, amount - Number.EPSILON) };
  }

  const plusMatch = text.match(/^(\d+(?:\.\d+)?)\s*\+\s*(?:minutes?|mins?|min|hours?|hrs?|hr)?$/);
  if (plusMatch) {
    const amount = parseNumber(plusMatch[1]);
    if (amount === null) return { min: null, max: null };
    return { min: amount, max: null };
  }

  const rangeMatch = text.match(
    /^(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*(minutes?|mins?|min|hours?|hrs?|hr)?$/
  );
  if (rangeMatch) {
    const start = parseNumber(rangeMatch[1]);
    const end = parseNumber(rangeMatch[2]);
    if (start === null || end === null) return { min: null, max: null };
    const unit = rangeMatch[3] ?? "minutes";
    const multiplier = unit.startsWith("hour") || unit.startsWith("hr") ? 60 : 1;
    return {
      min: Math.min(start, end) * multiplier,
      max: Math.max(start, end) * multiplier
    };
  }

  const exactWithUnit = text.match(
    /^(\d+(?:\.\d+)?)\s*(minutes?|mins?|min|hours?|hrs?|hr)$/
  );
  if (exactWithUnit) {
    const amount = parseNumber(exactWithUnit[1]);
    if (amount === null) return { min: null, max: null };
    const unit = exactWithUnit[2];
    const minutes = unit.startsWith("hour") || unit.startsWith("hr") ? amount * 60 : amount;
    return { min: minutes, max: minutes };
  }

  return { min: null, max: null };
}

export function getDurationBucketOptions() {
  return [
    "Under 30 minutes",
    "30+ minutes",
    "45+ minutes",
    "60+ minutes",
    "90+ minutes",
    "120+ minutes"
  ];
}

function bucketToMinutes(value: unknown) {
  const normalized = normalizeText(value);
  if (normalized.startsWith("under 30")) {
    return -30;
  }

  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*\+/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function lessonMatchesDuration(lessonDuration: unknown, selectedBucket: unknown) {
  const bucket = bucketToMinutes(selectedBucket);
  if (bucket === null) return true;

  const lesson = parseDurationMinutes(lessonDuration);

  if (bucket < 0) {
    if (lesson.max !== null) {
      return lesson.max < 30;
    }

    if (lesson.min !== null) {
      return lesson.min < 30;
    }

    return false;
  }

  if (lesson.min === null) return false;

  return lesson.min >= bucket;
}

export function rowsToLessonPlans(rows: CsvRow[]): LessonPlan[] {
  return rows
    .map((row, index) => {
      if (!isTruthyCheckboxValue(pickValue(row, ["completed"]))) {
        return null;
      }

      const id =
        normalizeDisplayText(pickValue(row, ["id"])) ||
        `${normalizeHeader(pickValue(row, ["title"])) || "lesson"}-${index + 1}`;

      const title = normalizeDisplayText(pickValue(row, ["title"]));
      const description = normalizeDisplayText(pickValue(row, ["description"]));
      const gradeLevel = normalizeDisplayText(pickValue(row, ["gradeLevel", "grade level", "grade"]));
      const subject = normalizeDisplayText(pickValue(row, ["subject", "discipline", "topic"]));
      const duration = normalizeDisplayText(pickValue(row, ["duration", "time", "lesson duration"]));
      const keywords = splitMultiValueField(
        pickValue(row, ["keywords", "keyword", "tags"])
      );
      const fileUrl = normalizeDisplayText(
        pickValue(row, ["fileUrl", "file url", "url", "link", "drive link"])
      );

      return {
        id,
        title,
        description,
        gradeLevel,
        subject,
        duration,
        keywords,
        fileUrl
      };
    })
    .filter((lesson): lesson is LessonPlan => Boolean(lesson && (lesson.title || lesson.description)));
}

export function buildGradeLevelOptions(lessons: LessonPlan[]) {
  const grades = new Set<string>();

  lessons.forEach((lesson) => {
    normalizeGradeLevels(lesson.gradeLevel).forEach((grade) => grades.add(grade));
  });

  return Array.from(grades).sort((left, right) => {
    if (left === "K") return -1;
    if (right === "K") return 1;
    return Number(left) - Number(right);
  });
}

export function buildSubjectOptions(lessons: LessonPlan[]) {
  const subjects = new Set<string>();

  lessons.forEach((lesson) => {
    normalizeSubjects(lesson.subject).forEach((subject) => subjects.add(subject));
  });

  return Array.from(subjects).sort((left, right) => left.localeCompare(right));
}

export function buildSearchBlob(lesson: LessonPlan) {
  return normalizeText(
    [
      lesson.title,
      lesson.description,
      lesson.gradeLevel,
      normalizeGradeLevels(lesson.gradeLevel).join(" "),
      lesson.subject,
      normalizeSubjects(lesson.subject).join(" "),
      lesson.duration,
      lesson.keywords.join(" "),
      lesson.keywords.map((keyword) => normalizeDisplayText(keyword)).join(" ")
    ].join(" ")
  );
}

export function scoreLessonForSearch(lesson: LessonPlan, query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const title = normalizeText(lesson.title);
  const searchBlob = buildSearchBlob(lesson);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (title === normalizedQuery) {
    return 10000;
  }

  if (!queryTokens.every((token) => searchBlob.includes(token))) {
    return 0;
  }

  let score = 0;

  if (title.startsWith(normalizedQuery)) score += 4000;
  if (title.includes(normalizedQuery)) score += 3000;
  if (searchBlob.includes(normalizedQuery)) score += 1200;

  const titleTokenHits = queryTokens.filter((token) => title.includes(token)).length;
  const blobTokenHits = queryTokens.filter((token) => searchBlob.includes(token)).length;

  score += titleTokenHits * 250;
  score += blobTokenHits * 80;

  return score;
}

export function searchLessonPlans(lessons: LessonPlan[], query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return lessons;
  }

  const exactTitleMatches = lessons.filter(
    (lesson) => normalizeText(lesson.title) === normalizedQuery
  );

  if (exactTitleMatches.length > 0) {
    return exactTitleMatches;
  }

  return lessons
    .map((lesson, index) => ({
      lesson,
      index,
      score: scoreLessonForSearch(lesson, normalizedQuery)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.lesson);
}

export function matchesLessonFilters(
  lesson: LessonPlan,
  filters: {
    gradeLevel: string;
    subject: string;
    duration: string;
  }
) {
  const gradeMatches =
    !filters.gradeLevel ||
    normalizeGradeLevels(lesson.gradeLevel).includes(filters.gradeLevel);

  const subjectMatches =
    !filters.subject ||
    normalizeSubjects(lesson.subject).some(
      (subject) =>
        normalizeText(subject) === normalizeText(filters.subject) ||
        normalizeText(subject).includes(normalizeText(filters.subject)) ||
        normalizeText(filters.subject).includes(normalizeText(subject))
    );

  const durationMatches =
    !filters.duration || lessonMatchesDuration(lesson.duration, filters.duration);

  return gradeMatches && subjectMatches && durationMatches;
}

export function getRandomLessonPlans(lessons: LessonPlan[], count: number) {
  const pool = [...lessons];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, count);
}
