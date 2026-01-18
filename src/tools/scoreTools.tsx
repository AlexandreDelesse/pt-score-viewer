import type { TestResult } from "../types/testRestult";

export const filterByHighestStanine = (scoreList: TestResult[]) => {
  let stanineFiltered: TestResult[] = [];
  scoreList.forEach((s: TestResult) => {
    let curStan = stanineFiltered.find((t) => t.test == s.test);
    if (!curStan) stanineFiltered = [...stanineFiltered, s];
    else {
      if (curStan.stanine < s.stanine) {
        stanineFiltered = [
          ...stanineFiltered.filter((x) => x.test != s.test),
          s,
        ];
      }
    }
  });
  return sortScoreList(stanineFiltered);
};

export const meanStanineOnLastFive = (scoreList: TestResult[]) => {
  let meanStanine: TestResult[] = [];
  scoreList.forEach((score) => {
    if (meanStanine.find((s) => score.test == s.test)) return;
    const lastFive = scoreList.filter((s) => s.test == score.test).slice(-5);
    const mean =
      lastFive.reduce((sum, item) => sum + item.stanine, 0) / lastFive.length;
    meanStanine = [
      ...meanStanine,
      { test: score.test, at: "", score: "", stanine: mean },
    ];
  });
  console.log(meanStanine);
  return sortScoreList(meanStanine);
};

export const getMeanOnLastN = (list: TestResult, _n: number) => {
  //TODO: Implement
  return list;
};

export const getStanineStreak = (
  list: TestResult[],
  stanineThreshold: number = 7
) => {
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].stanine >= stanineThreshold) streak++;
    else break;
  }

  return streak;
};

export const limitLastN = (_list: TestResult, _n: number) => {
  //TODO: Implement
  return [];
};

export const computeMean = (_list: number[]) => {
  //TODO: Implement
  return 0;
};

export const sortScoreList = (list: TestResult[]) =>
  list.sort((a, b) => a.stanine - b.stanine);
