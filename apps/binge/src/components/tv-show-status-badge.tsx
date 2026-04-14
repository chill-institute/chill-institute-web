import { cn } from "@/lib/cn";
import { getTVShowStatusLabel, TVShowStatus } from "@/lib/types";

function toneForStatus(status: TVShowStatus) {
  switch (status) {
    case TVShowStatus.TV_SHOW_STATUS_RETURNING:
      return "border-emerald-700/16 bg-emerald-500/18 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-300";
    case TVShowStatus.TV_SHOW_STATUS_IN_PRODUCTION:
      return "border-sky-700/16 bg-sky-500/18 text-sky-950 dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-300";
    case TVShowStatus.TV_SHOW_STATUS_PLANNED:
      return "border-violet-700/16 bg-violet-500/18 text-violet-950 dark:border-violet-400/20 dark:bg-violet-400/12 dark:text-violet-300";
    case TVShowStatus.TV_SHOW_STATUS_CANCELED:
      return "border-rose-700/16 bg-rose-500/18 text-rose-950 dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-300";
    case TVShowStatus.TV_SHOW_STATUS_ENDED:
      return "border-stone-950/12 bg-stone-950/8 text-stone-800 dark:border-stone-400/20 dark:bg-stone-400/12 dark:text-stone-300";
    case TVShowStatus.TV_SHOW_STATUS_UNSPECIFIED:
    default:
      return "border-stone-950/12 bg-stone-950/8 text-stone-800 dark:border-stone-500/20 dark:bg-stone-500/12 dark:text-stone-300";
  }
}

export function TVShowStatusBadge({
  status,
  className,
}: {
  status: TVShowStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium leading-none backdrop-blur-sm dark:backdrop-blur-none",
        toneForStatus(status),
        className,
      )}
    >
      {getTVShowStatusLabel(status)}
    </span>
  );
}
