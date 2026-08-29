import { useEffect, useState } from "react";
import type { TestResult } from "../types/testResult";

export default function useScores() {
  const [scoreList, setScoreList] = useState<TestResult[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("results");
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setScoreList(parsed as TestResult[]);
    } catch {
      window.localStorage.removeItem("results");
    }
  }, []);

  const updateScoreList = (list: TestResult[]) => setScoreList(list);

  const save = (list: TestResult[] = scoreList) =>
    window.localStorage.setItem("results", JSON.stringify(list));

  return { scoreList, updateScoreList, save };
}
