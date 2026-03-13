import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import type { TopMoviesSource } from "@/lib/types";

export function useTopMoviesQuery(source: TopMoviesSource | undefined, enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["top-movies", source],
    queryFn: ({ signal }) => api.getTopMovies(signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
