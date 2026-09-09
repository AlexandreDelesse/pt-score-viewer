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

  // Trie aussi ici, indépendamment de updateScoreList : un appelant peut passer
  // une liste brute fraîchement reçue (ex. juste après une sync) avant que le
  // state `scoreList` trié ait eu le temps de se propager, ce qui persisterait
  // l'ordre non trié dans le localStorage.
  const save = (list: TestResult[] = scoreList) =>
    window.localStorage.setItem("results", JSON.stringify(sortByAtDate(list)));

  return { scoreList, updateScoreList, save };
}
