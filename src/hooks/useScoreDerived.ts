import { useMemo } from "react";
import type { TestResult } from "../types/testResult";
import {
  filterByHighestStanine,
  getStanineStreak,
  meanStanineOnLastFive,
  getWorkOnList,
  buildTrendMap,
} from "../utils/scoreTools";

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

function isDateInCurrentWeek(dateString: string): boolean {
  const [_weekDay, dayStr, month, year] = dateString.split(" ");
  const date = new Date(
    parseInt(year),
    dateDict[month.toLocaleLowerCase() as MonthKey],
    parseInt(dayStr)
  );
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

export default function useScoreDerived(scoreList: TestResult[]) {
  return useMemo(() => {
    const getStreak = (test: string) =>
      getStanineStreak(scoreList.filter((e) => e.test === test));

    const totalScore = scoreList.length;

    const totalTodayScore = scoreList.filter((s) => {
      const [_weekDay, day, month, year, _time] = s.at.split(" ");
      return (
        new Date(
          parseInt(year),
          dateDict[month.toLocaleLowerCase() as MonthKey],
          parseInt(day)
        ).getDate() === new Date().getDate()
      );
    }).length;

    const totalWeekScore = scoreList.filter((s) =>
      isDateInCurrentWeek(s.at)
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
