import { useMemo } from "react";
import type { TestResult } from "../types/testResult";
import {
  filterByHighestStanine,
  getStanineStreak,
  meanStanineOnLastFive,
  getWorkOnList,
  buildTrendMap,
  parseAtDate,
  isSameDay,
  isDateInWeekOf,
} from "../utils/scoreTools";

export default function useScoreDerived(scoreList: TestResult[]) {
  return useMemo(() => {
    const getStreak = (test: string) =>
      getStanineStreak(scoreList.filter((e) => e.test === test));

    const totalScore = scoreList.length;

    const now = new Date();

    const totalTodayScore = scoreList.filter((s) =>
      isSameDay(parseAtDate(s.at), now)
    ).length;

    const totalWeekScore = scoreList.filter((s) =>
      isDateInWeekOf(s.at, now)
    ).length;

    return {
      highestStanineList: filterByHighestStanine(scoreList),
      meanStanineList: meanStanineOnLastFive(scoreList),
      getStreak,
      totalResume: { totalScore, totalTodayScore, totalWeekScore },
      workOnList: getWorkOnList(scoreList, getStreak),
      trendMap: buildTrendMap(scoreList),
    };
  }, [scoreList]);
}
