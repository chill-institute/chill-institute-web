import { useQueries } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type { SearchResult, UserIndexer } from "@/lib/types";

export function useSearchQueries(query: string, enabledIndexers: UserIndexer[]) {
  const api = useApi();
  return useQueries({
    queries: enabledIndexers.map((indexer) => ({
      queryKey: ["search", query, indexer.id],
      queryFn: ({ signal }: { signal: AbortSignal }) => api.search(query, indexer.id, signal),
      enabled: query.length > 0,
    })),
    combine: (queries) => {
      const pendingCount = queries.filter((q) => q.isLoading).length;
      const nonEmptyResolvedCount = queries.filter(
        (q) => !q.isLoading && (q.data?.results?.length ?? 0) > 0,
      ).length;
      const firstError = queries.find((q) => q.error)?.error ?? null;

      const seen = new Set<string>();
      const results: SearchResult[] = [];
      for (const q of queries) {
        for (const r of (q.data?.results ?? []) as SearchResult[]) {
          const key = `${r.id}:${r.link}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push(r);
          }
        }
      }

      return {
        results,
        pendingCount,
        nonEmptyResolvedCount,
        totalCount: queries.length,
        hasPending: pendingCount > 0,
        firstError,
      };
    },
  });
}
