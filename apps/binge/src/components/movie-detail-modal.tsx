import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, Star, Users, X } from "lucide-react";

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

const RESOLUTION_FILTER_OPTIONS = ["all", "2160p", "1080p", "720p"] as const;
const CODEC_FILTER_OPTIONS = ["all", "x265", "x264"] as const;
const SORT_OPTIONS = ["seeders", "size", "age"] as const;

type ResolutionFilterValue = (typeof RESOLUTION_FILTER_OPTIONS)[number];
type CodecFilterValue = (typeof CODEC_FILTER_OPTIONS)[number];
type SortValue = (typeof SORT_OPTIONS)[number];

type MovieWithOptionalMetadata = Movie & {
  genres?: string[];
};

type ParsedResult = {
  result: SearchResult;
  resolution?: Exclude<ResolutionFilterValue, "all">;
  codec?: Exclude<CodecFilterValue, "all">;
  uploadedAtTimestamp: number;
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

function compareBigintsDescending(left: bigint, right: bigint) {
  if (left === right) {
    return 0;
  }

  return left > right ? -1 : 1;
}

function parseResolution(title: string): ParsedResult["resolution"] {
  const match = title.match(/\b(2160p|1080p|720p)\b/i);
  if (!match) {
    return undefined;
  }

  const value = match[1]?.toLowerCase();
  if (value === "2160p" || value === "1080p" || value === "720p") {
    return value;
  }

  return undefined;
}

function parseCodec(title: string): ParsedResult["codec"] {
  const normalizedTitle = title.toLowerCase();

  if (/\b(x265|h\.?265|hevc)\b/i.test(normalizedTitle)) {
    return "x265";
  }

  if (/\b(x264|h\.?264|avc)\b/i.test(normalizedTitle)) {
    return "x264";
  }

  return undefined;
}

function parseUploadedAtTimestamp(uploadedAt: string) {
  if (!uploadedAt) {
    return 0;
  }

  const timestamp = new Date(uploadedAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildMetadataTags(movie: MovieWithOptionalMetadata) {
  const genres = Array.isArray(movie.genres) ? movie.genres : [];
  const seen = new Set<string>();

  return genres
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-grid min-w-0 grid-cols-[1fr_--spacing(7)]">
      <select
        value={value}
        name={label.toLowerCase()}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="input col-span-full row-start-1 cursor-pointer appearance-none pr-7 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 8 5"
        width="8"
        height="5"
        fill="none"
        className="pointer-events-none col-start-2 row-start-1 place-self-center"
      >
        <path d="M.5.5 4 4 7.5.5" stroke="currentcolor" />
      </svg>
    </div>
  );
}

function MovieDetailContent({ movie, onClose, isDesktop }: Props & { isDesktop: boolean }) {
  const [backdropLoaded, setBackdropLoaded] = useState(!movie.backdropUrl);
  const [posterLoaded, setPosterLoaded] = useState(!movie.posterUrl);
  const [resolutionFilter, setResolutionFilter] = useState<ResolutionFilterValue>("all");
  const [codecFilter, setCodecFilter] = useState<CodecFilterValue>("all");
  const [sortBy, setSortBy] = useState<SortValue>("seeders");
  const searchQuery = useMovieSearchQuery(movie, true);

  useEffect(() => {
    setBackdropLoaded(!movie.backdropUrl);
    setPosterLoaded(!movie.posterUrl);
  }, [movie.backdropUrl, movie.posterUrl]);

  useEffect(() => {
    setResolutionFilter("all");
    setCodecFilter("all");
    setSortBy("seeders");
  }, [movie.id]);

  const results = useMemo(() => searchQuery.data?.results ?? [], [searchQuery.data]);
  const synopsis = movie.overview?.trim() || undefined;
  const metadataTags = useMemo(
    () => buildMetadataTags(movie as MovieWithOptionalMetadata),
    [movie],
  );
  const parsedResults = useMemo<ParsedResult[]>(
    () =>
      results.map((result) => ({
        result,
        resolution: parseResolution(result.title),
        codec: parseCodec(result.title),
        uploadedAtTimestamp: parseUploadedAtTimestamp(result.uploadedAt),
      })),
    [results],
  );
  const visibleResults = useMemo(() => {
    const filteredResults = parsedResults.filter((entry) => {
      if (resolutionFilter !== "all" && entry.resolution !== resolutionFilter) {
        return false;
      }

      if (codecFilter !== "all" && entry.codec !== codecFilter) {
        return false;
      }

      return true;
    });

    return [...filteredResults].sort((left, right) => {
      if (sortBy === "size") {
        const sizeOrder = compareBigintsDescending(left.result.size, right.result.size);
        if (sizeOrder !== 0) {
          return sizeOrder;
        }
      }

      if (sortBy === "age") {
        const ageOrder = right.uploadedAtTimestamp - left.uploadedAtTimestamp;
        if (ageOrder !== 0) {
          return ageOrder;
        }
      }

      const seederOrder = compareBigintsDescending(left.result.seeders, right.result.seeders);
      if (seederOrder !== 0) {
        return seederOrder;
      }

      if (sortBy === "seeders") {
        const sizeOrder = compareBigintsDescending(left.result.size, right.result.size);
        if (sizeOrder !== 0) {
          return sizeOrder;
        }
      }

      return left.result.title.localeCompare(right.result.title);
    });
  }, [codecFilter, parsedResults, resolutionFilter, sortBy]);
  const sendableResultsCount = useMemo(
    () => visibleResults.filter(({ result }) => canSendResult(result)).length,
    [visibleResults],
  );
  const hasOnlyUnavailableResults = visibleResults.length > 0 && sendableResultsCount === 0;
  const hasActiveFilters = resolutionFilter !== "all" || codecFilter !== "all";
  const shellClassName = isDesktop
    ? "max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-xl border border-stone-950 bg-stone-100 p-0 text-stone-950 shadow-[0_24px_48px_rgba(0,0,0,0.3)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
    : "max-h-[92vh] w-full overflow-y-auto bg-stone-100 p-0 text-stone-950 dark:bg-stone-900 dark:text-stone-100";

  return (
    <div className={shellClassName}>
      <div className="relative flex min-h-60 items-end overflow-hidden sm:min-h-90">
        {movie.backdropUrl ? (
          <>
            <Skeleton
              className={cn(
                "absolute inset-0 h-full w-full rounded-none transition-opacity duration-200 ease-out",
                backdropLoaded ? "opacity-0" : "opacity-100",
              )}
            />
            <img
              src={movie.backdropUrl}
              alt=""
              aria-hidden="true"
              onLoad={() => setBackdropLoaded(true)}
              className={cn(
                "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out",
                backdropLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-stone-300 dark:bg-stone-800" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-stone-100 via-stone-100/12 via-35% to-black/28 dark:from-stone-900 dark:via-stone-900/15 dark:to-black/55" />
        <div className="absolute inset-0 bg-linear-to-r from-white/78 via-white/48 via-35% to-transparent dark:from-black/35 dark:via-black/14 dark:to-transparent" />

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
            <div className="max-w-[560px] text-stone-950 dark:text-white dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
              <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{movie.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-700 dark:text-white/88">
                <span className="flex items-center gap-1">
                  <Star className="fill-amber-400 text-xs" strokeWidth={0} />
                  <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
                </span>
                {movie.year ? (
                  <>
                    <span className="text-stone-400 dark:text-white/45">&middot;</span>
                    <span className="text-stone-600 dark:text-white/72">{movie.year}</span>
                  </>
                ) : null}
                {movie.externalUrl ? (
                  <>
                    <span className="text-stone-400 dark:text-white/45">&middot;</span>
                    <a
                      href={movie.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-stone-700 transition-colors hover:text-stone-950 dark:text-white/88 dark:hover:text-white"
                    >
                      <span>IMDb</span>
                      <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                    </a>
                  </>
                ) : null}
              </div>
              {metadataTags.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {metadataTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-stone-950/10 bg-white/42 px-2 py-1 text-[11px] leading-none text-stone-700 backdrop-blur-sm dark:border-white/16 dark:bg-black/14 dark:text-white/76 dark:backdrop-blur-none"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
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
        {synopsis ? (
          <p className="mt-5 text-sm text-stone-600 dark:text-stone-400">{synopsis}</p>
        ) : null}
        <div className="mt-5 border-t border-stone-950 pt-5 dark:border-stone-700">
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
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex flex-wrap items-end gap-2">
                  <FilterSelect
                    label="Resolution"
                    value={resolutionFilter}
                    onChange={(value) => setResolutionFilter(value as ResolutionFilterValue)}
                    options={RESOLUTION_FILTER_OPTIONS.map((value) => ({
                      value,
                      label: value === "all" ? "All resolutions" : value,
                    }))}
                  />
                  <FilterSelect
                    label="Codec"
                    value={codecFilter}
                    onChange={(value) => setCodecFilter(value as CodecFilterValue)}
                    options={CODEC_FILTER_OPTIONS.map((value) => ({
                      value,
                      label: value === "all" ? "All codecs" : value,
                    }))}
                  />
                  <FilterSelect
                    label="Sort"
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortValue)}
                    options={[
                      { value: "seeders", label: "Most seeders" },
                      { value: "size", label: "Largest size" },
                      { value: "age", label: "Newest first" },
                    ]}
                  />
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setResolutionFilter("all");
                        setCodecFilter("all");
                      }}
                      className="btn btn-secondary text-xs"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
                <p className="self-end pb-0.5 text-xs leading-none tabular-nums text-stone-500 dark:text-stone-400">
                  {visibleResults.length}
                  {visibleResults.length !== results.length ? ` of ${results.length}` : ""} result
                  {visibleResults.length === 1 ? "" : "s"}
                </p>
              </div>

              {visibleResults.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-950/20 px-4 py-6 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
                  <div className="flex items-center gap-2 font-medium text-stone-900 dark:text-stone-100">
                    <Search className="size-4" />
                    <span>No results match these filters</span>
                  </div>
                  <p className="mt-2">
                    Try a different resolution or codec to widen the result set.
                  </p>
                </div>
              ) : null}

              {hasOnlyUnavailableResults ? (
                <div className="rounded-lg border border-dashed border-stone-950/20 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
                  Results came back, but none include a usable transfer link yet.
                </div>
              ) : null}

              <div role="list" aria-label="Torrent results list" className="flex flex-col gap-2">
                {visibleResults.map(({ result, resolution, codec }) => {
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
                      role="listitem"
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
                          {resolution ? (
                            <>
                              <span>&middot;</span>
                              <span className="rounded-full border border-stone-950/12 bg-stone-200/80 px-2 py-0.5 text-[11px] leading-none text-stone-700 dark:border-stone-700/70 dark:bg-stone-800/90 dark:text-stone-300">
                                {resolution}
                              </span>
                            </>
                          ) : null}
                          {codec ? (
                            <>
                              <span>&middot;</span>
                              <span className="rounded-full border border-stone-950/12 bg-stone-200/80 px-2 py-0.5 text-[11px] leading-none text-stone-700 dark:border-stone-700/70 dark:bg-stone-800/90 dark:text-stone-300">
                                {codec}
                              </span>
                            </>
                          ) : null}
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
