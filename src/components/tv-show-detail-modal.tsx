import { useEffect, useRef } from "react";
import { ArrowUpRight, CloudUpload, X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full sm:max-w-[640px] max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl border border-solid border-stone-950 dark:border-stone-700 bg-stone-200 dark:bg-stone-800 animate-in fade-in-0 slide-in-from-bottom-2 sm:zoom-in-95 sm:slide-in-from-bottom-1">
        {/* Hero */}
        <div className="relative h-48 sm:h-56 overflow-hidden rounded-t-xl">
          <img
            src={show.posterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-200/40 to-stone-200 dark:via-stone-800/40 dark:to-stone-800" />
          <div className="relative z-10 flex items-end h-full p-4 gap-4">
            <img
              src={show.posterUrl}
              alt={show.title}
              className="w-[100px] h-[150px] sm:w-[120px] sm:h-[180px] object-cover rounded border border-stone-950 dark:border-stone-700 shadow-lg"
            />
            <div className="flex flex-col gap-1 pb-1">
              <h3 className="font-serif text-xl sm:text-2xl leading-tight">{show.title}</h3>
              <div className="flex flex-row flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{show.rating.toFixed(1)}</span>
                <span className="text-stone-500 dark:text-stone-400">/</span>
                <span className="text-stone-600 dark:text-stone-400">{show.year}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    show.status === "Returning"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {show.status}
                </span>
              </div>
              <div className="flex flex-row flex-wrap gap-1 mt-0.5">
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
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {show.overview}
          </p>

          {/* Season tabs */}
          <div className="flex flex-row flex-wrap gap-1">
            {show.seasons.map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => onSeasonChange(s.number)}
                className={`btn text-xs ${s.number === activeSeason ? "" : "btn-secondary"}`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Season actions */}
          <div className="flex flex-row flex-wrap gap-2">
            <AddTransferButton url={`magnet:?dn=${encodeURIComponent(magnetDn)}`}>
              <CloudUpload className="text-xs" />
              <span>Send {season.name} to put.io</span>
            </AddTransferButton>
            <SearchInTheInstituteButton title={`${show.title} S${seasonPad}`} />
          </div>

          {/* Episode list */}
          <div className="space-y-1">
            {season.episodes.map((ep) => {
              const epPad = String(ep.number).padStart(2, "0");
              const epMagnet = `${show.title} S${seasonPad}E${epPad} 1080p`;
              return (
                <div
                  key={ep.number}
                  className="flex flex-row items-center gap-2 p-2 rounded bg-stone-100 dark:bg-stone-900 border border-stone-950/10 dark:border-stone-700/50"
                >
                  <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded bg-stone-300 dark:bg-stone-700 text-xs font-medium">
                    {ep.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ep.title}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
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

          {/* IMDb link */}
          <a
            href={show.imdbUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary inline-flex items-center gap-1 text-sm"
          >
            <span>IMDb</span>
            <ArrowUpRight className="text-xs" strokeWidth={1.25} />
          </a>
        </div>
      </div>
    </div>
  );
}
