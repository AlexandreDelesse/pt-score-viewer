import { useState } from "react";
import type { TestCategory, TestCategoryMap } from "../types/testResult";

const STORAGE_KEY = "testCategories";

const loadCategories = (): TestCategoryMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as TestCategoryMap;
    }
    return {};
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return {};
  }
};

export default function useTestCategories() {
  const [categories, setCategories] = useState<TestCategoryMap>(loadCategories);

  const setCategory = (test: string, category: TestCategory | null) => {
    setCategories((prev) => {
      const next = { ...prev };
      if (category === null) delete next[test];
      else next[test] = category;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { categories, setCategory };
}
