import { ToggleGroup, ToggleGroupItem } from "@chill-institute/ui/components/ui/toggle-group";
import { moviesSourceLabels, moviesSources, MoviesSource, type UserSettings } from "@/lib/types";

const moviesSourceTabLabels: Record<UserSettings["moviesSource"], string> = {
  [MoviesSource.UNSPECIFIED]: "IMDb Moviemeter",
  [MoviesSource.IMDB_MOVIEMETER]: "IMDb Moviemeter",
  [MoviesSource.IMDB_TOP_250]: "IMDb Top 250",
  [MoviesSource.YTS]: "YTS",
  [MoviesSource.ROTTEN_TOMATOES]: "Rotten Tomatoes",
  [MoviesSource.TRAKT]: "Trakt",
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
      className="w-full justify-start gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
          className="h-7.5 shrink-0 rounded-md px-2 text-[13px] whitespace-nowrap border border-transparent data-[pressed]:border-stone-950 data-[pressed]:shadow-[1px_1px_rgba(12,10,9,1)] dark:data-[pressed]:border-stone-700 dark:data-[pressed]:shadow-[1px_1px_rgba(68,64,60,1)]"
        >
          {moviesSourceTabLabels[source]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
