import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, Users, X } from "lucide-react";

import { AddTransferButton } from "@/components/add-transfer-button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { UserErrorAlert } from "@/components/user-error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatAge, formatBytes } from "@/lib/format";
import { type Movie, type SearchResult } from "@/lib/types";
import { useMovieSearchQuery } from "@/queries/movies";

type Props = {
  movie: Movie;
  onClose: () => void;
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 640px)").matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

function formatUploadedAt(value: string) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatResultAge(value: string) {
  if (!value) {
    return undefined;
  }

  const age = formatAge(value);
  if (age === "unknown") {
    return undefined;
  }

  return age === "Today" ? age : `${age} ago`;
}

function formatSeederCount(seeders: bigint) {
  if (seeders <= 0n) {
    return undefined;
  }

  const count = Number(seeders);
  const formattedCount = new Intl.NumberFormat().format(count);
  return `${formattedCount} seeder${count === 1 ? "" : "s"}`;
}

function canSendResult(result: SearchResult) {
  return result.link.trim().length > 0;
}

function MovieDetailContent({ movie, onClose }: Props & { isDesktop: boolean }) {
  const [posterLoaded, setPosterLoaded] = useState(!movie.posterUrl);
  const searchQuery = useMovieSearchQuery(movie, true);

  useEffect(() => {
    setPosterLoaded(!movie.posterUrl);
  }, [movie.posterUrl]);

  const results = useMemo(() => searchQuery.data?.results ?? [], [searchQuery.data]);
  const synopsis = useMemo(() => {
    const movieWithOptionalSynopsis = movie as Movie & { overview?: string; synopsis?: string };
    return movieWithOptionalSynopsis.overview?.trim() || movieWithOptionalSynopsis.synopsis?.trim();
  }, [movie]);
  const sendableResultsCount = useMemo(
    () => results.filter((result) => canSendResult(result)).length,
    [results],
  );
  const hasOnlyUnavailableResults = results.length > 0 && sendableResultsCount === 0;

  const shellClassName =
    "max-h-[92vh] w-full overflow-y-auto bg-stone-100 p-0 text-stone-950 dark:bg-stone-900 dark:text-stone-100 sm:max-h-[90vh] sm:max-w-[940px] sm:rounded-xl sm:border sm:border-stone-950 sm:shadow-[0_24px_48px_rgba(0,0,0,0.3)] dark:sm:border-stone-700";

  return (
    <div className={shellClassName}>
      <div className="relative flex min-h-60 items-end overflow-hidden sm:min-h-90">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-300 via-stone-200 to-stone-100 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-stone-100/10 via-35% to-black/35 dark:from-stone-900 dark:via-stone-900/15 dark:to-black/45" />

        <div className="relative z-10 flex w-full items-end gap-5 px-6 pb-6 sm:px-7">
          {movie.posterUrl ? (
            <div className="relative h-45 w-30 shrink-0">
              <Skeleton
                className={cn(
                  "absolute inset-0 h-full w-full rounded-md transition-opacity duration-200 ease-out",
                  posterLoaded ? "opacity-0" : "opacity-100",
                )}
              />
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onLoad={() => setPosterLoaded(true)}
                className={cn(
                  "absolute inset-0 h-full w-full rounded-md border border-stone-950 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.3)] dark:border-stone-700 transition-opacity duration-300 ease-out",
                  posterLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          ) : (
            <Skeleton className="h-45 w-30 shrink-0 rounded-md" />
          )}

          <div className="min-w-0 flex-1">
            <div className="max-w-[560px] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
              <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{movie.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/88">
                <span>{movie.year || "Unknown year"}</span>
                <span className="text-white/45">&middot;</span>
                <span>{movie.rating ? `IMDb ${movie.rating.toFixed(1)}` : "IMDb N/A"}</span>
                {movie.externalUrl ? (
                  <>
                    <span className="text-white/45">&middot;</span>
                    <a
                      href={movie.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-white/88 transition-colors hover:text-white"
                    >
                      <span>IMDb</span>
                      <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                    </a>
                  </>
                ) : null}
              </div>
              {synopsis ? (
                <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-white/84">
                  {synopsis}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-white/84">
                  Search results for <span className="font-medium">{movie.title}</span> (
                  {movie.year})
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black/70 active:scale-[0.97]"
          aria-label="Close movie details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-6 pb-6">
        <div className="mt-5 border-t border-stone-950 pt-5 dark:border-stone-700">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                Torrent results
              </h4>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                Search: {movie.title} {movie.year}
              </p>
            </div>
            {searchQuery.status === "success" ? (
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {results.length} result{results.length === 1 ? "" : "s"}
                {sendableResultsCount !== results.length
                  ? ` · ${sendableResultsCount} sendable`
                  : ""}
              </p>
            ) : null}
          </div>

          {searchQuery.status === "pending" ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md border border-stone-950/10 px-3 py-3 dark:border-stone-700/30"
                >
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
              ))}
            </div>
          ) : searchQuery.status === "error" ? (
            <div className="space-y-2">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                We couldn&apos;t load torrent matches for this movie yet.
              </p>
              <UserErrorAlert error={searchQuery.error} />
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-950/20 px-4 py-6 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
              <div className="flex items-center gap-2 font-medium text-stone-900 dark:text-stone-100">
                <Search className="size-4" />
                <span>No torrent results found</span>
              </div>
              <p className="mt-2">
                We searched by movie title and year, but nothing usable came back yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {hasOnlyUnavailableResults ? (
                <div className="rounded-lg border border-dashed border-stone-950/20 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
                  Results came back, but none include a usable transfer link yet.
                </div>
              ) : null}

              {results.map((result) => {
                const isSendable = canSendResult(result);
                const ageLabel = formatResultAge(result.uploadedAt);
                const uploadedAtLabel = result.uploadedAt
                  ? formatUploadedAt(result.uploadedAt)
                  : undefined;
                const sizeLabel = result.size > 0n ? formatBytes(result.size) : undefined;
                const seederLabel = formatSeederCount(result.seeders);

                return (
                  <div
                    key={result.id || `${result.title}-${result.link}`}
                    className={cn(
                      "flex flex-col gap-3 rounded-lg border border-stone-950 bg-stone-50 px-3 py-3 dark:border-stone-700 dark:bg-stone-950/40 sm:flex-row sm:items-center sm:justify-between",
                      !isSendable && "border-dashed border-stone-950/40 dark:border-stone-700/80",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="break-words text-sm font-medium">{result.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {result.indexer || result.source || "Unknown source"}
                        </span>
                        {sizeLabel ? (
                          <>
                            <span>&middot;</span>
                            <span>{sizeLabel}</span>
                          </>
                        ) : null}
                        {seederLabel ? (
                          <>
                            <span>&middot;</span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="size-3" />
                              {seederLabel}
                            </span>
                          </>
                        ) : null}
                        {ageLabel ? (
                          <>
                            <span>&middot;</span>
                            <span title={uploadedAtLabel}>{ageLabel}</span>
                          </>
                        ) : null}
                        {!isSendable ? (
                          <>
                            <span>&middot;</span>
                            <span>Unavailable</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isSendable ? (
                        <AddTransferButton
                          className="w-full sm:w-auto"
                          url={result.link}
                          ariaLabel={`Send ${result.title} to put.io`}
                        >
                          send to put.io
                        </AddTransferButton>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-secondary w-full cursor-not-allowed opacity-60 sm:w-auto"
                          aria-label={`Cannot send ${result.title} to put.io`}
                          title="This result is missing a usable transfer link"
                        >
                          unavailable
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MovieDetailModal({ movie, onClose }: Props) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-1rem,940px)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="sr-only">{movie.title} details</DialogTitle>
          <DialogDescription className="sr-only">
            Torrent results for {movie.title} ({movie.year})
          </DialogDescription>
          <MovieDetailContent movie={movie} onClose={onClose} isDesktop />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="border-0 bg-transparent p-0">
        <DrawerTitle className="sr-only">{movie.title} details</DrawerTitle>
        <DrawerDescription className="sr-only">
          Torrent results for {movie.title} ({movie.year})
        </DrawerDescription>
        <MovieDetailContent movie={movie} onClose={onClose} isDesktop={false} />
      </DrawerContent>
    </Drawer>
  );
}
