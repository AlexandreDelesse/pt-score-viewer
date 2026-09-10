import { useEffect, useMemo, useState } from "react";
import type { TestResult } from "../types/testResult";
import {
  filterByHighestStanine,
  getStanineStreak,
  meanStanineOnLastFive,
  getWorkOnList,
  getDailyFocus,
  buildTrendMap,
  parseAtDate,
  isSameDay,
  isDateInWeekOf,
} from "../utils/scoreTools";

export default function useScoreDerived(scoreList: TestResult[]) {
  // "now" était figé au dernier changement de scoreList : si l'appli reste
  // ouverte pendant un changement de jour/semaine sans nouvelle donnée,
  // "Aujourd'hui"/"Cette semaine" restaient périmés. Un état rafraîchi
  // périodiquement recale le calcul sans attendre une action de l'utilisateur.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const getStreak = (test: string) =>
      getStanineStreak(scoreList.filter((e) => e.test === test));

    const todayResults = scoreList.filter((s) => isSameDay(parseAtDate(s.at), now));
    const weekResults = scoreList.filter((s) => isDateInWeekOf(s.at, now));
    const workOnList = getWorkOnList(scoreList, getStreak);

    return {
      highestStanineList: filterByHighestStanine(scoreList),
      meanStanineList: meanStanineOnLastFive(scoreList),
      getStreak,
      totalResume: {
        totalScore: scoreList.length,
        totalTodayScore: todayResults.length,
        totalWeekScore: weekResults.length,
      },
      todayResults,
      weekResults,
      workOnList,
      dailyFocus: getDailyFocus(workOnList, weekResults, now),
      trendMap: buildTrendMap(scoreList),
    };
  }, [scoreList, now]);
}
