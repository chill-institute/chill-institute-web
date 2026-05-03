import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CloudUpload, Loader2, Star, X } from "lucide-react";

import { AddTransferButton } from "@/components/add-transfer-button";
import { TVShowStatusBadge } from "@/components/tv-show-status-badge";
import { Button } from "@chill-institute/ui/components/ui/button";
import { IconButton } from "@chill-institute/ui/components/icon-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@chill-institute/ui/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@chill-institute/ui/components/ui/drawer";
import { UserErrorAlert } from "@/components/user-error-alert";
import { Skeleton } from "@chill-institute/ui/components/ui/skeleton";
import { cn } from "@chill-institute/ui/cn";
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
    <IconButton
      onClick={onClose}
      aria-label="Close TV show details"
      className="absolute right-3 top-3 z-20 rounded-full border-stone-950 bg-stone-100 shadow-[1px_1px_0_var(--color-stone-950)] dark:border-stone-700 dark:bg-stone-900 dark:shadow-[1px_1px_0_var(--color-stone-700)]"
    >
      <X />
    </IconButton>
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
        <div className="absolute inset-0 bg-linear-to-t from-stone-100 via-stone-100/12 via-35% to-black/28 dark:from-stone-900 dark:via-stone-900/15 dark:to-black/55" />
        <div className="absolute inset-0 bg-linear-to-r from-stone-100/78 via-stone-100/48 via-35% to-transparent dark:from-black/35 dark:via-black/14 dark:to-transparent" />

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
              <div className="max-w-[520px] text-stone-950 dark:text-white dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                <h3 className="font-serif text-2xl leading-tight sm:text-3xl">{show.title}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-700 dark:text-white/88">
                  <span className="flex items-center gap-1">
                    <Star className="fill-amber-400 text-xs" strokeWidth={0} />
                    <span>{show.rating ? show.rating.toFixed(1) : "N/A"}</span>
                  </span>
                  {show.year ? (
                    <>
                      <span className="text-stone-400 dark:text-white/45">&middot;</span>
                      <span className="text-stone-600 dark:text-white/72">{show.year}</span>
                    </>
                  ) : null}
                  <span className="text-stone-400 dark:text-white/45">&middot;</span>
                  <span className="text-stone-600 dark:text-white/72">
                    {detailQuery.data?.show?.seasonCount ?? show.seasonCount} seasons
                  </span>
                  {show.externalUrl ? (
                    <>
                      <span className="text-stone-400 dark:text-white/45">&middot;</span>
                      <a
                        href={show.externalUrl}
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
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <TVShowStatusBadge status={detailQuery.data?.show?.status ?? show.status} />
                  {genres.length > 0 ? (
                    <>
                      <span className="text-stone-400 dark:text-white/45">&middot;</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {genres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-md border border-stone-950/10 bg-white/42 px-2 py-1 text-[0.6875rem] leading-none text-stone-700 backdrop-blur-sm dark:border-white/16 dark:bg-black/14 dark:text-white/76 dark:backdrop-blur-none"
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
                <Button
                  key={season.seasonNumber}
                  size="sm"
                  variant={season.seasonNumber === resolvedSeasonNumber ? "primary" : "ghost"}
                  onClick={() => onSeasonChange(season.seasonNumber)}
                >
                  {season.name || `season ${season.seasonNumber}`}
                </Button>
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
                  <Button disabled>
                    <Loader2 className="animate-spin" />
                    <span>loading downloads</span>
                  </Button>
                ) : downloadsQuery.data?.seasonPack?.link ? (
                  <AddTransferButton
                    url={downloadsQuery.data.seasonPack.link}
                    ariaLabel={`Send ${show?.title ?? "TV show"} season ${resolvedSeasonNumber} to put.io`}
                  >
                    send season to put.io
                  </AddTransferButton>
                ) : (
                  <Button variant="off" disabled>
                    <CloudUpload />
                    <span>season pack unavailable</span>
                  </Button>
                )}
              </div>
            </div>
          ) : null}

          {seasonQuery.status === "error" ? (
            <UserErrorAlert error={seasonQuery.error} />
          ) : seasonQuery.isPending ? (
            <div className="overflow-hidden rounded-lg border border-stone-950/15 bg-stone-50 dark:border-stone-700/70 dark:bg-stone-950/40">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-t border-stone-950/10 px-3 py-2.5 first:border-t-0 dark:border-stone-700/30"
                >
                  <Skeleton className="h-3 w-6 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <EpisodeActionSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-950/15 bg-stone-50 dark:border-stone-700/70 dark:bg-stone-950/40">
              {(seasonQuery.data?.episodes ?? []).map((episode) => {
                const episodeDownload = downloadsByEpisode.get(episode.episodeNumber);
                const paddedEpisode = String(episode.episodeNumber).padStart(2, "0");

                return (
                  <div
                    key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                    className="flex items-center gap-3 border-t border-stone-950/10 px-3 py-2.5 first:border-t-0 dark:border-stone-700/30"
                  >
                    <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-stone-600 dark:text-stone-300">
                      e{paddedEpisode}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.8125rem] text-stone-950 dark:text-stone-100">
                        {episode.name || `episode ${episode.episodeNumber}`}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[0.6875rem] text-stone-600 dark:text-stone-300">
                        <span>{formatAirDate(episode.airDate)}</span>
                        {episode.runtime ? <span>· {episode.runtime}m</span> : null}
                        {episode.rating ? <span>· ★ {episode.rating.toFixed(1)}</span> : null}
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
                        <Button variant="off" disabled>
                          <CloudUpload />
                        </Button>
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
