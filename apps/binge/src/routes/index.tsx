import { useState } from "react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { Calendar, Film, Flame, Star, Tv } from "lucide-react";
import { match } from "ts-pattern";

import { MovieDetailModal } from "@/components/movie-detail-modal";
import { TvShowDetailModal } from "@/components/tv-show-detail-modal";
import { MoviesSourceSelect } from "@/components/movies-source-select";
import { TVShowsSourceSelect } from "@/components/tv-shows-source-select";
import { ShellSettingsMenu } from "@/components/shell-settings-menu";
import { UserErrorAlert } from "@/components/user-error-alert";
import { Skeleton } from "@chill-institute/ui/components/ui/skeleton";
import { StickyHeader } from "@chill-institute/ui/components/sticky-header";
import { Tab, Tabs } from "@chill-institute/ui/components/tabs";
import { PosterCard } from "@chill-institute/ui/components/poster-card";
import { InstituteFooter } from "@chill-institute/ui/components/institute-footer";
import {
  SortPill,
  SortRow,
  SortRowDivider,
  SortRowLabel,
} from "@chill-institute/ui/components/sort-row";
import { readCurrentCallbackPath, useAuth, readStoredToken } from "@/lib/auth";
import { type Movie, type TVShow, type UserSettings } from "@/lib/types";
import { moviesQueryOptions, settingsQueryOptions, tvShowsQueryOptions } from "@/queries/options";
import { useMoviesQuery } from "@/queries/movies";
import {
  usePendingMoviesRefresh,
  usePendingTVShowsRefresh,
  useSaveSettings,
  useSettingsQuery,
} from "@/queries/settings";
import { useTVShowsQuery } from "@/queries/tv-shows";

type HomeTab = "movies" | "tv";
type SortKey = "popular" | "rating" | "recent";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    const token = readStoredToken();
    if (!token) return;

    const settingsPromise = queryClient.ensureQueryData(settingsQueryOptions(token));
    void settingsPromise.then(() => {
      void queryClient.ensureQueryData(moviesQueryOptions(token));
      void queryClient.ensureQueryData(tvShowsQueryOptions(token));
    });
  },
  component: HomePage,
});

function BingeBrand() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2">
      <img
        src="/logo.png"
        width={22}
        height={22}
        alt=""
        className="rounded-sm border border-stone-950 dark:border-stone-700"
      />
      <h3 className="truncate font-serif text-lg leading-none font-normal tracking-tight text-stone-950 dark:text-stone-100">
        binge.institute
      </h3>
      <span className="rounded-full border border-stone-950/10 bg-stone-950/[0.05] px-2 py-0.5 text-[0.625rem] font-medium tracking-[0.18em] text-stone-600 uppercase dark:border-stone-100/10 dark:bg-stone-100/[0.06] dark:text-stone-400">
        alpha
      </span>
    </Link>
  );
}

