import { ToggleGroup, ToggleGroupItem } from "@chill-institute/ui/components/ui/toggle-group";
import { moviesSourceLabels, moviesSources, MoviesSource, type UserSettings } from "@/lib/types";

// Lowercased per the design's voice rules (sources are filters, not headings).
// "imdb" is the canonical case in the chill-design-system source list.
const moviesSourceTabLabels: Record<UserSettings["moviesSource"], string> = {
  [MoviesSource.UNSPECIFIED]: "imdb moviemeter",
  [MoviesSource.IMDB_MOVIEMETER]: "imdb moviemeter",
  [MoviesSource.IMDB_TOP_250]: "imdb top 250",
  [MoviesSource.YTS]: "yts",
  [MoviesSource.ROTTEN_TOMATOES]: "rotten tomatoes",
  [MoviesSource.TRAKT]: "trakt",
};

export function MoviesSourceSelect({
  value,
  onChange,
}: {
  value: UserSettings["moviesSource"];
  onChange: (value: UserSettings["moviesSource"]) => void;
}) {
  return (
    <ToggleGroup
      className="flex flex-wrap items-center gap-1.5"
      onValueChange={(next) => {
        if (next.length === 0) {
          return;
        }
        onChange(Number(next[0]) as UserSettings["moviesSource"]);
      }}
      value={[String(value)]}
    >
      {moviesSources.map((source) => (
        <ToggleGroupItem
          key={source}
          value={String(source)}
          aria-label={moviesSourceLabels[source]}
          // Visually aligned with SortPill from the design system: same height,
          // same px/font, same stamp-on-active. Difference is only the data
          // attribute Base UI emits (`data-pressed` vs our `data-active`).
          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-transparent bg-transparent px-2.5 py-1 text-[0.8125rem] whitespace-nowrap text-stone-700 motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 data-[pressed]:border-stone-950 data-[pressed]:bg-stone-100 data-[pressed]:text-stone-950 data-[pressed]:shadow-[1px_1px_0_var(--color-stone-950)] data-[pressed]:active:translate-x-px data-[pressed]:active:translate-y-px data-[pressed]:active:shadow-none data-[pressed]:active:duration-100 dark:text-stone-200 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 dark:data-[pressed]:border-stone-700 dark:data-[pressed]:bg-stone-900 dark:data-[pressed]:text-stone-100 dark:data-[pressed]:shadow-[1px_1px_0_var(--color-stone-700)]"
        >
          {moviesSourceTabLabels[source]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
