import { useState } from "react";

const STORAGE_KEY = "examGoal";

export interface ExamGoal {
  start: string; // "YYYY-MM-DD"
  end: string;
}

const DEFAULT_EXAM_GOAL: ExamGoal = { start: "2026-10-19", end: "2026-10-30" };

const loadExamGoal = (): ExamGoal => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EXAM_GOAL;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "start" in parsed &&
      "end" in parsed &&
      typeof (parsed as ExamGoal).start === "string" &&
      typeof (parsed as ExamGoal).end === "string"
    ) {
      return parsed as ExamGoal;
    }
    return DEFAULT_EXAM_GOAL;
  } catch {
    return DEFAULT_EXAM_GOAL;
  }
};

export default function useExamGoal() {
  const [examGoal, setExamGoalState] = useState<ExamGoal>(loadExamGoal);

  const setExamGoal = (goal: ExamGoal) => {
    setExamGoalState(goal);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  };

  return { examGoal, setExamGoal };
}
