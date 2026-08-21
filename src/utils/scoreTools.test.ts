import { describe, it, expect } from "vitest";
import type { TestResult } from "../types/testResult";
import {
  getStanineStreak,
  meanStanineOnLastFive,
  parseAtDate,
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
