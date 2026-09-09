import type { TestCategoryMap, TestResult } from "../types/testResult";

// --- Category ---

export type CategoryFilter = "all" | "psy0" | "psy1";

export const filterByCategory = (
  scoreList: TestResult[],
  categories: TestCategoryMap,
  filter: CategoryFilter
): TestResult[] =>
  filter === "all" ? scoreList : scoreList.filter((r) => categories[r.test] === filter);

// --- Stanine colors ---

// Palette utilisée partout où une classe stanine est affichée (StanineDisplay,
// liste des résultats d'une période...), du rouge (classe 1) au vert sapin
// (classe 9), en passant par des tons chauds intermédiaires.
const STANINE_COLORS = [
  "#b33939", // 1 - Rouge mat
  "#cd533b", // 2
  "#d87b5a", // 3 - Orange brûlé
  "#d8a657", // 4 - Ocre
  "#c7b98b", // 5 - Taupe ton chaud
  "#8aa87f", // 6 - Vert olive doux
  "#5d8c61", // 7 - Vert mat
  "#3e7c59", // 8 - Vert foncé mat
  "#2d5d4d", // 9 - Vert sapin profond
] as const;

export const getStanineColor = (stanine: number): string =>
  STANINE_COLORS[Math.round(stanine) - 1] ?? "#9e9e9e";

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
  const [, day, month, year, time] = dateString.split(" ");
  const monthKey = stripAccents(month.toLowerCase()) as MonthKey;
  const date = new Date(parseInt(year), dateDict[monthKey], parseInt(day));
  const timeMatch = time?.match(/^(\d{1,2})h(\d{2})$/);
  if (timeMatch) date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
  return date;
};

// Pilotest ne garantit pas que /results renvoie les tentatives dans l'ordre
// chronologique (elles peuvent être groupées par test) — or getStanineStreak,
// meanStanineOnLastFive et computeTrend supposent toutes une liste triée du
// plus ancien au plus récent. Tri stable : à horodatage égal, l'ordre d'origine
// est conservé.
export const sortByAtDate = (list: TestResult[]): TestResult[] =>
  [...list].sort((a, b) => parseAtDate(a.at).getTime() - parseAtDate(b.at).getTime());

// Une tentative n'a pas d'identifiant propre : le couple test+date-heure sert
// de clé naturelle (deux tentatives du même test à la même minute sont, de
// toute façon, indiscernables dans les données renvoyées par pilotest.com).
const resultKey = (r: TestResult): string => `${r.test}__${r.at}`;

// Compte, dans `next`, les résultats absents de `previous` — utilisé pour
// annoncer "X nouveaux résultats" après une synchronisation.
export const countNewResults = (previous: TestResult[], next: TestResult[]): number => {
  const previousKeys = new Set(previous.map(resultKey));
  return next.filter((r) => !previousKeys.has(resultKey(r))).length;
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
  nbAttempts: number;
  reason: string;
  label: "Insuffisant" | "À améliorer" | "Proche de l'objectif";
};

// Volume de pratique au-delà duquel une faiblesse est considérée "confirmée"
// (cohérent avec la fenêtre "5 derniers" utilisée par meanStanineOnLastFive/lastFive).
const CONFIDENCE_CAP = 5;
// Bonus de priorité max pour une faiblesse confirmée par la répétition — additif,
// pour ne jamais écraser la priorité (basée sur la sévérité) des tests peu tentés.
const REPETITION_BOOST = 0.5;

const getWorkOnReason = (nbAttempts: number): string =>
  nbAttempts >= CONFIDENCE_CAP
    ? `Faiblesse confirmée sur ${nbAttempts} tentatives`
    : `Encore peu de données (${nbAttempts} tentative${nbAttempts > 1 ? "s" : ""})`;

export const getWorkOnList = (
  scoreList: TestResult[],
  getStreak: (test: string) => number,
  max: number = 5
): WorkOnEntry[] => {
  const testNames = [...new Set(scoreList.map((r) => r.test))];

  const ranked: { entry: WorkOnEntry; priority: number }[] = testNames
    .map((name) => {
      const forTest = scoreList.filter((r) => r.test === name);
      const nbAttempts = forTest.length;
      const lastFive = forTest.slice(-5).map((r) => r.stanine);
      const mean = computeMean(lastFive);
      const streak = getStreak(name);

      let label: WorkOnEntry["label"];
      if (mean < 5) label = "Insuffisant";
      else if (mean < 6) label = "À améliorer";
      else label = "Proche de l'objectif";

      const severity = 7 - mean;
      const confirmedWeaknessBoost =
        (Math.min(nbAttempts, CONFIDENCE_CAP) / CONFIDENCE_CAP) * REPETITION_BOOST;
      const priority = severity * (1 + confirmedWeaknessBoost);

      const entry: WorkOnEntry = {
        test: name,
        meanStanine: mean,
        streak,
        nbAttempts,
        reason: getWorkOnReason(nbAttempts),
        label,
      };

      return { entry, priority };
    })
    .filter((r) => r.entry.meanStanine < 7);

  ranked.sort((a, b) =>
    a.priority !== b.priority ? b.priority - a.priority : a.entry.streak - b.entry.streak
  );

  return ranked.slice(0, max).map((r) => r.entry);
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
