import { useState } from "react";
import { Navigate, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Film, Star, Tv } from "lucide-react";
import { match } from "ts-pattern";

import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTransferButton } from "@/components/add-transfer-button";
import { SearchInTheInstituteButton } from "@/components/search-in-the-institute-button";
import { TopMoviesDisplayTypeToggle } from "@/components/top-movies-display-type-toggle";
import { TopMoviesRSSPopover } from "@/components/top-movies-rss-popover";
import { TopMoviesSourceSelect } from "@/components/top-movies-source-select";
import { TvShowDetailModal } from "@/components/tv-show-detail-modal";
import { useAuth, readStoredToken } from "@/lib/auth";
import { toErrorMessage } from "@/lib/errors";
import { usePendingTopMoviesRefresh, useSettingsQuery, useSaveSettings } from "@/queries/settings";
import { useTopMoviesQuery } from "@/queries/top-movies";
import { settingsQueryOptions, topMoviesQueryOptions } from "@/queries/options";
import { TopMoviesDisplayType, type TopMovie, type UserSettings } from "@/lib/types";
import { mockTvShows, networkFilters, type MockTvShow } from "@/data/mock-tv-shows";

type HomeTab = "movies" | "tv";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) => {
    const token = readStoredToken();
    if (!token) return;
    const settingsPromise = queryClient.ensureQueryData(settingsQueryOptions(token));
    void settingsPromise.then((settings) => {
      if (settings.showTopMovies) {
        void queryClient.ensureQueryData(topMoviesQueryOptions(token));
      }
    });
  },
  component: HomePage,
});

