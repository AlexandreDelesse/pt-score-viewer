import { describe, it, expect } from "vitest";
import type { TestResult } from "../types/testRestult";
import { meanStanineOnLastFive } from "./scoreTools";

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

const mockData: TestResult[] = [
  {
    test: "Formes et couleurs",
    score: "71%",
    stanine: 3,
    at: "lundi 20 Octobre 2025 11h47",
  },
  {
    test: "Formes et couleurs",
    score: "88%",
    stanine: 5,
    at: "lundi 20 Octobre 2025 11h49",
  },
  {
    test: "Formes et couleurs",
    score: "67%",
    stanine: 2,
    at: "mercredi 22 Octobre 2025 14h22",
  },
  {
    test: "Formes et couleurs",
    score: "86%",
    stanine: 4,
    at: "mercredi 22 Octobre 2025 14h24",
  },
  {
    test: "Formes et couleurs",
    score: "83%",
    stanine: 4,
    at: "mercredi 22 Octobre 2025 14h26",
  },
  {
    test: "Formes et couleurs",
    score: "84%",
    stanine: 4,
    at: "jeudi 30 Octobre 2025 15h38",
  },
  {
    test: "Formes et couleurs",
    score: "84%",
    stanine: 4,
    at: "jeudi 30 Octobre 2025 15h40",
  },
  {
    test: "Formes et couleurs",
    score: "86%",
    stanine: 4,
    at: "jeudi 30 Octobre 2025 15h42",
  },
  {
    test: "Formes et couleurs",
    score: "83%",
    stanine: 4,
    at: "mercredi 03 Décembre 2025 06h17",
  },
  {
    test: "Formes et couleurs",
    score: "88%",
    stanine: 5,
    at: "mercredi 03 Décembre 2025 06h20",
  },
];
