import { type ReactNode, useEffect, useState } from "react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Film, Rss, Star, Tv } from "lucide-react";
import { match } from "ts-pattern";

import { TvShowDetailModal } from "@/components/tv-show-detail-modal";
import { AddTransferButton } from "@/components/add-transfer-button";
import { CardDisplayTypeToggle } from "@/components/card-display-type-toggle";
import { MoviesRSSPopover, rssTriggerClassName } from "@/components/movies-rss-popover";
import { MoviesSourceSelect } from "@/components/movies-source-select";
import { SearchInTheInstituteButton } from "@/components/search-in-the-institute-button";
import { TVShowStatusBadge } from "@/components/tv-show-status-badge";
import { TVShowsSourceSelect } from "@/components/tv-shows-source-select";
import { UserErrorAlert } from "@/components/user-error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { readCurrentCallbackPath, useAuth, readStoredToken } from "@/lib/auth";
import { CardDisplayType, type Movie, type TVShow, type UserSettings } from "@/lib/types";
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

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    const token = readStoredToken();
    if (!token) return;

    const settingsPromise = queryClient.ensureQueryData(settingsQueryOptions(token));
    void settingsPromise.then((settings) => {
      if (settings.showMovies) {
        void queryClient.ensureQueryData(moviesQueryOptions(token));
      }
      if (settings.showTvShows) {
        void queryClient.ensureQueryData(tvShowsQueryOptions(token));
      }
    });
  },
  component: HomePage,
});

