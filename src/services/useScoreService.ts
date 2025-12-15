import { useEffect, useState } from "react";
import type { TestResult } from "../types/testRestult";
import {
  filterByHighestStanine,
  getStanineStreak,
  meanStanineOnLastFive,
} from "../tools/scoreTools";

export default function useScoreService() {
  const [scoreList, setScoreList] = useState<TestResult[]>([]);

  useEffect(() => {
    const r = window.localStorage.getItem("results") || "[]";
    setScoreList(JSON.parse(r));
  }, []);

  const updateScoreList = (list: TestResult[]) => setScoreList(list);

  const getStreak = (test: string) =>
    getStanineStreak(scoreList.filter((e) => e.test == test));

  return {
    scoreList,
    highestStanineList: filterByHighestStanine(scoreList),
    meanStanineList: meanStanineOnLastFive(scoreList),
    updateScoreList,
    getStreak,
  };
}
