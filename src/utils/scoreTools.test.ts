import { describe, it, expect } from "vitest";
import type { TestCategoryMap, TestResult } from "../types/testResult";
import {
  countNewResults,
  filterByCategory,
  getStanineStreak,
  getWorkOnList,
  meanStanineOnLastFive,
  parseAtDate,
  sortByAtDate,
  isSameDay,
  isDateInWeekOf,
} from "./scoreTools";

describe("meanStanineOnLastFive", () => {
  it("limits the last 5 values and compute mean stanine", () => {
    expect(meanStanineOnLastFive(mockData)).toStrictEqual([
      {
        stanine: 4.2,
        test: "Formes et couleurs",
        score: "",
        at: "",
      },
    ]);
  });
});

describe("Returns current streak", () => {
  it("returns current streak above stanine 7 if no threshold parameters", () =>
    expect(getStanineStreak(mockData)).toBe(0));

  it("returns current streak above threshold", () =>
    expect(getStanineStreak(mockData, 5)).toBe(1));

  it("returns current streak above threshold", () =>
    expect(getStanineStreak(mockData, 4)).toBe(7));
});

describe("filterByCategory", () => {
  const scoreList: TestResult[] = [
    { test: "Billes", score: "75%", stanine: 5, at: "" },
    { test: "Cubes 2D/3D - psy0 Air France", score: "50%", stanine: 4, at: "" },
    { test: "Séries logiques", score: "60%", stanine: 5, at: "" },
  ];

  const categories: TestCategoryMap = {
    "Cubes 2D/3D - psy0 Air France": "psy0",
    "Séries logiques": "psy1",
  };

  it("returns everything for filter 'all'", () => {
    expect(filterByCategory(scoreList, categories, "all")).toEqual(scoreList);
  });

  it("only keeps tests tagged for the requested category", () => {
    expect(filterByCategory(scoreList, categories, "psy0")).toEqual([scoreList[1]]);
    expect(filterByCategory(scoreList, categories, "psy1")).toEqual([scoreList[2]]);
  });

  it("excludes untagged tests from a specific category filter", () => {
    const result = filterByCategory(scoreList, categories, "psy0");
    expect(result.some((r) => r.test === "Billes")).toBe(false);
  });
});

describe("getWorkOnList", () => {
  const noStreak = () => 0;

  const attempts = (test: string, n: number, stanine: number): TestResult[] =>
    Array.from({ length: n }, () => ({ test, score: "", stanine, at: "" }));

  it("ranks a confirmed weakness (many attempts) above a one-off low attempt at the same mean", () => {
    const scoreList = [
      ...attempts("Rarement tenté", 1, 3),
      ...attempts("Souvent raté", 20, 3),
    ];

    const list = getWorkOnList(scoreList, noStreak);

    expect(list.map((e) => e.test)).toEqual(["Souvent raté", "Rarement tenté"]);
  });

  it("still surfaces a low-attempt weak test instead of dropping it", () => {
    const scoreList = attempts("Rarement tenté", 1, 3);

    const list = getWorkOnList(scoreList, noStreak);

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      test: "Rarement tenté",
      nbAttempts: 1,
      reason: "Encore peu de données (1 tentative)",
    });
  });

  it("labels an attempt count at or above the confidence cap as a confirmed weakness", () => {
    const scoreList = attempts("Souvent raté", 5, 3);

    const list = getWorkOnList(scoreList, noStreak);

    expect(list[0].reason).toBe("Faiblesse confirmée sur 5 tentatives");
  });
});

describe("parseAtDate", () => {
  it("parses non-accented months", () => {
    const date = parseAtDate("lundi 20 Octobre 2025 11h47");
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(9); // octobre = index 9
    expect(date.getDate()).toBe(20);
  });

  it("parses accented months (Décembre, Février, Août)", () => {
    expect(parseAtDate("mercredi 03 Décembre 2025 06h17").getMonth()).toBe(11);
    expect(parseAtDate("samedi 14 Février 2026 09h00").getMonth()).toBe(1);
    expect(parseAtDate("vendredi 01 Août 2025 08h00").getMonth()).toBe(7);
  });
});

