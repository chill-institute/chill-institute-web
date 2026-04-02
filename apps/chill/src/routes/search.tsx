import { useMemo } from "react";
import { Navigate, Link, createFileRoute, useRouterState } from "@tanstack/react-router";
import { match } from "ts-pattern";

import { EmptyState } from "@/components/empty-state";
import { UserErrorAlert } from "@/components/user-error-alert";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { FilterBarLoading, SearchLoading } from "@/components/search-loading";
import { SearchResults } from "@/components/search-results";
import { useAuth, readStoredToken } from "@/lib/auth";
import { formatSearchResults, normalizeQuery } from "@/lib/search";
import { SearchResultDisplayBehavior, SortDirection, type UserSettings } from "@/lib/types";
import { combineQueries } from "@/queries/combine";
import { useSettingsQuery, useSaveSettings } from "@/queries/settings";
import { useIndexersQuery } from "@/queries/indexers";
import { useSearchQueries } from "@/queries/search";
import { settingsQueryOptions, indexersQueryOptions } from "@/queries/options";
import { useFastestMode } from "@/hooks/use-fastest-mode";
import { useSearchFilters } from "@/hooks/use-search-filters";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" ? { q: search.q } : {},
  loader: ({ context: { queryClient } }) => {
    const token = readStoredToken();
    if (!token) return;
    void queryClient.ensureQueryData(settingsQueryOptions(token));
    void queryClient.ensureQueryData(indexersQueryOptions(token));
  },
  component: SearchPage,
});

function SearchPage() {
  const searchParams = Route.useSearch();
  const auth = useAuth();
  const callbackURL = useRouterState({ select: (state) => state.location.href });
  const submittedQuery = normalizeQuery(searchParams.q ?? "");

  const configQuery = useSettingsQuery();
  const indexersQuery = useIndexersQuery();
  const { filters, dispatch } = useSearchFilters(configQuery.data);
  const saveConfigMutation = useSaveSettings();

  function patchConfig(patch: Partial<UserSettings>) {
    if (!configQuery.data) return;
    saveConfigMutation.mutate({ ...configQuery.data, ...patch });
  }

  const enabledIndexers = useMemo(() => {
    const disabled = new Set(configQuery.data?.disabledIndexerIds ?? []);
    return (indexersQuery.data ?? []).filter(
      (indexer) => indexer.enabled && !disabled.has(indexer.id),
    );
  }, [indexersQuery.data, configQuery.data?.disabledIndexerIds]);

  const searchState = useSearchQueries(submittedQuery, enabledIndexers);

  const formattedResults = useMemo(
    () =>
      formatSearchResults(
        searchState.results,
        filters.resolution,
        filters.codec,
        filters.other,
        filters.sortBy,
        filters.sortDirection,
      ),
    [
      searchState.results,
      filters.resolution,
      filters.codec,
      filters.other,
      filters.sortBy,
      filters.sortDirection,
    ],
  );

  const behavior = configQuery.data?.searchResultDisplayBehavior;
  const isFastestMode = behavior === SearchResultDisplayBehavior.FASTEST;
  const fastestPhase = useFastestMode(isFastestMode, submittedQuery, searchState);

  type RenderPhase = "idle" | "loading" | "results" | "empty" | "filter-empty";

  const renderPhase: RenderPhase = (() => {
    if (submittedQuery.length === 0) return "idle";

    if (isFastestMode) {
      if (fastestPhase === "idle" && searchState.hasPending) return "loading";
      if (fastestPhase === "fastest" || fastestPhase === "all") {
        if (formattedResults.length === 0 && searchState.results.length > 0) return "filter-empty";
        if (formattedResults.length > 0) return "results";
      }
      if (fastestPhase === "empty") return "empty";
      return "idle";
    }

    if (searchState.hasPending) return "loading";
    if (formattedResults.length > 0) return "results";
    return "empty";
  })();

  function setSort(nextSortBy: UserSettings["sortBy"]) {
    if (filters.sortBy === nextSortBy) {
      const nextDirection =
        filters.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;
      dispatch({ type: "TOGGLE_SORT_DIR" });
      patchConfig({ sortDirection: nextDirection });
      return;
    }
    dispatch({ type: "SET_SORT", value: nextSortBy });
    patchConfig({ sortBy: nextSortBy });
  }

  if (!auth.isAuthenticated) {
    return (
      <Navigate to="/sign-in" search={{ error: undefined, callbackUrl: callbackURL }} replace />
    );
  }

  const combined = combineQueries(configQuery, indexersQuery);

  return match(combined)
    .with({ status: "pending" }, () =>
      submittedQuery.length > 0 ? (
        <>
          <FilterBarLoading />
          <SearchLoading />
        </>
      ) : null,
    )
    .with({ status: "error" }, (q) => (
      <div className="w-full max-w-5xl mx-auto mt-6 px-4 xl:px-0">
        <UserErrorAlert error={q.error} />
      </div>
    ))
    .with({ status: "success" }, ({ data: [config] }) => {
      const renderContent = match(renderPhase)
        .with("idle", () => null)
        .with("loading", () => <SearchLoading />)
        .with("empty", () => (
          <EmptyState
            icon="🤠"
            title="Well, we found absolutely nothing."
            description={
              <div>
                Maybe try searching for something else?
                <br />
                Like...{" "}
                <Link
                  className="inline-block underline decoration-stone-400 decoration-1 underline-offset-3 transition-[color,transform,text-decoration-color] duration-150 hover:-translate-y-px hover:text-stone-950 hover:decoration-stone-950 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:decoration-stone-100"
                  to="/search"
                  search={{ q: "The Matrix" }}
                >
                  The Matrix?
                </Link>
              </div>
            }
          />
        ))
        .with("filter-empty", () => (
          <EmptyState
            icon="🤨"
            title="Those filters... they do nothing!"
            description="Try changing your filters."
          />
        ))
        .with("results", () => (
          <SearchResults
            results={formattedResults}
            sortBy={filters.sortBy}
            sortDirection={filters.sortDirection}
            titleBehavior={config.searchResultTitleBehavior}
            onSort={setSort}
          />
        ))
        .exhaustive();

      return (
        <section data-page="search">
          <SearchFilterBar
            filters={filters}
            onResolutionChange={(next) => {
              dispatch({ type: "SET_RESOLUTION", value: next });
              if (config.rememberQuickFilters) patchConfig({ resolutionFilters: next });
            }}
            onCodecChange={(next) => {
              dispatch({ type: "SET_CODEC", value: next });
              if (config.rememberQuickFilters) patchConfig({ codecFilters: next });
            }}
            onOtherChange={(next) => {
              dispatch({ type: "SET_OTHER", value: next });
              if (config.rememberQuickFilters) patchConfig({ otherFilters: next });
            }}
            onSort={setSort}
          />

          {renderContent}

          {searchState.firstError ? (
            <UserErrorAlert className="mt-4" error={searchState.firstError} />
          ) : null}
          {saveConfigMutation.error ? (
            <UserErrorAlert className="mt-4" error={saveConfigMutation.error} />
          ) : null}
        </section>
      );
    })
    .exhaustive();
}
