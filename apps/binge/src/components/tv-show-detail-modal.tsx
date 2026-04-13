import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CloudUpload, Loader2, Star, X } from "lucide-react";

import { AddTransferButton } from "@/components/add-transfer-button";
import { TVShowStatusBadge } from "@/components/tv-show-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { UserErrorAlert } from "@/components/user-error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { type TVShow } from "@/lib/types";
import {
  useTVShowDetailQuery,
  useTVShowSeasonDownloadsQuery,
  useTVShowSeasonQuery,
} from "@/queries/tv-shows";

type Props = {
  imdbId: string;
  fallbackShow?: TVShow;
  activeSeason?: number;
  onSeasonChange: (season: number) => void;
  onClose: () => void;
};

function formatAirDate(value?: string) {
  if (!value) {
    return "TBA";
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

function EpisodeActionSkeleton() {
  return <Skeleton className="h-8 w-8 shrink-0 rounded-md" />;
}

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

type DetailData = NonNullable<ReturnType<typeof useTVShowDetailQuery>["data"]>;
type SeasonData = NonNullable<ReturnType<typeof useTVShowSeasonQuery>["data"]>;
type SeasonDownloadsData = NonNullable<ReturnType<typeof useTVShowSeasonDownloadsQuery>["data"]>;

type ContentProps = {
  isDesktop: boolean;
  show?: TVShow | DetailData["show"];
  genres: string[];
  backdropUrl?: string;
  posterUrl?: string;
  detailQuery: ReturnType<typeof useTVShowDetailQuery>;
  downloadsQuery: ReturnType<typeof useTVShowSeasonDownloadsQuery>;
  seasonQuery: ReturnType<typeof useTVShowSeasonQuery>;
  seasons: DetailData["seasons"];
  resolvedSeasonNumber: number;
  selectedSeason?: SeasonData["season"] | DetailData["seasons"][number];
  downloadsByEpisode: Map<number, SeasonDownloadsData["episodes"][number]["download"]>;
  onClose: () => void;
  onSeasonChange: (season: number) => void;
};

function TvShowDetailContent({
  isDesktop,
  show,
  genres,
  backdropUrl,
  posterUrl,
  detailQuery,
  downloadsQuery,
  seasonQuery,
  seasons,
  resolvedSeasonNumber,
  selectedSeason,
  downloadsByEpisode,
  onClose,
  onSeasonChange,
}: ContentProps) {
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(!posterUrl);

  useEffect(() => {
    setBackdropLoaded(false);
  }, [backdropUrl]);

  useEffect(() => {
    setPosterLoaded(!posterUrl);
  }, [posterUrl]);

  const seasonRefreshing =
    (seasonQuery.isFetching && seasonQuery.status === "success") ||
    (downloadsQuery.isFetching && downloadsQuery.status === "success");

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-3 top-3 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black/70 active:scale-[0.97]"
      aria-label="Close TV show details"
    >
      <X className="h-4 w-4" />
    </button>
  );

  const shellClassName = isDesktop
    ? "max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-xl border border-solid border-stone-950 bg-stone-100 p-0 text-stone-950 shadow-[0_24px_48px_rgba(0,0,0,0.3)] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
    : "max-h-[92vh] w-full overflow-y-auto bg-stone-100 p-0 text-stone-950 dark:bg-stone-900 dark:text-stone-100";

  return (
    <div className={shellClassName}>
      <div className="relative flex min-h-60 items-end overflow-hidden sm:min-h-90">
        {backdropUrl ? (
          <>
            <Skeleton
              className={cn(
                "absolute inset-0 h-full w-full rounded-none transition-opacity duration-200 ease-out",
                backdropLoaded ? "opacity-0" : "opacity-100",
              )}
            />
            <img
              src={backdropUrl}
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
        <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-stone-100/10 via-35% to-black/45 dark:from-stone-900 dark:via-stone-900/15 dark:to-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

        <div className="relative z-10 flex w-full items-end gap-5 px-6 pb-6 sm:px-7">
          {posterUrl ? (
            <div className="relative h-45 w-30 shrink-0">
              <Skeleton
                className={cn(
                  "absolute inset-0 h-full w-full rounded-md transition-opacity duration-200 ease-out",
                  posterLoaded ? "opacity-0" : "opacity-100",
                )}
              />
              <img
                src={posterUrl}
                alt={show?.title ?? "TV show poster"}
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
            {show ? (
              <div className="max-w-[520px] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{show.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/88">
                  <span className="flex items-center gap-1">
                    <Star className="fill-amber-400 text-xs" strokeWidth={0} />
                    <span>{show.rating ? show.rating.toFixed(1) : "N/A"}</span>
                  </span>
                  {show.year ? (
                    <>
                      <span className="text-white/45">&middot;</span>
                      <span className="text-white/72">{show.year}</span>
                    </>
                  ) : null}
                  <span className="text-white/45">&middot;</span>
                  <span className="text-white/72">
                    {detailQuery.data?.show?.seasonCount ?? show.seasonCount} seasons
                  </span>
                  {show.externalUrl ? (
                    <>
                      <span className="text-white/45">&middot;</span>
                      <a
                        href={show.externalUrl}
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TVShowStatusBadge status={detailQuery.data?.show?.status ?? show.status} />
                  {genres.length > 0 ? (
                    <>
                      <span className="text-white/45">&middot;</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {genres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-md border border-white/16 bg-black/14 px-2 py-1 text-[11px] leading-none text-white/76"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-52" />
              </div>
            )}
          </div>
        </div>
        {closeButton}
      </div>

      <div className="px-6 pb-6">
        {detailQuery.status === "error" ? (
          <UserErrorAlert className="mt-5" error={detailQuery.error} />
        ) : null}

        {show?.overview ? (
          <p className="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {show.overview}
          </p>
        ) : detailQuery.isPending ? (
          <div className="mt-5 flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : null}

        <div
          className={cn(
            "mt-5 border-t border-stone-950 pt-5 transition-opacity duration-200 ease-out dark:border-stone-700",
            seasonRefreshing ? "opacity-75" : "opacity-100",
          )}
        >
          {seasons.length > 1 ? (
            <div className="mb-4 flex flex-wrap gap-1">
              {seasons.map((season) => (
                <button
                  key={season.seasonNumber}
                  type="button"
                  onClick={() => onSeasonChange(season.seasonNumber)}
                  className={
                    season.seasonNumber === resolvedSeasonNumber
                      ? "btn text-xs bg-stone-950 text-stone-100 dark:bg-stone-100 dark:text-stone-950 dark:border-stone-100"
                      : "btn btn-secondary text-xs"
                  }
                >
                  {season.name || `Season ${season.seasonNumber}`}
                </button>
              ))}
            </div>
          ) : detailQuery.isPending ? (
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-24" />
              ))}
            </div>
          ) : null}

          {selectedSeason ? (
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-stone-950 bg-stone-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-stone-700 dark:bg-stone-950/40">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {selectedSeason.name || `Season ${selectedSeason.seasonNumber}`}
                </div>
                <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  {selectedSeason.episodeCount} episodes
                  <span className="mx-1.5">&middot;</span>
                  {formatAirDate(selectedSeason.airDate)}
                  {downloadsQuery.data?.seasonPack?.size ? (
                    <>
                      <span className="mx-1.5">&middot;</span>
                      {formatBytes(downloadsQuery.data.seasonPack.size)}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:flex-nowrap">
                {downloadsQuery.isPending ? (
                  <button type="button" className="btn btn-secondary text-sm" disabled>
                    <Loader2 className="animate-spin text-xs" />
                    <span>loading downloads</span>
                  </button>
                ) : downloadsQuery.data?.seasonPack?.link ? (
                  <AddTransferButton
                    url={downloadsQuery.data.seasonPack.link}
                    ariaLabel={`Send ${show?.title ?? "TV show"} season ${resolvedSeasonNumber} to put.io`}
                  >
                    send season to put.io
                  </AddTransferButton>
                ) : (
                  <button type="button" className="btn btn-secondary text-sm opacity-70" disabled>
                    <CloudUpload className="text-xs" />
                    <span>season pack unavailable</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {seasonQuery.status === "error" ? (
            <UserErrorAlert error={seasonQuery.error} />
          ) : seasonQuery.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-md border border-stone-950/10 px-3 py-2 dark:border-stone-700/30"
                >
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <EpisodeActionSkeleton />
                  <EpisodeActionSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(seasonQuery.data?.episodes ?? []).map((episode) => {
                const episodeDownload = downloadsByEpisode.get(episode.episodeNumber);
                const paddedEpisode = String(episode.episodeNumber).padStart(2, "0");

                return (
                  <div
                    key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                    className="flex items-center gap-3 rounded-md border border-stone-950/10 px-3 py-2.5 dark:border-stone-700/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-stone-200 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                      {paddedEpisode}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">
                        {episode.name || `Episode ${episode.episodeNumber}`}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-stone-500 dark:text-stone-400">
                        <span>{formatAirDate(episode.airDate)}</span>
                        {episode.runtime ? <span>{episode.runtime} min</span> : null}
                        {episode.rating ? <span>{episode.rating.toFixed(1)} IMDb</span> : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      {downloadsQuery.isPending ? (
                        <EpisodeActionSkeleton />
                      ) : episodeDownload?.link ? (
                        <AddTransferButton
                          url={episodeDownload.link}
                          ariaLabel={`Send ${show?.title ?? "TV show"} season ${episode.seasonNumber} episode ${episode.episodeNumber} to put.io`}
                        >
                          <CloudUpload />
                        </AddTransferButton>
                      ) : (
                        <button type="button" className="btn px-2 opacity-60" disabled>
                          <CloudUpload />
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

export function TvShowDetailModal({
  imdbId,
  fallbackShow,
  activeSeason,
  onSeasonChange,
  onClose,
}: Props) {
  const isDesktop = useIsDesktop();
  const detailQuery = useTVShowDetailQuery(imdbId, true);
  const show = detailQuery.data?.show ?? fallbackShow;
  const seasons = detailQuery.data?.seasons ?? [];
  const resolvedSeasonNumber = activeSeason ?? seasons[0]?.seasonNumber ?? 1;

  const seasonQuery = useTVShowSeasonQuery(imdbId, resolvedSeasonNumber, seasons.length > 0);
  const downloadsQuery = useTVShowSeasonDownloadsQuery(
    imdbId,
    resolvedSeasonNumber,
    seasons.length > 0,
  );

  const downloadsByEpisode = useMemo(
    () =>
      new Map(
        (downloadsQuery.data?.episodes ?? []).map((episode) => [
          episode.episodeNumber,
          episode.download,
        ]),
      ),
    [downloadsQuery.data?.episodes],
  );

  const selectedSeason =
    seasonQuery.data?.season ??
    seasons.find((season) => season.seasonNumber === resolvedSeasonNumber);
  const backdropUrl = detailQuery.data?.show?.backdropUrl;
  const posterUrl = show?.posterUrl;
  const genres = detailQuery.data?.show?.genres ?? [];

  const content = (
    <TvShowDetailContent
      isDesktop={isDesktop}
      show={show}
      genres={genres}
      backdropUrl={backdropUrl}
      posterUrl={posterUrl}
      detailQuery={detailQuery}
      downloadsQuery={downloadsQuery}
      seasonQuery={seasonQuery}
      seasons={seasons}
      resolvedSeasonNumber={resolvedSeasonNumber}
      selectedSeason={selectedSeason}
      downloadsByEpisode={downloadsByEpisode}
      onClose={onClose}
      onSeasonChange={onSeasonChange}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogDescription className="sr-only">
          Browse TV show metadata, seasons, and episode download actions.
        </DialogDescription>
        <DialogTitle className="sr-only">{show?.title ?? "TV show details"}</DialogTitle>
        <DialogContent
          showCloseButton={false}
          className="top-1/2 left-1/2 w-full max-w-[940px] -translate-x-1/2 -translate-y-1/2 gap-0 p-0"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open
      direction="bottom"
      onOpenChange={(open) => !open && onClose()}
      modal
      shouldScaleBackground={false}
    >
      <DrawerTitle className="sr-only">{show?.title ?? "TV show details"}</DrawerTitle>
      <DrawerDescription className="sr-only">
        Browse TV show metadata, seasons, and episode download actions.
      </DrawerDescription>
      <DrawerContent className="overflow-hidden rounded-t-3xl border-x-0 border-b-0 border-t-0 bg-stone-100 p-0 shadow-[0_-24px_48px_rgba(0,0,0,0.24)] dark:bg-stone-900">
        {content}
      </DrawerContent>
    </Drawer>
  );
}