function HomePage() {
  const auth = useAuth();
  const callbackURL = readCurrentCallbackPath();

  const configQuery = useSettingsQuery();
  const saveConfigMutation = useSaveSettings();
  const pendingMoviesRefresh = usePendingMoviesRefresh();
  const pendingTVShowsRefresh = usePendingTVShowsRefresh();

  const shouldFetchMovies =
    configQuery.status === "success" &&
    !configQuery.isFetching &&
    configQuery.data.showMovies === true;
  const shouldFetchTVShows =
    configQuery.status === "success" &&
    !configQuery.isFetching &&
    configQuery.data.showTvShows === true;

  const moviesQuery = useMoviesQuery(shouldFetchMovies);
  const tvShowsQuery = useTVShowsQuery(shouldFetchTVShows);

  const config = configQuery.status === "success" ? configQuery.data : undefined;
  const hasMovies = config?.showMovies === true;
  const hasTVShows = config?.showTvShows === true;
  const [activeTab, setActiveTab] = useState<HomeTab>("movies");
  const [selectedShowId, setSelectedShowId] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<number>();

  useEffect(() => {
    if (!config) {
      return;
    }

    if (activeTab === "movies" && !config.showMovies && config.showTvShows) {
      setActiveTab("tv");
      return;
    }

    if (activeTab === "tv" && !config.showTvShows && config.showMovies) {
      setActiveTab("movies");
      setSelectedShowId(undefined);
      setSelectedSeason(undefined);
      return;
    }

    if (!config.showTvShows) {
      setSelectedShowId(undefined);
      setSelectedSeason(undefined);
    }
  }, [activeTab, config]);

  function patchConfig(patch: Partial<UserSettings>) {
    if (!configQuery.data) {
      return;
    }

    saveConfigMutation.mutate({ ...configQuery.data, ...patch });
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
      <div className="mx-auto my-6 w-full max-w-5xl px-4 md:my-12 xl:px-0">
        <div className="flex flex-col gap-3 xs:flex-row xs:items-end xs:justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-10 w-56 rounded-md" />
        </div>
        <MediaCardsSkeleton displayType={CardDisplayType.COMPACT} />
      </div>
    ))
    .with({ status: "error" }, (query) => (
      <div className="mx-auto my-6 w-full max-w-5xl px-4 xl:px-0">
        <UserErrorAlert error={query.error} />
      </div>
    ))
    .with({ status: "success" }, (query) => {
      const config = query.data;

      if (!hasMovies && !hasTVShows) {
        return null;
      }

      const showTabs = hasMovies && hasTVShows;
      const currentTab: HomeTab =
        hasMovies && !hasTVShows ? "movies" : !hasMovies && hasTVShows ? "tv" : activeTab;

      const currentMoviesResponse =
        moviesQuery.status === "success" && moviesQuery.data.source === config.moviesSource
          ? moviesQuery.data
          : undefined;
      const currentTVShowsResponse =
        tvShowsQuery.status === "success" && tvShowsQuery.data.source === config.tvShowsSource
          ? tvShowsQuery.data
          : undefined;
      const selectedShow = currentTVShowsResponse?.shows.find(
        (show) => show.imdbId === selectedShowId,
      );
      const sourceSelector =
        currentTab === "movies" ? (
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
      const headerControls = (
        <div className="inline-flex items-center">
          <CardDisplayTypeToggle
            className="gap-0.5"
            value={config.cardDisplayType}
            onChange={(cardDisplayType) => patchConfig({ cardDisplayType })}
          />
          <div className="mx-1 h-6 w-px bg-stone-950/12 dark:bg-stone-100/10" />
          {currentTab === "movies" ? (
            <MoviesRSSPopover
              source={config.moviesSource}
              feedUrl={currentMoviesResponse?.rssFeedUrl}
            />
          ) : (
            <DisabledTVRssButton />
          )}
        </div>
      );

      const moviesContent = pendingMoviesRefresh ? (
        <MediaCardsSkeleton displayType={config.cardDisplayType} />
      ) : (
        match(moviesQuery)
          .with({ status: "pending" }, () => (
            <MediaCardsSkeleton displayType={config.cardDisplayType} />
          ))
          .with({ status: "error" }, (movies) =>
            movies.isFetching ? (
              <MediaCardsSkeleton displayType={config.cardDisplayType} />
            ) : (
              <UserErrorAlert className="mt-2" error={movies.error} />
            ),
          )
          .with({ status: "success" }, (movies) => {
            if (movies.data.source !== config.moviesSource) {
              return <MediaCardsSkeleton displayType={config.cardDisplayType} />;
            }

            if (movies.data.movies.length === 0) {
              if (movies.isFetching) {
                return <MediaCardsSkeleton displayType={config.cardDisplayType} />;
              }

              return (
                <div className="mt-2">
                  {`Couldn't fetch any movies from the selected source, please try another one.`}
                </div>
              );
            }

            return match(config.cardDisplayType)
              .with(CardDisplayType.COMPACT, () => (
                <div className="mt-2 grid gap-4 animate-reveal sm:grid-cols-2 md:grid-cols-3">
                  {movies.data.movies.map((movie) => (
                    <MovieCompactRow key={movie.id} movie={movie} />
                  ))}
                </div>
              ))
              .with(CardDisplayType.EXPANDED, () => (
                <div className="mt-2 grid grid-cols-2 gap-4 animate-reveal sm:grid-cols-3 md:grid-cols-4">
                  {movies.data.movies.map((movie) => (
                    <MovieExpandedCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ))
              .otherwise(() => null);
          })
          .exhaustive()
      );

      const tvShowsContent = pendingTVShowsRefresh ? (
        <MediaCardsSkeleton displayType={config.cardDisplayType} />
      ) : (
        match(tvShowsQuery)
          .with({ status: "pending" }, () => (
            <MediaCardsSkeleton displayType={config.cardDisplayType} />
          ))
          .with({ status: "error" }, (shows) =>
            shows.isFetching ? (
              <MediaCardsSkeleton displayType={config.cardDisplayType} />
            ) : (
              <UserErrorAlert className="mt-2" error={shows.error} />
            ),
          )
          .with({ status: "success" }, (shows) => {
            if (shows.data.source !== config.tvShowsSource) {
              return <MediaCardsSkeleton displayType={config.cardDisplayType} />;
            }

            if (shows.data.shows.length === 0) {
              if (shows.isFetching) {
                return <MediaCardsSkeleton displayType={config.cardDisplayType} />;
              }

              return (
                <div className="mt-2">
                  {`Couldn't fetch any TV shows from the selected source, please try another one.`}
                </div>
              );
            }

            return match(config.cardDisplayType)
              .with(CardDisplayType.COMPACT, () => (
                <div className="mt-2 grid gap-4 animate-reveal sm:grid-cols-2 md:grid-cols-3">
                  {shows.data.shows.map((show) => (
                    <TVShowCompactCard
                      key={show.imdbId}
                      show={show}
                      onOpen={(nextShow) => {
                        setSelectedShowId(nextShow.imdbId);
                        setSelectedSeason(1);
                      }}
                    />
                  ))}
                </div>
              ))
              .with(CardDisplayType.EXPANDED, () => (
                <div className="mt-2 grid grid-cols-2 gap-4 animate-reveal sm:grid-cols-3 md:grid-cols-4">
                  {shows.data.shows.map((show) => (
                    <TVShowExpandedCard
                      key={show.imdbId}
                      show={show}
                      onOpen={(nextShow) => {
                        setSelectedShowId(nextShow.imdbId);
                        setSelectedSeason(1);
                      }}
                    />
                  ))}
                </div>
              ))
              .otherwise(() => null);
          })
          .exhaustive()
      );

      return (
        <div data-page="home" className="mx-auto my-6 w-full max-w-5xl px-4 md:my-12 xl:px-0">
          <div className="flex flex-col gap-2.5">
            {showTabs ? (
              <>
                <div className="flex flex-col gap-2.5 xs:flex-row xs:items-center xs:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <HomeTabButton
                      active={currentTab === "movies"}
                      icon={<Film className="text-sm" />}
                      label="movies"
                      onClick={() => {
                        setActiveTab("movies");
                        setSelectedShowId(undefined);
                        setSelectedSeason(undefined);
                      }}
                    />
                    <HomeTabButton
                      active={currentTab === "tv"}
                      icon={<Tv className="text-sm" />}
                      label="tv shows"
                      onClick={() => {
                        setActiveTab("tv");
                      }}
                    />
                  </div>
                  {headerControls}
                </div>
                <div className="flex justify-start">{sourceSelector}</div>
              </>
            ) : (
              <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
                <div className="min-w-0 flex-1">{sourceSelector}</div>
                <div className="self-end xs:self-auto">{headerControls}</div>
              </div>
            )}
          </div>

          {currentTab === "movies" ? moviesContent : tvShowsContent}

          {saveConfigMutation.error ? (
            <UserErrorAlert className="mt-4" error={saveConfigMutation.error} />
          ) : null}

          {currentTab === "tv" && selectedShowId ? (
            <TvShowDetailModal
              imdbId={selectedShowId}
              fallbackShow={selectedShow}
              activeSeason={selectedSeason}
              onSeasonChange={(season) => {
                setSelectedSeason(season);
              }}
              onClose={() => {
                setSelectedShowId(undefined);
                setSelectedSeason(undefined);
              }}
            />
          ) : null}
        </div>
      );
    })
    .exhaustive();
}

function HomeTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm leading-none transition-colors ${
        active
          ? "border-stone-950 bg-stone-100 text-stone-950 shadow-[1px_1px_rgba(12,10,9,1)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:shadow-[1px_1px_rgba(68,64,60,1)]"
          : "border-transparent text-stone-600 hover:bg-stone-200 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DisabledTVRssButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className={rssTriggerClassName}
            disabled
            aria-label="TV RSS disabled"
          >
            <Rss className="text-sm" />
          </button>
        }
      />
      <TooltipContent>
        <p>{`TV show RSS feeds aren't available yet.`}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} transition-[opacity,transform,filter] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
        loaded
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "translate-y-1 scale-[0.985] opacity-0 blur-[6px] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-0"
      }`}
      onLoad={() => setLoaded(true)}
    />
  );
}

function MovieCompactRow({ movie }: { movie: Movie }) {
  return (
    <article className="relative overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex h-full flex-row items-center gap-3 p-3">
        {movie.posterUrl ? (
          <div className="overflow-hidden rounded">
            <LazyImage
              src={movie.posterUrl}
              alt={movie.title}
              className="h-[108px] w-[72px] object-cover"
            />
          </div>
        ) : null}
        <div className="flex h-full flex-1 flex-col justify-between">
          <div className="mt-0.5 flex flex-col space-y-1">
            <h5 className="font-serif leading-tight" style={{ wordBreak: "break-word" }}>
              {movie.title}
            </h5>
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-row items-center space-x-0.5">
                <Star className="fill-amber-400 text-sm" strokeWidth={0} />
                <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">
                <span className="text-sm">/</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">{movie.year}</div>
              <div className="text-stone-600 dark:text-stone-400">
                <span className="text-sm">/</span>
              </div>
              {movie.externalUrl ? (
                <a
                  href={movie.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  title="Open IMDb page"
                >
                  <div className="flex flex-row items-center space-x-0.5">
                    <span className="text-sm">IMDb</span>
                    <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                  </div>
                </a>
              ) : null}
            </div>
          </div>
          <div className="mb-0.5 flex flex-row gap-1">
            <AddTransferButton url={movie.link}>send to put.io</AddTransferButton>
            <SearchInTheInstituteButton
              title={movie.titlePretty || movie.title}
              year={movie.year}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function MovieExpandedCard({ movie }: { movie: Movie }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
      {movie.posterUrl ? (
        <LazyImage
          src={movie.posterUrl}
          alt={movie.title}
          className="aspect-2/3 w-full border-b border-stone-950 object-cover dark:border-stone-700"
        />
      ) : null}
      <div className="mx-4 my-3 flex h-full flex-col">
        <div className="flex flex-col space-y-1">
          <h5 className="font-serif leading-tight">{movie.title}</h5>
          <div className="flex flex-row items-center space-x-2">
            <div className="flex flex-row items-center space-x-0.5">
              <Star className="fill-amber-400 text-sm" strokeWidth={0} />
              <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <span className="text-sm">/</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">{movie.year}</div>
            <div className="text-stone-600 dark:text-stone-400">
              <span className="text-sm">/</span>
            </div>
            {movie.externalUrl ? (
              <a
                href={movie.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                title="Open IMDb page"
              >
                <div className="flex flex-row items-center space-x-0.5">
                  <span className="text-sm">IMDb</span>
                  <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                </div>
              </a>
            ) : null}
          </div>
        </div>
        <div className="mt-auto flex w-full flex-row gap-1 pt-3">
          <div className="flex flex-1 flex-col">
            <AddTransferButton className="w-full" url={movie.link}>
              send to put.io
            </AddTransferButton>
          </div>
          <SearchInTheInstituteButton title={movie.titlePretty || movie.title} year={movie.year} />
        </div>
      </div>
    </article>
  );
}

function TVShowCompactCard({ show, onOpen }: { show: TVShow; onOpen: (show: TVShow) => void }) {
  return (
    <article className="relative overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex h-full flex-row items-center gap-3 p-3">
        {show.posterUrl ? (
          <div className="overflow-hidden rounded">
            <LazyImage
              src={show.posterUrl}
              alt={show.title}
              className="h-[108px] w-[72px] object-cover"
            />
          </div>
        ) : null}
        <div className="flex h-full flex-1 flex-col">
          <div className="mt-0.5 flex flex-col space-y-1">
            <h5 className="font-serif leading-tight" style={{ wordBreak: "break-word" }}>
              {show.title}
            </h5>
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-row items-center space-x-0.5">
                <Star className="fill-amber-400 text-sm" strokeWidth={0} />
                <span>{show.rating ? show.rating.toFixed(1) : "N/A"}</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">
                <span className="text-sm">/</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">{show.year}</div>
              {show.externalUrl ? (
                <>
                  <div className="text-stone-600 dark:text-stone-400">
                    <span className="text-sm">/</span>
                  </div>
                  <a
                    href={show.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
                  >
                    <span className="text-sm">IMDb</span>
                    <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                  </a>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-1.5">
            <TVShowStatusBadge status={show.status} className="w-fit" />
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onOpen(show)}
              className="btn btn-secondary text-sm"
            >
              <span>details</span>
              <ArrowRight className="text-xs" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TVShowExpandedCard({ show, onOpen }: { show: TVShow; onOpen: (show: TVShow) => void }) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
      {show.posterUrl ? (
        <LazyImage
          src={show.posterUrl}
          alt={show.title}
          className="aspect-2/3 w-full border-b border-stone-950 object-cover dark:border-stone-700"
        />
      ) : null}
      <div className="mx-4 my-3 flex h-full flex-col">
        <div className="flex flex-col space-y-1">
          <h5 className="font-serif leading-tight">{show.title}</h5>
          <div className="flex flex-row items-center space-x-2">
            <div className="flex flex-row items-center space-x-0.5">
              <Star className="fill-amber-400 text-sm" strokeWidth={0} />
              <span>{show.rating ? show.rating.toFixed(1) : "N/A"}</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <span className="text-sm">/</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">{show.year}</div>
            {show.externalUrl ? (
              <>
                <div className="text-stone-600 dark:text-stone-400">
                  <span className="text-sm">/</span>
                </div>
                <a
                  href={show.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  <span className="text-sm">IMDb</span>
                  <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                </a>
              </>
            ) : null}
          </div>
          <TVShowStatusBadge status={show.status} className="w-fit" />
        </div>
        <div className="mt-auto pt-3">
          <button type="button" onClick={() => onOpen(show)} className="btn btn-secondary text-sm">
            <span>details</span>
            <ArrowRight className="text-xs" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </article>
  );
}

function MediaCardsSkeleton({ displayType }: { displayType: CardDisplayType }) {
  if (displayType === CardDisplayType.EXPANDED) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 24 }, (_, index) => (
          <div
            key={`expanded-${index}`}
            className="relative flex flex-col overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900"
          >
            <Skeleton className="aspect-2/3 w-full rounded-none" />
            <div className="mx-4 my-3 flex flex-col space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-2 h-7 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 24 }, (_, index) => (
        <div
          key={`compact-${index}`}
          className="relative overflow-hidden rounded border border-solid border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900"
        >
          <div className="flex flex-row items-center gap-3 p-3">
            <Skeleton className="h-27 w-18 shrink-0" />
            <div className="flex-1 flex-col space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
