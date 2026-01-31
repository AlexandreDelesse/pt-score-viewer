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

  // const weekDayDict = {
  //   lundi: 1,
  //   mardi: 2,
  //   mercredi: 3,
  //   jeudi: 4,
  //   vendredi: 5,
  //   samedi: 6,
  //   dimanche: 7,
  // };

  const isDateInCurrentWeek = (dateString: string) => {
    const [_weekDay, dayStr, month, year, _time] = dateString.split(" ");

    const date = new Date(
      parseInt(year),
      dateDict[month.toLocaleLowerCase() as MonthKey],
      parseInt(dayStr),
    );
    const now = new Date();

    // Copie de la date actuelle
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 = dimanche, 1 = lundi...

    // Ajustement pour que la semaine commence le lundi
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return date >= startOfWeek && date <= endOfWeek;
  };

  const totalScore = scoreList.length;
  const totalTodayScore = scoreList.filter((s) => {
    const [_weekDay, day, month, year, _time] = s.at.split(" ");

    return (
      new Date(
        parseInt(year),
        dateDict[month.toLocaleLowerCase() as MonthKey],
        parseInt(day),
      ).getDate() == new Date().getDate()
    );
  }).length;
  const totalWeekScore = scoreList.filter((s) =>
    isDateInCurrentWeek(s.at),
  ).length;

  return {
    scoreList,
    highestStanineList: filterByHighestStanine(scoreList),
    meanStanineList: meanStanineOnLastFive(scoreList),
    updateScoreList,
    getStreak,
    totalResume: { totalScore, totalTodayScore, totalWeekScore },
  };
}
