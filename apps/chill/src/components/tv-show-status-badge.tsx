import { cn } from "@chill-institute/ui/cn";
import { getTVShowStatusLabel, TVShowStatus } from "@/lib/types";

function toneForStatus(status: TVShowStatus) {
  switch (status) {
    case TVShowStatus.TV_SHOW_STATUS_RETURNING:
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/12 dark:text-emerald-300";
    case TVShowStatus.TV_SHOW_STATUS_IN_PRODUCTION:
      return "border-sky-500/30 bg-sky-500/12 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-300";
    case TVShowStatus.TV_SHOW_STATUS_PLANNED:
      return "border-violet-500/30 bg-violet-500/12 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/12 dark:text-violet-300";
    case TVShowStatus.TV_SHOW_STATUS_CANCELED:
      return "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/12 dark:text-rose-300";
    case TVShowStatus.TV_SHOW_STATUS_ENDED:
      return "border-stone-500/30 bg-stone-500/12 text-stone-700 dark:border-stone-400/20 dark:bg-stone-400/12 dark:text-stone-300";
    case TVShowStatus.TV_SHOW_STATUS_UNSPECIFIED:
    default:
      return "border-stone-400/30 bg-stone-400/12 text-stone-700 dark:border-stone-500/20 dark:bg-stone-500/12 dark:text-stone-300";
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
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium leading-none",
        toneForStatus(status),
        className,
      )}
    >
      {getTVShowStatusLabel(status)}
    </span>
  );
}