function HomeShell({
  tab,
  onTabChange,
  children,
}: {
  tab: HomeTab;
  onTabChange: (next: HomeTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StickyHeader
        brand={<BingeBrand />}
        tabs={
          <Tabs>
            <Tab active={tab === "movies"} onClick={() => onTabChange("movies")}>
              <Film aria-hidden="true" />
              movies
            </Tab>
            <Tab active={tab === "tv"} onClick={() => onTabChange("tv")}>
              <Tv aria-hidden="true" />
              tv shows
            </Tab>
          </Tabs>
        }
        right={<ShellSettingsMenu />}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-[18px]">
        {children}
        <InstituteFooter
          left={
            <span>
              <span>binge.institute</span>
              <span className="ml-1 font-mono text-[0.6875rem] text-stone-600 dark:text-stone-300">
                · alpha · made with espresso in milan
              </span>
            </span>
          }
          right={
            <span className="font-mono text-[0.6875rem] text-stone-600 dark:text-stone-300">
              not affiliated with put.io
            </span>
          }
        />
      </main>
    </div>
  );
}

function HomePage() {
  const auth = useAuth();
  const callbackURL = readCurrentCallbackPath();

  const configQuery = useSettingsQuery();
  const saveConfigMutation = useSaveSettings();
  const pendingMoviesRefresh = usePendingMoviesRefresh();
  const pendingTVShowsRefresh = usePendingTVShowsRefresh();

  const shouldFetchMovies = configQuery.status === "success" && !configQuery.isFetching;
  const shouldFetchTVShows = configQuery.status === "success" && !configQuery.isFetching;

  const moviesQuery = useMoviesQuery(shouldFetchMovies);
  const tvShowsQuery = useTVShowsQuery(shouldFetchTVShows);

  const [activeTab, setActiveTab] = useState<HomeTab>("movies");
  const [sort, setSort] = useState<SortKey>("popular");
  const [selectedMovie, setSelectedMovie] = useState<Movie>();
  const [selectedShowId, setSelectedShowId] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<number>();

  function patchConfig(patch: Partial<UserSettings>) {
    if (!configQuery.data) return;
    saveConfigMutation.mutate({ ...configQuery.data, ...patch });
  }

  function handleTabChange(next: HomeTab) {
    setActiveTab(next);
    setSelectedMovie(undefined);
    setSelectedShowId(undefined);
    setSelectedSeason(undefined);
  }

  if (!auth.isAuthenticated) {
    return (
      <Navigate
        to="/sign-in"
        search={{ error: undefined, callbackUrl: callbackURL ?? undefined }}
        replace
      />
    );
  }

  return match(configQuery)
    .with({ status: "pending" }, () => (
      <HomeShell tab={activeTab} onTabChange={handleTabChange}>
        <PageHeading tab={activeTab} />
        <SortRowSkeleton />
        <PosterGridSkeleton />
      </HomeShell>
    ))
    .with({ status: "error" }, (query) => (
      <HomeShell tab={activeTab} onTabChange={handleTabChange}>
        <div className="my-6">
          <UserErrorAlert error={query.error} />
        </div>
      </HomeShell>
    ))
    .with({ status: "success" }, (query) => {
      const config = query.data;
      const currentTVShowsResponse =
        tvShowsQuery.status === "success" && tvShowsQuery.data.source === config.tvShowsSource
          ? tvShowsQuery.data
          : undefined;
      const selectedShow = currentTVShowsResponse?.shows.find(
        (show) => show.imdbId === selectedShowId,
      );

      const sourceSelector =
        activeTab === "movies" ? (
          <MoviesSourceSelect
            value={config.moviesSource}
            onChange={(moviesSource) => patchConfig({ moviesSource })}
          />
        ) : (
          <TVShowsSourceSelect
            value={config.tvShowsSource}
            onChange={(tvShowsSource) => patchConfig({ tvShowsSource })}
          />
        );

      const visibleCount =
        activeTab === "movies"
          ? moviesQuery.status === "success" && moviesQuery.data.source === config.moviesSource
            ? moviesQuery.data.movies.length
            : null
          : tvShowsQuery.status === "success" && tvShowsQuery.data.source === config.tvShowsSource
            ? tvShowsQuery.data.shows.length
            : null;
      const sortLabel = sort === "popular" ? "popular" : sort === "rating" ? "rating" : "recent";
      const countLabel =
        visibleCount != null
          ? `${visibleCount} ${activeTab === "movies" ? "titles" : "shows"} · sorted by ${sortLabel}`
          : null;

      const moviesContent = pendingMoviesRefresh ? (
        <PosterGridSkeleton />
      ) : (
        match(moviesQuery)
          .with({ status: "pending" }, () => <PosterGridSkeleton />)
          .with({ status: "error" }, (movies) =>
            movies.isFetching ? (
              <PosterGridSkeleton />
            ) : (
              <UserErrorAlert className="mt-2" error={movies.error} />
            ),
          )
          .with({ status: "success" }, (movies) => {
            if (movies.data.source !== config.moviesSource) {
              return <PosterGridSkeleton />;
            }

            if (movies.data.movies.length === 0) {
              if (movies.isFetching) {
                return <PosterGridSkeleton />;
              }
              return (
                <EmptyState message="couldn't fetch any movies from the selected source, please try another one." />
              );
            }

            return (
              <PosterGrid>
                {sortMovies(movies.data.movies, sort).map((movie, index) => (
                  <PosterCard
                    key={movie.id}
                    className="animate-reveal"
                    style={staggerDelay(index)}
                    title={movie.title}
                    image={movie.posterUrl ?? null}
                    rating={movie.rating != null ? movie.rating.toFixed(1) : null}
                    year={movie.year != null ? String(movie.year) : null}
                    onClick={() => setSelectedMovie(movie)}
                  />
                ))}
              </PosterGrid>
            );
          })
          .exhaustive()
      );

      const tvShowsContent = pendingTVShowsRefresh ? (
        <PosterGridSkeleton />
      ) : (
        match(tvShowsQuery)
          .with({ status: "pending" }, () => <PosterGridSkeleton />)
          .with({ status: "error" }, (shows) =>
            shows.isFetching ? (
              <PosterGridSkeleton />
            ) : (
              <UserErrorAlert className="mt-2" error={shows.error} />
            ),
          )
          .with({ status: "success" }, (shows) => {
            if (shows.data.source !== config.tvShowsSource) {
              return <PosterGridSkeleton />;
            }

            if (shows.data.shows.length === 0) {
              if (shows.isFetching) {
                return <PosterGridSkeleton />;
              }
              return (
                <EmptyState message="couldn't fetch any tv shows from the selected source, please try another one." />
              );
            }

            return (
              <PosterGrid>
                {sortShows(shows.data.shows, sort).map((show, index) => (
                  <PosterCard
                    key={show.imdbId}
                    className="animate-reveal"
                    style={staggerDelay(index)}
                    title={show.title}
                    image={show.posterUrl ?? null}
                    rating={show.rating != null ? show.rating.toFixed(1) : null}
                    year={show.year != null ? String(show.year) : null}
                    onClick={() => {
                      setSelectedShowId(show.imdbId);
                      setSelectedSeason(1);
                    }}
                  />
                ))}
              </PosterGrid>
            );
          })
          .exhaustive()
      );

      return (
        <HomeShell tab={activeTab} onTabChange={handleTabChange}>
          <PageHeading tab={activeTab} />
          <SortRow count={countLabel}>
            <SortRowLabel>sort</SortRowLabel>
            <SortPill active={sort === "popular"} onClick={() => setSort("popular")}>
              <Flame aria-hidden="true" />
              popular
            </SortPill>
            <SortPill active={sort === "rating"} onClick={() => setSort("rating")}>
              <Star aria-hidden="true" />
              rating
            </SortPill>
            <SortPill active={sort === "recent"} onClick={() => setSort("recent")}>
              <Calendar aria-hidden="true" />
              recent
            </SortPill>
            <SortRowDivider />
            <SortRowLabel>source</SortRowLabel>
            <div className="contents">{sourceSelector}</div>
          </SortRow>

          {activeTab === "movies" ? moviesContent : tvShowsContent}

          {saveConfigMutation.error ? (
            <UserErrorAlert className="mt-4" error={saveConfigMutation.error} />
          ) : null}

          {activeTab === "movies" && selectedMovie ? (
            <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(undefined)} />
          ) : null}

          {activeTab === "tv" && selectedShowId ? (
            <TvShowDetailModal
              imdbId={selectedShowId}
              fallbackShow={selectedShow}
              activeSeason={selectedSeason}
              onSeasonChange={(season) => setSelectedSeason(season)}
              onClose={() => {
                setSelectedShowId(undefined);
                setSelectedSeason(undefined);
              }}
            />
          ) : null}
        </HomeShell>
      );
    })
    .exhaustive();
}

