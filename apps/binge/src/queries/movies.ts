import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";

export function useMoviesQuery(enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["movies"],
    queryFn: ({ signal }) => api.getMovies(signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
