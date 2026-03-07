/**
 * usePilotestSync — Hook React Query (TypeScript)
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage :
 *   const { results, isLoading, isSyncing, error, sync, configure } = usePilotestSync()
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TestResult } from "../types/testResult";

const SERVER = "http://localhost:5000";

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
  email:    string;
  password: string;
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

  configure: async ({ email, password }: ConfigurePayload): Promise<MutationResponse> => {
    const r = await fetch(`${SERVER}/configure`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data: MutationResponse = await r.json();
    if (!data.ok) throw new Error(data.error ?? "Erreur configuration");
    return data;
  },
};

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

  // Mutation : configure les identifiants puis sync
  const configureMutation = useMutation({
    mutationFn: api.configure,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pilotest", "status"] });
      syncMutation.mutate();
    },
  });

  return {
    // Données
    results:   resultsQuery.data ?? null,
    updatedAt: statusQuery.data?.updated_at ?? null,

    // États
    isLoading:    resultsQuery.isLoading,
    isSyncing,
    isConfigured,
    serverDown:   statusQuery.isError,

    // Erreurs
    error: syncMutation.error?.message
        ?? configureMutation.error?.message
        ?? statusQuery.data?.last_error
        ?? resultsQuery.error?.message
        ?? null,

    // Actions
    sync:      () => syncMutation.mutate(),
    configure: (email: string, password: string) =>
      configureMutation.mutate({ email, password }),
  };
}
