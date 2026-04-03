import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import { normalizeBingeUserSettings, type UserSettings } from "@/lib/types";
import { readCachedSettings, writeCachedSettings } from "@/queries/options";

const SAVE_DEBOUNCE_MS = 500;
const MOVIES_REFRESH_PENDING_QUERY_KEY = ["movies-refresh-pending"] as const;
const TV_SHOWS_REFRESH_PENDING_QUERY_KEY = ["tv-shows-refresh-pending"] as const;

export function useSettingsQuery() {
  const api = useApi();

  return useQuery({
    queryKey: ["user-settings"],
    queryFn: async ({ signal }) => {
      const settings = await api.getUserSettings(signal);
      writeCachedSettings(settings);
      return settings;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: readCachedSettings(),
  });
}

export function usePendingMoviesRefresh() {
  const query = useQuery({
    queryKey: MOVIES_REFRESH_PENDING_QUERY_KEY,
    queryFn: async () => false,
    initialData: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return query.data === true;
}

export function usePendingTVShowsRefresh() {
  const query = useQuery({
    queryKey: TV_SHOWS_REFRESH_PENDING_QUERY_KEY,
    queryFn: async () => false,
    initialData: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return query.data === true;
}

export function useSaveSettings() {
  const api = useApi();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingRef = useRef<UserSettings | null>(null);
  const previousRef = useRef<UserSettings | null>(null);
  const mutateRef = useRef<((next: UserSettings) => void) | null>(null);

  const mutation = useMutation({
    mutationFn: (next: UserSettings) => api.saveUserSettings(next),
    onSuccess: (_data, variables) => {
      const prev = previousRef.current;
      if (prev && prev.moviesSource !== variables.moviesSource) {
        void queryClient.resetQueries({ queryKey: ["movies"] });
      }
      if (prev && prev.tvShowsSource !== variables.tvShowsSource) {
        void queryClient.resetQueries({ queryKey: ["tv-shows"] });
      }
      if (prev && prev.downloadFolderId !== variables.downloadFolderId) {
        void queryClient.invalidateQueries({ queryKey: ["download-folder"] });
      }
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
    onSettled: () => {
      pendingRef.current = null;
      queryClient.setQueryData(MOVIES_REFRESH_PENDING_QUERY_KEY, false);
      queryClient.setQueryData(TV_SHOWS_REFRESH_PENDING_QUERY_KEY, false);
    },
  });

  mutateRef.current = mutation.mutate;

  useEffect(
    () => () => {
      if (pendingRef.current) {
        mutateRef.current?.(pendingRef.current);
      }
      clearTimeout(debounceRef.current);
    },
    [],
  );

  return {
    ...mutation,
    mutate: (next: UserSettings) => {
      const normalizedNext = normalizeBingeUserSettings(next);
      const current = queryClient.getQueryData<UserSettings>(["user-settings"]);
      if (current) {
        previousRef.current = current;
        if (current.moviesSource !== normalizedNext.moviesSource) {
          queryClient.setQueryData(MOVIES_REFRESH_PENDING_QUERY_KEY, true);
        }
        if (current.tvShowsSource !== normalizedNext.tvShowsSource) {
          queryClient.setQueryData(TV_SHOWS_REFRESH_PENDING_QUERY_KEY, true);
        }
      }
      queryClient.setQueryData(["user-settings"], normalizedNext);
      writeCachedSettings(normalizedNext);
      pendingRef.current = normalizedNext;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => mutation.mutate(normalizedNext), SAVE_DEBOUNCE_MS);
    },
  };
}
