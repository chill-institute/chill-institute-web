import { useEffect, useRef } from "react";
import { ArrowUpRight, CloudUpload, Star, X } from "lucide-react";

import { AddTransferButton } from "@/components/add-transfer-button";
import { SearchInTheInstituteButton } from "@/components/search-in-the-institute-button";
import type { MockTvShow } from "@/data/mock-tv-shows";

type Props = {
  show: MockTvShow;
  activeSeason: number;
  onSeasonChange: (season: number) => void;
  onClose: () => void;
};

export function TvShowDetailModal({ show, activeSeason, onSeasonChange, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const season = show.seasons.find((s) => s.number === activeSeason) ?? show.seasons[0];

  const seasonPad = String(season.number).padStart(2, "0");
  const magnetDn = `${show.title} S${seasonPad} 1080p`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full sm:max-w-[640px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-lg border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 shadow-[0_24px_48px_rgba(0,0,0,0.3)] animate-in fade-in-0 slide-in-from-bottom-2 sm:zoom-in-95 sm:slide-in-from-bottom-1">
        {/* Hero */}
        <div className="relative min-h-[220px] sm:min-h-[280px] overflow-hidden rounded-t-xl sm:rounded-t-lg flex items-end">
          {/* Backdrop (poster used as bg, not blurry) */}
          <div
            className="absolute inset-0 bg-cover bg-[center_20%]"
            style={{ backgroundImage: `url(${show.posterUrl.replace("w342", "w780")})` }}
          />
          {/* Gradient fade to card bg */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-transparent dark:from-stone-900" />

          {/* Hero content */}
          <div className="relative z-10 flex items-end gap-5 px-6 pb-5 w-full">
            <img
              src={show.posterUrl}
              alt={show.title}
              className="w-[90px] h-[135px] sm:w-[120px] sm:h-[180px] object-cover rounded-md shrink-0 border border-stone-950 dark:border-stone-700 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="font-serif text-xl sm:text-2xl leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.2)]">
                {show.title}
              </h3>
              <div className="flex flex-row flex-wrap items-center gap-2 text-sm">
                <span className="flex items-center gap-0.5">
                  <Star className="text-xs fill-amber-400" strokeWidth={0} />
                  <span>{show.rating.toFixed(1)}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">&middot;</span>
                <span className="text-stone-600 dark:text-stone-400">{show.year}</span>
              </div>
              <div className="flex flex-row flex-wrap gap-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium tracking-wide ${
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
                    className="px-1.5 py-0.5 rounded text-[11px] bg-stone-200 text-stone-600 border border-stone-950 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Overview */}
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-5">
            {show.overview}
          </p>

          {/* IMDb link */}
          <div className="flex flex-row gap-2 mb-5">
            <a
              href={show.imdbUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-sm"
            >
              <span>IMDb</span>
              <ArrowUpRight className="text-xs" strokeWidth={1.25} />
            </a>
          </div>

          {/* Season section */}
          <div className="border-t border-stone-950 dark:border-stone-700 pt-5">
            {/* Season tabs */}
            <div className="flex flex-row flex-wrap gap-0.5 mb-4">
              {show.seasons.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => onSeasonChange(s.number)}
                  className={`px-3 py-1.5 rounded text-xs cursor-pointer border transition-colors ${
                    s.number === activeSeason
                      ? "bg-stone-100 dark:bg-stone-900 text-stone-950 dark:text-stone-100 border-stone-950 dark:border-stone-700 shadow-[1px_1px_rgba(12,10,9,1)] dark:shadow-[1px_1px_rgba(68,64,60,1)]"
                      : "bg-transparent text-stone-600 dark:text-stone-400 border-transparent hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-stone-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Season actions */}
            <div className="flex flex-row flex-wrap gap-1.5 mb-4">
              <AddTransferButton url={`magnet:?dn=${encodeURIComponent(magnetDn)}`}>
                <CloudUpload className="text-xs" />
                <span>Send Season {season.number} to put.io</span>
              </AddTransferButton>
              <SearchInTheInstituteButton title={`${show.title} S${seasonPad}`} />
            </div>

            {/* Episode list */}
            <div className="flex flex-col gap-0.5">
              {season.episodes.map((ep) => {
                const epPad = String(ep.number).padStart(2, "0");
                const epMagnet = `${show.title} S${seasonPad}E${epPad} 1080p`;
                return (
                  <div
                    key={ep.number}
                    className="flex flex-row items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-stone-200 dark:hover:bg-stone-800"
                  >
                    <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-stone-200 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400 font-medium">
                      {epPad}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{ep.title}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {ep.runtime} &middot; {ep.date}
                      </div>
                    </div>
                    <div className="flex flex-row gap-1 shrink-0">
                      <AddTransferButton url={`magnet:?dn=${encodeURIComponent(epMagnet)}`}>
                        <CloudUpload />
                      </AddTransferButton>
                      <SearchInTheInstituteButton title={`${show.title} S${seasonPad}E${epPad}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
