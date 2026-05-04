import { ToggleGroup, ToggleGroupItem } from "@chill-institute/ui/components/ui/toggle-group";
import {
  getTVShowsSourceLabel,
  TVShowsSource,
  tvShowsSources,
  type UserSettings,
} from "@/lib/types";

// Lowercased per the design's voice rules. "apple tv+" / "disney+" preserve
// brand symbols; everything else loses the title casing.
const tvShowsSourceTabLabels: Record<UserSettings["tvShowsSource"], string> = {
  [TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED]: "netflix",
  [TVShowsSource.TV_SHOWS_SOURCE_NETFLIX]: "netflix",
  [TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX]: "hbo max",
  [TVShowsSource.TV_SHOWS_SOURCE_APPLE_TV_PLUS]: "apple tv+",
  [TVShowsSource.TV_SHOWS_SOURCE_PRIME_VIDEO]: "prime",
  [TVShowsSource.TV_SHOWS_SOURCE_DISNEY_PLUS]: "disney+",
};

export function TVShowsSourceSelect({
  value,
  onChange,
}: {
  value: UserSettings["tvShowsSource"];
  onChange: (value: UserSettings["tvShowsSource"]) => void;
}) {
  return (
    <ToggleGroup
      className="flex flex-wrap items-center gap-1.5"
      onValueChange={(next) => {
        if (next.length === 0) {
          return;
        }
        onChange(Number(next[0]) as UserSettings["tvShowsSource"]);
      }}
      value={[String(value)]}
    >
      {tvShowsSources.map((source) => (
        <ToggleGroupItem
          key={source}
          value={String(source)}
          aria-label={getTVShowsSourceLabel(source)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-transparent bg-transparent px-2.5 py-1 text-[0.8125rem] whitespace-nowrap text-stone-700 motion-safe:transition-[color,background-color,box-shadow,transform] motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] hover-hover:hover:bg-stone-200 hover-hover:hover:text-stone-950 data-[pressed]:border-stone-950 data-[pressed]:bg-stone-100 data-[pressed]:text-stone-950 data-[pressed]:shadow-[1px_1px_0_var(--color-stone-950)] data-[pressed]:active:translate-x-px data-[pressed]:active:translate-y-px data-[pressed]:active:shadow-none data-[pressed]:active:duration-100 dark:text-stone-200 dark:hover-hover:hover:bg-stone-800 dark:hover-hover:hover:text-stone-100 dark:data-[pressed]:border-stone-700 dark:data-[pressed]:bg-stone-900 dark:data-[pressed]:text-stone-100 dark:data-[pressed]:shadow-[1px_1px_0_var(--color-stone-700)]"
        >
          {tvShowsSourceTabLabels[source]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
