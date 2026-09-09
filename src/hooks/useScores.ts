import { useEffect, useState } from "react";
import type { TestResult } from "../types/testResult";
import { sortByAtDate } from "../utils/scoreTools";

export default function useScores() {
  const [scoreList, setScoreList] = useState<TestResult[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("results");
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setScoreList(sortByAtDate(parsed as TestResult[]));
    } catch {
      window.localStorage.removeItem("results");
    }
  }, []);

  // Trie systématiquement ici : c'est le seul point d'entrée des données dans
  // l'état de l'app (sync pilotest ou import JSON), donc tout le reste du code
  // (streak, tendance, moyenne sur les 5 derniers...) peut supposer un ordre
  // chronologique sans avoir à retrier lui-même.
  const updateScoreList = (list: TestResult[]) => setScoreList(sortByAtDate(list));

  const save = (list: TestResult[] = scoreList) =>
    window.localStorage.setItem("results", JSON.stringify(list));

  return { scoreList, updateScoreList, save };
}
