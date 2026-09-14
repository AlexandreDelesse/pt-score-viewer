/**
 * usePilotestSync — Hook React Query (TypeScript)
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage :
 *   const { results, isLoading, isSyncing, error, sync, configure } = usePilotestSync()
 */

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TestResult } from "../types/testResult";

const SERVER = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServerStatus {
  configured:   boolean;
  sync_running: boolean;
  last_error:   string | null;
  updated_at:   string | null;
  count:        number;
}

interface ResultsResponse {
  results:    TestResult[];
  updated_at: string;
}

interface MutationResponse {
  ok:      boolean;
  message: string;
  error?:  string;
}

interface ConfigurePayload {
  cookie: string;
}

interface PilotestCookieMessage {
  source: "pt-score-viewer-extension";
  type:   "PILOTEST_COOKIE";
  cookie: string;
}

function isPilotestCookieMessage(data: unknown): data is PilotestCookieMessage {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.source === "pt-score-viewer-extension" &&
    d.type === "PILOTEST_COOKIE" &&
    typeof d.cookie === "string"
  );
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

const api = {
  status: async (): Promise<ServerStatus> => {
    const r = await fetch(`${SERVER}/status`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error("Serveur local indisponible");
    return r.json();
  },

  results: async (): Promise<ResultsResponse> => {
    const r = await fetch(`${SERVER}/results`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error("Résultats indisponibles");
    return r.json();
  },

  sync: async (): Promise<MutationResponse> => {
    const r = await fetch(`${SERVER}/sync`, { method: "POST" });
    const data: MutationResponse = await r.json();
    if (!data.ok) throw new Error(data.error ?? "Erreur sync");
    return data;
  },

  configure: async ({ cookie }: ConfigurePayload): Promise<MutationResponse> => {
    const r = await fetch(`${SERVER}/configure`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ cookie }),
    });
    const data: MutationResponse = await r.json();
    if (!data.ok) throw new Error(data.error ?? "Erreur configuration");
    return data;
  },

  importResults: async (results: TestResult[]): Promise<MutationResponse> => {
    const r = await fetch(`${SERVER}/results`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ results }),
    });
    const data: MutationResponse = await r.json();
    if (!data.ok) throw new Error(data.error ?? "Erreur d'enregistrement des résultats");
    return data;
  },
};

// Enregistre des résultats importés manuellement dans le même cache serveur que
// la sync pilotest.com (server.js POST /results) — pour qu'ils survivent à un
// changement de navigateur/appareil, comme le fait déjà la sync. Fonction
// autonome (pas via le hook) : appelable depuis n'importe quel composant sans
// déclencher les effets (auto-sync, pont extension) de usePilotestSync.
export async function importResultsToServer(results: TestResult[]): Promise<void> {
  await api.importResults(results);
}

// ── Hook principal ────────────────────────────────────────────────────────────

export default function usePilotestSync() {
  const queryClient = useQueryClient();

  // Statut du serveur — poolé toutes les 3s si une sync est en cours
  const statusQuery = useQuery({
    queryKey: ["pilotest", "status"],
    queryFn:  api.status,
    refetchInterval: (query: { state: { data?: ServerStatus } }) =>
      query.state.data?.sync_running ? 3000 : false,
    retry: false,
  });

  const isSyncing    = statusQuery.data?.sync_running ?? false;
  const isConfigured = statusQuery.data?.configured   ?? false;

  // Résultats — rechargés automatiquement quand la sync se termine
  const resultsQuery = useQuery({
    queryKey:  ["pilotest", "results"],
    queryFn:   api.results,
    enabled:   isConfigured && !isSyncing,
    staleTime: 5 * 60 * 1000,
    select:    (data: ResultsResponse) => data.results,
  });

  // Mutation : déclenche une sync manuelle
  const syncMutation = useMutation({
    mutationFn: api.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilotest", "status"] });
    },
  });

  // Resynchronise automatiquement une fois par chargement de page si déjà configuré
  const hasAutoSynced = useRef(false);

  useEffect(() => {
    if (isConfigured && !isSyncing && !hasAutoSynced.current) {
      hasAutoSynced.current = true;
      syncMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, isSyncing]);

  // Mutation : configure les identifiants puis sync
  const configureMutation = useMutation({
    mutationFn: api.configure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pilotest", "status"] });
      syncMutation.mutate();
    },
  });

  // Pont navigateur (extension) : content.js marque le document dès son
  // injection si l'extension est installée. Si elle est là, on lui demande le
  // cookie pilotest.com à chaque chargement et on l'applique automatiquement
  // dès qu'il arrive — inutile de le copier à la main.
  const [hasBrowserBridge] = useState(
    () => document.documentElement.dataset.ptCookieBridge === "1"
  );

  useEffect(() => {
    if (!hasBrowserBridge) return;

    function handleMessage(e: MessageEvent) {
      if (e.source !== window) return;
      if (!isPilotestCookieMessage(e.data)) return;
      const cookie = e.data.cookie.trim();
      if (cookie) configureMutation.mutate({ cookie });
    }

    window.addEventListener("message", handleMessage);
    window.postMessage(
      { source: "pt-score-viewer", type: "REQUEST_PILOTEST_COOKIE" },
      window.location.origin
    );
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBrowserBridge]);

  return {
    // Données
    results:   resultsQuery.data ?? null,
    updatedAt: statusQuery.data?.updated_at ?? null,

    // États
    isLoading:    resultsQuery.isLoading,
    isSyncing,
    isConfigured,
    serverDown:   statusQuery.isError,
    hasBrowserBridge,

    // Erreurs
    error: syncMutation.error?.message
        ?? configureMutation.error?.message
        ?? statusQuery.data?.last_error
        ?? resultsQuery.error?.message
        ?? null,

    // Actions
    sync:      () => syncMutation.mutate(),
    configure: (cookie: string) => configureMutation.mutate({ cookie }),
  };
}