describe("parseAtDate — time component", () => {
  it("parses the hour and minute instead of discarding them", () => {
    const date = parseAtDate("mardi 18 Août 2026 15h09");
    expect(date.getHours()).toBe(15);
    expect(date.getMinutes()).toBe(9);
  });
});

describe("sortByAtDate", () => {
  it("reorders entries chronologically, including intra-day inversions", () => {
    // Reproduit un extrait réel où pilotest.com renvoie les tentatives dans
    // un ordre qui n'est pas strictement chronologique (15h09 avant 15h00).
    const scoreList: TestResult[] = [
      { test: "Calcul mental 1", score: "10%", stanine: 2, at: "mardi 18 Août 2026 15h09" },
      { test: "Grilles de calculs", score: "70%", stanine: 4, at: "mardi 18 Août 2026 15h00" },
      { test: "Calcul mental 1", score: "10%", stanine: 2, at: "mardi 18 Août 2026 15h13" },
    ];

    expect(sortByAtDate(scoreList).map((r) => r.at)).toEqual([
      "mardi 18 Août 2026 15h00",
      "mardi 18 Août 2026 15h09",
      "mardi 18 Août 2026 15h13",
    ]);
  });

  it("reorders entries that jump backward across weeks", () => {
    // Reproduit un extrait réel : un bloc du 11 Août apparaissait après des
    // entrées du 19 Août dans la réponse brute de pilotest.com.
    const scoreList: TestResult[] = [
      { test: "Calcul mental 1", score: "10%", stanine: 2, at: "mercredi 19 Août 2026 15h29" },
      { test: "Grilles de calculs", score: "30%", stanine: 1, at: "mardi 11 Août 2026 20h51" },
      { test: "Calcul mental 2", score: "20%", stanine: 1, at: "mercredi 19 Août 2026 18h32" },
    ];

    expect(sortByAtDate(scoreList).map((r) => r.at)).toEqual([
      "mardi 11 Août 2026 20h51",
      "mercredi 19 Août 2026 15h29",
      "mercredi 19 Août 2026 18h32",
    ]);
  });

  it("does not mutate the input list", () => {
    const scoreList: TestResult[] = [
      { test: "A", score: "10%", stanine: 2, at: "mardi 18 Août 2026 15h09" },
      { test: "B", score: "10%", stanine: 2, at: "mardi 18 Août 2026 15h00" },
    ];
    const original = [...scoreList];
    sortByAtDate(scoreList);
    expect(scoreList).toEqual(original);
  });
});

describe("countNewResults", () => {
  const at = (h: string) => `mardi 18 Août 2026 ${h}`;

  it("counts entries in next that are absent from previous", () => {
    const previous: TestResult[] = [
      { test: "Billes", score: "75%", stanine: 5, at: at("11h41") },
    ];
    const next: TestResult[] = [
      ...previous,
      { test: "Billes", score: "85%", stanine: 6, at: at("11h49") },
      { test: "Airways", score: "55%", stanine: 4, at: at("15h47") },
    ];

    expect(countNewResults(previous, next)).toBe(2);
  });

  it("returns 0 when nothing changed", () => {
    const scoreList: TestResult[] = [
      { test: "Billes", score: "75%", stanine: 5, at: at("11h41") },
    ];
    expect(countNewResults(scoreList, scoreList)).toBe(0);
  });

  it("treats same test+timestamp as the same attempt even if the score differs", () => {
    // Un même couple test+date-heure ne peut correspondre qu'à une seule
    // tentative réelle : une différence de score à cette clé est un détail
    // de resynchronisation, pas un nouveau résultat.
    const previous: TestResult[] = [
      { test: "Billes", score: "75%", stanine: 5, at: at("11h41") },
    ];
    const next: TestResult[] = [
      { test: "Billes", score: "80%", stanine: 5, at: at("11h41") },
    ];
    expect(countNewResults(previous, next)).toBe(0);
  });

  it("counts every entry as new when previous is empty (first sync)", () => {
    const next: TestResult[] = [
      { test: "Billes", score: "75%", stanine: 5, at: at("11h41") },
      { test: "Airways", score: "55%", stanine: 4, at: at("15h47") },
    ];
    expect(countNewResults([], next)).toBe(2);
  });
});

