import { type SyntheticEvent, useCallback } from "react";
import { Navigate, createFileRoute, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Star } from "lucide-react";
import { match } from "ts-pattern";

import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTransferButton } from "@/components/add-transfer-button";
import { SearchInTheInstituteButton } from "@/components/search-in-the-institute-button";
import { TopMoviesDisplayTypeToggle } from "@/components/top-movies-display-type-toggle";
import { TopMoviesRSSPopover } from "@/components/top-movies-rss-popover";
import { TopMoviesSourceSelect } from "@/components/top-movies-source-select";
import { useAuth, readStoredToken } from "@/lib/auth";
import { toErrorMessage } from "@/lib/errors";
import { useSettingsQuery, useSaveSettings } from "@/queries/settings";
import { useTopMoviesQuery } from "@/queries/top-movies";
import { settingsQueryOptions, topMoviesQueryOptions } from "@/queries/options";
import { TopMoviesDisplayType, type TopMovie, type UserSettings } from "@/lib/types";

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

  const topMoviesQuery = useTopMoviesQuery(configQuery.data?.showTopMovies === true);

  function patchConfig(patch: Partial<UserSettings>) {
    if (!configQuery.data) {
      return;
    }
    saveConfigMutation.mutate({ ...configQuery.data, ...patch });
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

      const topMoviesContent = match(topMoviesQuery)
        .with({ status: "pending" }, () => (
          <TopMoviesSkeleton displayType={config.topMoviesDisplayType} />
        ))
        .with({ status: "error" }, (tq) => (
          <ErrorAlert className="mt-2">{toErrorMessage(tq.error)}</ErrorAlert>
        ))
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
              <div className="mt-2 gap-4 grid sm:grid-cols-2 md:grid-cols-3">
                {movies.map((movie) => (
                  <MovieCompactRow key={movie.id} movie={movie} />
                ))}
              </div>
            ))
            .with(TopMoviesDisplayType.EXPANDED, () => (
              <div className="mt-2 gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {movies.map((movie) => (
                  <MovieExpandedCard key={movie.id} movie={movie} />
                ))}
              </div>
            ))
            .otherwise(() => null);
        })
        .exhaustive();

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
                {currentTopMoviesResponse ? (
                  <TopMoviesRSSPopover
                    source={config.topMoviesSource}
                    feedUrl={currentTopMoviesResponse.rssFeedUrl}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {topMoviesContent}

          {saveConfigMutation.error ? (
            <ErrorAlert className="mt-4">{toErrorMessage(saveConfigMutation.error)}</ErrorAlert>
          ) : null}
        </div>
      );
    })
    .exhaustive();
}

function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const onLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.classList.remove("opacity-0");
  }, []);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className} opacity-0 transition-opacity duration-200 motion-reduce:opacity-100 motion-reduce:transition-none`}
      onLoad={onLoad}
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
