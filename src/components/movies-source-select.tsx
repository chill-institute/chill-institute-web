import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moviesSourceLabels, moviesSources, type UserSettings } from "@/lib/types";

export function MoviesSourceSelect({
  value,
  onChange,
}: {
  value: UserSettings["moviesSource"];
  onChange: (value: UserSettings["moviesSource"]) => void;
}) {
  return (
    <Select
      onValueChange={(v) => {
        onChange(Number(v) as UserSettings["moviesSource"]);
      }}
      value={String(value)}
      items={Object.fromEntries(moviesSources.map((s) => [String(s), moviesSourceLabels[s]]))}
    >
      <SelectTrigger className="min-w-[160px]">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {moviesSources.map((source) => (
          <SelectItem key={source} value={String(source)}>
            {moviesSourceLabels[source]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
