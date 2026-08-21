import type { TestResult } from "../types/testResult";

// --- Date parsing ---

const dateDict = {
  janvier: 0,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
} as const;

type MonthKey = keyof typeof dateDict;

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Parses TestResult["at"] strings shaped like "lundi 20 Octobre 2025 11h41"
export const parseAtDate = (dateString: string): Date => {
  const [, day, month, year] = dateString.split(" ");
  const monthKey = stripAccents(month.toLowerCase()) as MonthKey;
  return new Date(parseInt(year), dateDict[monthKey], parseInt(day));
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isDateInWeekOf = (dateString: string, reference: Date): boolean => {
  const date = parseAtDate(dateString);
  const startOfWeek = new Date(reference);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
};

export const filterByHighestStanine = (scoreList: TestResult[]) => {
  let stanineFiltered: TestResult[] = [];
  scoreList.forEach((s: TestResult) => {
    const curStan = stanineFiltered.find((t) => t.test === s.test);
    if (!curStan) stanineFiltered = [...stanineFiltered, s];
    else {
      if (curStan.stanine < s.stanine) {
        stanineFiltered = [
          ...stanineFiltered.filter((x) => x.test !== s.test),
          s,
        ];
      }
    }
  });
  return sortScoreList(stanineFiltered);
};

export const meanStanineOnLastFive = (scoreList: TestResult[]) => {
  let meanStanine: TestResult[] = [];
  scoreList.forEach((score) => {
    if (meanStanine.find((s) => score.test === s.test)) return;
    const lastFive = scoreList.filter((s) => s.test === score.test).slice(-5);
    const mean =
      lastFive.reduce((sum, item) => sum + item.stanine, 0) / lastFive.length;
    meanStanine = [
      ...meanStanine,
      { test: score.test, at: "", score: "", stanine: mean },
    ];
  });
  return sortScoreList(meanStanine);
};

export const getMeanOnLastN = (list: TestResult, _n: number) => {
  //TODO: Implement
  return list;
};

export const getStanineStreak = (
  list: TestResult[],
  stanineThreshold: number = 7
) => {
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].stanine >= stanineThreshold) streak++;
    else break;
  }

  return streak;
};

export const limitLastN = (_list: TestResult, _n: number) => {
  //TODO: Implement
  return [];
};

export const computeMean = (list: number[]): number => {
  if (!list.length) return 0;
  return list.reduce((sum, v) => sum + v, 0) / list.length;
};

export const sortScoreList = (list: TestResult[]) =>
  list.sort((a, b) => a.stanine - b.stanine);

// --- Trend ---

export const computeTrend = (scoreList: TestResult[]): number => {
  const last3 = scoreList.slice(-3).map((r) => r.stanine);
  const prev3 = scoreList.slice(-6, -3).map((r) => r.stanine);
  if (!last3.length || !prev3.length) return 0;
  return computeMean(last3) - computeMean(prev3);
};

export const buildTrendMap = (
  scoreList: TestResult[]
): Record<string, number> => {
  const testNames = [...new Set(scoreList.map((r) => r.test))];
  const map: Record<string, number> = {};
  testNames.forEach((name) => {
    const forTest = scoreList.filter((r) => r.test === name);
    map[name] = computeTrend(forTest);
  });
  return map;
};

// --- Work on list ---

export type WorkOnEntry = {
  test: string;
  meanStanine: number;
  streak: number;
  label: "Insuffisant" | "À améliorer" | "Proche de l'objectif";
};

export const getWorkOnList = (
  scoreList: TestResult[],
  getStreak: (test: string) => number,
  max: number = 5
): WorkOnEntry[] => {
  const testNames = [...new Set(scoreList.map((r) => r.test))];

  const entries: WorkOnEntry[] = testNames
    .map((name) => {
      const forTest = scoreList.filter((r) => r.test === name);
      const lastFive = forTest.slice(-5).map((r) => r.stanine);
      const mean = computeMean(lastFive);
      const streak = getStreak(name);

      let label: WorkOnEntry["label"];
      if (mean < 5) label = "Insuffisant";
      else if (mean < 6) label = "À améliorer";
      else label = "Proche de l'objectif";

      return { test: name, meanStanine: mean, streak, label };
    })
    .filter((e) => e.meanStanine < 7);

  entries.sort((a, b) =>
    a.meanStanine !== b.meanStanine
      ? a.meanStanine - b.meanStanine
      : a.streak - b.streak
  );

  return entries.slice(0, max);
};

// --- Sort & filter ---

export type SortOption =
  | "stanine_asc"
  | "stanine_desc"
  | "count_desc"
  | "count_asc"
  | "trend_pos"
  | "trend_neg";

export type FilterOption = "all" | "work_on" | "mastered";

export const sortAndFilterResults = (
  meanStanineList: TestResult[],
  getNbOfTest: (name: string) => number,
  trendMap: Record<string, number>,
  sort: SortOption,
  filter: FilterOption
): TestResult[] => {
  let list = [...meanStanineList];

  if (filter === "work_on") list = list.filter((r) => r.stanine < 7);
  if (filter === "mastered") list = list.filter((r) => r.stanine >= 7);

  switch (sort) {
    case "stanine_asc":
      list.sort((a, b) => a.stanine - b.stanine);
      break;
    case "stanine_desc":
      list.sort((a, b) => b.stanine - a.stanine);
      break;
    case "count_desc":
      list.sort((a, b) => getNbOfTest(b.test) - getNbOfTest(a.test));
      break;
    case "count_asc":
      list.sort((a, b) => getNbOfTest(a.test) - getNbOfTest(b.test));
      break;
    case "trend_pos":
      list.sort((a, b) => (trendMap[b.test] ?? 0) - (trendMap[a.test] ?? 0));
      break;
    case "trend_neg":
      list.sort((a, b) => (trendMap[a.test] ?? 0) - (trendMap[b.test] ?? 0));
      break;
  }

  return list;
};

// --- Pilotest URL ---

export const testNameToSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "_");