describe("isSameDay", () => {
  const today = new Date(2025, 9, 22); // mercredi 22 Octobre 2025

  it("returns true for the same year/month/day", () => {
    expect(isSameDay(parseAtDate("mercredi 22 Octobre 2025 14h22"), today)).toBe(true);
  });

  it("returns false for the same day-of-month but a different month/year", () => {
    // Regression test: previously only .getDate() was compared, so any past
    // test taken on the 22nd of any month/year was wrongly counted as "today".
    expect(isSameDay(parseAtDate("mercredi 22 Octobre 2024 14h22"), today)).toBe(false);
    expect(isSameDay(parseAtDate("samedi 22 Novembre 2025 14h22"), today)).toBe(false);
  });
});

describe("isDateInWeekOf", () => {
  const wednesday = new Date(2025, 9, 22); // mercredi 22 Octobre 2025, semaine du 20 au 26

  it("includes the start (Monday) and matching days of that week", () => {
    expect(isDateInWeekOf("lundi 20 Octobre 2025 11h47", wednesday)).toBe(true);
    expect(isDateInWeekOf("mercredi 22 Octobre 2025 14h22", wednesday)).toBe(true);
  });

  it("excludes dates outside that week", () => {
    expect(isDateInWeekOf("jeudi 30 Octobre 2025 15h38", wednesday)).toBe(false);
  });

  it("correctly excludes accented months instead of silently failing", () => {
    // Regression test: the old dateDict lookup didn't strip accents, so
    // "Décembre" produced an Invalid Date and always evaluated to false —
    // this asserts the exclusion now happens for the right reason (out of
    // week range), by also checking a valid accented-month date is parsed.
    expect(isDateInWeekOf("mercredi 03 Décembre 2025 06h17", wednesday)).toBe(false);
    expect(
      isDateInWeekOf("mercredi 22 Octobre 2025 06h17", new Date(2025, 9, 22))
    ).toBe(true);
  });
});

const mockData: TestResult[] = [
  { test: "Formes et couleurs", score: "71%", stanine: 3, at: "lundi 20 Octobre 2025 11h47" },
  { test: "Formes et couleurs", score: "88%", stanine: 5, at: "lundi 20 Octobre 2025 11h49" },
  { test: "Formes et couleurs", score: "67%", stanine: 2, at: "mercredi 22 Octobre 2025 14h22" },
  { test: "Formes et couleurs", score: "86%", stanine: 4, at: "mercredi 22 Octobre 2025 14h24" },
  { test: "Formes et couleurs", score: "83%", stanine: 4, at: "mercredi 22 Octobre 2025 14h26" },
  { test: "Formes et couleurs", score: "84%", stanine: 4, at: "jeudi 30 Octobre 2025 15h38" },
  { test: "Formes et couleurs", score: "84%", stanine: 4, at: "jeudi 30 Octobre 2025 15h40" },
  { test: "Formes et couleurs", score: "86%", stanine: 4, at: "jeudi 30 Octobre 2025 15h42" },
  { test: "Formes et couleurs", score: "83%", stanine: 4, at: "mercredi 03 Décembre 2025 06h17" },
  { test: "Formes et couleurs", score: "88%", stanine: 5, at: "mercredi 03 Décembre 2025 06h20" },
];