function PageHeading({ tab }: { tab: HomeTab }) {
  return (
    <div className="flex items-end justify-between gap-4 pt-7 pb-3.5">
      <h2 className="m-0 font-serif text-3xl leading-none font-normal tracking-tight">
        {tab === "movies" ? "movies" : "tv shows"}
      </h2>
    </div>
  );
}

function PosterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {children}
    </div>
  );
}

// Cap stagger so a 200-item grid doesn't feel like loading a movie reel.
function staggerDelay(index: number): React.CSSProperties {
  const ms = Math.min(index * 25, 350);
  return { animationDelay: `${ms}ms` };
}

function PosterGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 18 }, (_, index) => (
        <article
          key={`poster-skel-${index}`}
          className="flex flex-col overflow-hidden rounded border border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900"
        >
          <Skeleton className="aspect-[2/3] w-full rounded-none border-b border-stone-950 dark:border-stone-700" />
          <div className="flex flex-col gap-2 px-3 py-2.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </article>
      ))}
    </div>
  );
}

function SortRowSkeleton() {
  return (
    <div className="mb-4.5 flex items-center gap-2 border-y border-stone-950 py-2 dark:border-stone-700">
      <Skeleton className="h-5 w-12" />
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="animate-reveal flex flex-col items-center gap-2 py-16 text-center">
      <img
        src="/logo.png"
        width={48}
        height={48}
        alt=""
        className="mb-1 rounded-md border border-stone-950 dark:border-stone-700"
      />
      <p className="m-0 font-serif text-xl text-stone-700 italic dark:text-stone-300">{message}</p>
      <p className="m-0 text-[0.8125rem] text-stone-600 dark:text-stone-300">
        i probably broke something — try a different source?
      </p>
    </div>
  );
}

function sortMovies(movies: ReadonlyArray<Movie>, sort: SortKey): Movie[] {
  const next = [...movies];
  if (sort === "rating") {
    next.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (sort === "recent") {
    next.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }
  return next;
}

function sortShows(shows: ReadonlyArray<TVShow>, sort: SortKey): TVShow[] {
  const next = [...shows];
  if (sort === "rating") {
    next.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (sort === "recent") {
    next.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }
  return next;
}
