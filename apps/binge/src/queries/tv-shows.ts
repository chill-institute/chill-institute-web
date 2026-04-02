import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";

export function useTVShowsQuery(enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["tv-shows"],
    queryFn: ({ signal }) => api.getTVShows(signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useTVShowDetailQuery(imdbId: string, enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["tv-show-detail", imdbId],
    queryFn: ({ signal }) => api.getTVShowDetail(imdbId, signal),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && imdbId.trim().length > 0,
  });
}

export function useTVShowSeasonQuery(imdbId: string, seasonNumber: number, enabled: boolean) {
  const api = useApi();
  return useQuery({
    queryKey: ["tv-show-season", imdbId, seasonNumber],
    queryFn: ({ signal }) => api.getTVShowSeason(imdbId, seasonNumber, signal),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && imdbId.trim().length > 0 && seasonNumber > 0,
  });
}

export function useTVShowSeasonDownloadsQuery(
  imdbId: string,
  seasonNumber: number,
  enabled: boolean,
) {
  const api = useApi();
  return useQuery({
    queryKey: ["tv-show-season-downloads", imdbId, seasonNumber],
    queryFn: ({ signal }) => api.getTVShowSeasonDownloads(imdbId, seasonNumber, signal),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && imdbId.trim().length > 0 && seasonNumber > 0,
  });
}
