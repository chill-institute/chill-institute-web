import { ToggleGroup, ToggleGroupItem } from "@chill-institute/ui/components/ui/toggle-group";
import {
  getTVShowsSourceLabel,
  TVShowsSource,
  tvShowsSources,
  type UserSettings,
} from "@/lib/types";

const tvShowsSourceTabLabels: Record<UserSettings["tvShowsSource"], string> = {
  [TVShowsSource.TV_SHOWS_SOURCE_UNSPECIFIED]: "Netflix",
  [TVShowsSource.TV_SHOWS_SOURCE_NETFLIX]: "Netflix",
  [TVShowsSource.TV_SHOWS_SOURCE_HBO_MAX]: "HBO Max",
  [TVShowsSource.TV_SHOWS_SOURCE_APPLE_TV_PLUS]: "Apple TV+",
  [TVShowsSource.TV_SHOWS_SOURCE_PRIME_VIDEO]: "Prime",
  [TVShowsSource.TV_SHOWS_SOURCE_DISNEY_PLUS]: "Disney+",
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
      className="w-full justify-start gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
          className="h-7.5 shrink-0 rounded-md px-2 text-[12px] whitespace-nowrap border border-transparent data-[pressed]:border-stone-950 data-[pressed]:shadow-[1px_1px_rgba(12,10,9,1)] dark:data-[pressed]:border-stone-700 dark:data-[pressed]:shadow-[1px_1px_rgba(68,64,60,1)]"
        >
          {tvShowsSourceTabLabels[source]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
