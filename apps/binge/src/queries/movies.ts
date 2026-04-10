import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import { type Movie } from "@/lib/types";

export function useMoviesQuery(enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["movies"],
    queryFn: ({ signal }) => api.getMovies(signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useMovieSearchQuery(movie: Movie, enabled: boolean) {
  const api = useApi();
  const query = [movie.title, movie.year].filter(Boolean).join(" ").trim();

  return useQuery({
    queryKey: ["movie-search", movie.id, query],
    queryFn: ({ signal }) => api.search(query, undefined, signal),
    staleTime: 60 * 1000,
    enabled: enabled && query.length > 0,
  });
}
