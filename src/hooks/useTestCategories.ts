import { useEffect, useState } from "react";
import type { TestCategory, TestCategoryMap } from "../types/testResult";

const STORAGE_KEY = "testCategories";
const SERVER = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000";

const loadLocalCategories = (): TestCategoryMap => {
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

const saveLocalCategories = (categories: TestCategoryMap) =>
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

export default function useTestCategories() {
  // Le localStorage sert de cache : rendu instantané au démarrage, et repli si
  // le serveur (source de vérité, partagée entre supports) est injoignable.
  const [categories, setCategories] = useState<TestCategoryMap>(loadLocalCategories);

  useEffect(() => {
    fetch(`${SERVER}/categories`, { signal: AbortSignal.timeout(5000) })
      .then((r) => (r.ok ? (r.json() as Promise<{ categories?: TestCategoryMap }>) : null))
      .then((data) => {
        if (!data?.categories) return;
        setCategories(data.categories);
        saveLocalCategories(data.categories);
      })
      .catch(() => {
        // Serveur indisponible : on reste sur la version locale déjà chargée.
      });
  }, []);

  const setCategory = (test: string, category: TestCategory | null) => {
    setCategories((prev) => {
      const next = { ...prev };
      if (category === null) delete next[test];
      else next[test] = category;

      saveLocalCategories(next);
      fetch(`${SERVER}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: next }),
      }).catch(() => {
        // Serveur indisponible : la modification reste appliquée localement,
        // elle sera resynchronisée au prochain chargement réussi depuis le serveur.
      });

      return next;
    });
  };

  return { categories, setCategory };
}