function HomePage() {
  const auth = useAuth();
  const callbackURL = useRouterState({ select: (state) => state.location.href });

  const configQuery = useSettingsQuery();

  const saveConfigMutation = useSaveSettings();
  const pendingTopMoviesRefresh = usePendingTopMoviesRefresh();

  const topMoviesQuery = useTopMoviesQuery(configQuery.data?.showTopMovies === true);

  const [activeTab, setActiveTab] = useState<HomeTab>("movies");
  const [tvNetworkFilter, setTvNetworkFilter] = useState<string>("All");
  const [tvDisplayType, setTvDisplayType] = useState<"compact" | "expanded">("compact");
  const [selectedShow, setSelectedShow] = useState<MockTvShow | null>(null);
  const [modalSeason, setModalSeason] = useState(1);

  function patchConfig(patch: Partial<UserSettings>) {
    if (!configQuery.data) {
      return;
    }
    saveConfigMutation.mutate({ ...configQuery.data, ...patch });
  }

  function openShowModal(show: MockTvShow) {
    setSelectedShow(show);
    setModalSeason(show.seasons[0].number);
  }

  if (!auth.isAuthenticated) {
    return (
      <Navigate to="/sign-in" search={{ error: undefined, callbackUrl: callbackURL }} replace />
    );
  }

  return match(configQuery)
    .with({ status: "pending" }, () => (
      <div className="w-full max-w-5xl mx-auto my-6 md:my-12 px-4 xl:px-0">
        <div className="flex flex-col space-y-2 xs:space-y-0 xs:flex-row xs:justify-between xs:items-end">
          <Skeleton className="h-8 w-48 bg-stone-100 dark:bg-stone-900" />
          <div className="flex flex-row items-center space-x-3">
            <Skeleton className="h-5 w-16 bg-stone-100 dark:bg-stone-900" />
            <div className="w-px h-5 bg-stone-400 dark:bg-stone-700" />
            <Skeleton className="h-5 w-5 bg-stone-100 dark:bg-stone-900" />
          </div>
        </div>
        <TopMoviesSkeleton displayType={TopMoviesDisplayType.COMPACT} />
      </div>
    ))
    .with({ status: "error" }, (q) => (
      <div className="w-full max-w-5xl mx-auto my-6 px-4 xl:px-0">
        <ErrorAlert>{toErrorMessage(q.error)}</ErrorAlert>
      </div>
    ))
    .with({ status: "success" }, (q) => {
      const config = q.data;
      if (!config.showTopMovies) return null;
      const currentTopMoviesResponse =
        topMoviesQuery.status === "success" && topMoviesQuery.data.source === config.topMoviesSource
          ? topMoviesQuery.data
          : undefined;

      const topMoviesContent = pendingTopMoviesRefresh ? (
        <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />
      ) : (
        match(topMoviesQuery)
          .with({ status: "pending" }, () => (
            <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />
          ))
          .with({ status: "error" }, (tq) =>
            tq.isFetching ? (
              <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />
            ) : (
              <ErrorAlert className="mt-2">{toErrorMessage(tq.error)}</ErrorAlert>
            ),
          )
          .with({ status: "success" }, (tq) => {
            const movies = tq.data.movies;
            const hasMatchingSource = tq.data.source === config.topMoviesSource;
            if (!hasMatchingSource) {
              return <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />;
            }

            if (movies.length === 0) {
              if (tq.isFetching) {
                return <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />;
              }
              return (
                <div className="mt-2">{`Couldn't fetch any movies from the selected source, please try another one.`}</div>
              );
            }

            return match(config.topMoviesDisplayType)
              .with(TopMoviesDisplayType.COMPACT, () => (
                <div className="mt-2 grid gap-4 animate-reveal sm:grid-cols-2 md:grid-cols-3">
                  {movies.map((movie) => (
                    <MovieCompactRow key={movie.id} movie={movie} />
                  ))}
                </div>
              ))
              .with(TopMoviesDisplayType.EXPANDED, () => (
                <div className="mt-2 grid grid-cols-2 gap-4 animate-reveal sm:grid-cols-3 md:grid-cols-4">
                  {movies.map((movie) => (
                    <MovieExpandedCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ))
              .otherwise(() => null);
          })
          .exhaustive()
      );

      const filteredShows =
        tvNetworkFilter === "All"
          ? mockTvShows
          : mockTvShows.filter((s) => s.networks.includes(tvNetworkFilter));

      return (
        <div data-page="home" className="w-full max-w-5xl mx-auto my-6 md:my-12 px-4 xl:px-0">
          <div className="flex flex-col space-y-2 xs:space-y-0 xs:flex-row xs:justify-between xs:items-end">
            <div>
              <TopMoviesSourceSelect
                value={config.topMoviesSource}
                onChange={(topMoviesSource) => patchConfig({ topMoviesSource })}
              />
            </div>

            <div className="flex flex-row items-center space-x-3">
              <TopMoviesDisplayTypeToggle
                value={config.topMoviesDisplayType}
                onChange={(topMoviesDisplayType) => patchConfig({ topMoviesDisplayType })}
              />
              <div className="w-px h-5 bg-stone-400 dark:bg-stone-700" />
              <div className="flex items-center">
                <TopMoviesRSSPopover
                  source={config.topMoviesSource}
                  feedUrl={currentTopMoviesResponse?.rssFeedUrl}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex flex-row gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("movies")}
              className={`btn text-sm ${activeTab === "movies" ? "" : "btn-secondary"}`}
            >
              <Film className="text-sm" />
              <span>Movies</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tv")}
              className={`btn text-sm ${activeTab === "tv" ? "" : "btn-secondary"}`}
            >
              <Tv className="text-sm" />
              <span>TV Shows</span>
            </button>
          </div>

          {activeTab === "movies" ? (
            topMoviesContent
          ) : (
            <div className="mt-2 animate-reveal">
              {/* Network filter chips */}
              <div className="flex flex-row flex-wrap gap-1 mb-3">
                {networkFilters.map((nf) => (
                  <button
                    key={nf}
                    type="button"
                    onClick={() => setTvNetworkFilter(nf)}
                    className={`btn text-xs ${tvNetworkFilter === nf ? "" : "btn-secondary"}`}
                  >
                    {nf}
                  </button>
                ))}
                <div className="w-px h-[30px] bg-stone-400 dark:bg-stone-700" />
                <button
                  type="button"
                  onClick={() =>
                    setTvDisplayType(tvDisplayType === "compact" ? "expanded" : "compact")
                  }
                  className="btn btn-secondary text-xs"
                >
                  {tvDisplayType === "compact" ? "Expanded" : "Compact"}
                </button>
              </div>

              {/* TV shows grid */}
              {tvDisplayType === "compact" ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {filteredShows.map((show) => (
                    <TvShowCompactRow key={show.id} show={show} onSelect={openShowModal} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {filteredShows.map((show) => (
                    <TvShowExpandedCard key={show.id} show={show} onSelect={openShowModal} />
                  ))}
                </div>
              )}
            </div>
          )}

          {saveConfigMutation.error ? (
            <ErrorAlert className="mt-4">{toErrorMessage(saveConfigMutation.error)}</ErrorAlert>
          ) : null}

          {selectedShow ? (
            <TvShowDetailModal
              show={selectedShow}
              activeSeason={modalSeason}
              onSeasonChange={setModalSeason}
              onClose={() => setSelectedShow(null)}
            />
          ) : null}
        </div>
      );
    })
    .exhaustive();
}

function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} transition-[opacity,transform,filter] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${loaded ? "opacity-100 translate-y-0 scale-100 blur-0" : "opacity-0 translate-y-1 scale-[0.985] blur-[6px] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-0"}`}
      onLoad={() => setLoaded(true)}
    />
  );
}

function MovieCompactRow({ movie }: { movie: TopMovie }) {
  return (
    <article className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
      <div className="flex flex-row items-center p-3 gap-3 h-full">
        {movie.posterUrl ? (
          <div className="rounded overflow-hidden">
            <LazyImage
              src={movie.posterUrl}
              alt={movie.title}
              className="w-[72px] h-[108px] object-cover"
            />
          </div>
        ) : null}
        <div className="flex-1 flex flex-col justify-between h-full">
          <div className="flex flex-col space-y-1 mt-0.5">
            <h5 className="font-serif leading-tight" style={{ wordBreak: "break-word" }}>
              {movie.title}
            </h5>
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-row items-center space-x-0.5">
                <Star className="text-sm fill-amber-400" strokeWidth={0} />
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
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 inline-block"
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

function TopMoviesSkeleton({ displayType }: { displayType: TopMoviesDisplayType }) {
  if (displayType === TopMoviesDisplayType.EXPANDED) {
    return (
      <div className="mt-2 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={`expanded-${String(i)}`}
            className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex flex-col"
          >
            <Skeleton className="w-full aspect-2/3 rounded-none" />
            <div className="mx-4 my-3 flex flex-col space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 gap-4 grid sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={`compact-${String(i)}`}
          className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900"
        >
          <div className="flex flex-row items-center p-3 gap-3">
            <Skeleton className="w-18 h-27 shrink-0" />
            <div className="flex-1 flex flex-col space-y-2">
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

function MovieExpandedCard({ movie }: { movie: TopMovie }) {
  return (
    <article className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex flex-col">
      {movie.posterUrl ? (
        <LazyImage
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full aspect-2/3 object-cover border-b border-stone-950 dark:border-stone-700"
        />
      ) : null}
      <div className="mx-4 my-3 flex flex-col h-full">
        <div className="flex flex-col space-y-1">
          <h5 className="font-serif leading-tight">{movie.title}</h5>
          <div className="flex flex-row items-center space-x-2">
            <div className="flex flex-row items-center space-x-0.5">
              <Star className="text-sm fill-amber-400" strokeWidth={0} />
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
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 inline-block"
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
        <div className="flex flex-row gap-1 w-full pt-3 mt-auto">
          <div className="flex flex-col flex-1">
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

function TvShowCompactRow({
  show,
  onSelect,
}: {
  show: MockTvShow;
  onSelect: (s: MockTvShow) => void;
}) {
  return (
    <article className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
      <div className="flex flex-row items-center p-3 gap-3 h-full">
        <div className="rounded overflow-hidden">
          <LazyImage
            src={show.posterUrl}
            alt={show.title}
            className="w-[72px] h-[108px] object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between h-full">
          <div className="flex flex-col space-y-1 mt-0.5">
            <h5 className="font-serif leading-tight" style={{ wordBreak: "break-word" }}>
              {show.title}
            </h5>
            <div className="flex flex-row items-center space-x-2">
              <div className="flex flex-row items-center space-x-0.5">
                <Star className="text-sm fill-amber-400" strokeWidth={0} />
                <span>{show.rating.toFixed(1)}</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">
                <span className="text-sm">/</span>
              </div>
              <div className="text-stone-600 dark:text-stone-400">{show.year}</div>
            </div>
            <div className="flex flex-row flex-wrap items-center gap-1">
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  show.status === "Returning"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                }`}
              >
                {show.status}
              </span>
              {show.networks.map((n) => (
                <span
                  key={n}
                  className="px-1.5 py-0.5 rounded text-xs bg-stone-300 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-0.5 flex flex-row gap-1">
            <button type="button" className="btn text-sm" onClick={() => onSelect(show)}>
              <span>details</span>
              <ArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TvShowExpandedCard({
  show,
  onSelect,
}: {
  show: MockTvShow;
  onSelect: (s: MockTvShow) => void;
}) {
  return (
    <article className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 flex flex-col">
      <LazyImage
        src={show.posterUrl}
        alt={show.title}
        className="w-full aspect-2/3 object-cover border-b border-stone-950 dark:border-stone-700"
      />
      <div className="mx-4 my-3 flex flex-col h-full">
        <div className="flex flex-col space-y-1">
          <h5 className="font-serif leading-tight">{show.title}</h5>
          <div className="flex flex-row items-center space-x-2">
            <div className="flex flex-row items-center space-x-0.5">
              <Star className="text-sm fill-amber-400" strokeWidth={0} />
              <span>{show.rating.toFixed(1)}</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <span className="text-sm">/</span>
            </div>
            <div className="text-stone-600 dark:text-stone-400">{show.year}</div>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-1">
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                show.status === "Returning"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {show.status}
            </span>
            {show.networks.map((n) => (
              <span
                key={n}
                className="px-1.5 py-0.5 rounded text-xs bg-stone-300 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-row gap-1 w-full pt-3 mt-auto">
          <button type="button" className="btn text-sm w-full" onClick={() => onSelect(show)}>
            <span>details</span>
            <ArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    </article>
  );
}
