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


export const sortScoreList = (list: TestResult[]) =>
  list.sort((a, b) => a.stanine - b.stanine);
