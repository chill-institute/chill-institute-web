import { ArrowDown, ArrowUp } from "lucide-react";

import { Checkbox } from "@chill-institute/ui/components/ui/checkbox";
import type { FilterState } from "@/hooks/use-search-filters";
import {
  SortDirection,
  codecFilterLabels,
  codecFilters,
  otherFilterLabels,
  otherFilters,
  resolutionFilterLabels,
  resolutionFilters,
  sortByLabels,
  sortByValues,
  type UserSettings,
} from "@/lib/types";

type Props = {
  filters: FilterState;
  onResolutionChange: (next: FilterState["resolution"]) => void;
  onCodecChange: (next: FilterState["codec"]) => void;
  onOtherChange: (next: FilterState["other"]) => void;
  onSort: (sortBy: UserSettings["sortBy"]) => void;
};

/*
 * Quick filters (resolution / codec / other) sit on a single horizontal
 * row at lg+, separated by 1px stone-950/12 hairlines. The sort row is
 * mobile-only (lg:hidden) and uses .btn pills with an active stamp fill.
 */
export function SearchFilterBar({
  filters,
  onResolutionChange,
  onCodecChange,
  onOtherChange,
  onSort,
}: Props) {
  return (
    <div className="mt-6 mb-2 flex flex-col gap-4 lg:items-center">
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">Quick filters</legend>
        <div id="quick-filters" className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
          <div className="flex items-center gap-2.5">
            {resolutionFilters.map((filter) => {
              const checked = filters.resolution.includes(filter);
              return (
                <Checkbox
                  key={filter}
                  id={`res-${String(filter)}`}
                  label={resolutionFilterLabels[filter]}
                  variant="small"
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    const next = isChecked
                      ? [...filters.resolution, filter]
                      : filters.resolution.filter((v) => v !== filter);
                    onResolutionChange(next);
                  }}
                />
              );
            })}
          </div>

          <span aria-hidden="true" className="h-4 w-px bg-stone-950/12 dark:bg-stone-100/12" />

          <div className="flex items-center gap-2.5">
            {codecFilters.map((filter) => {
              const checked = filters.codec.includes(filter);
              return (
                <Checkbox
                  key={filter}
                  id={`codec-${String(filter)}`}
                  label={codecFilterLabels[filter]}
                  variant="small"
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    const next = isChecked
                      ? [...filters.codec, filter]
                      : filters.codec.filter((v) => v !== filter);
                    onCodecChange(next);
                  }}
                />
              );
            })}
          </div>

          <span aria-hidden="true" className="h-4 w-px bg-stone-950/12 dark:bg-stone-100/12" />

          <div className="flex items-center gap-2.5">
            {otherFilters.map((filter) => {
              const checked = filters.other.includes(filter);
              return (
                <Checkbox
                  key={filter}
                  id={`other-${String(filter)}`}
                  label={otherFilterLabels[filter]}
                  variant="small"
                  checked={checked}
                  onCheckedChange={(isChecked) => {
                    const next = isChecked ? [filter] : [];
                    onOtherChange(next);
                  }}
                />
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0 lg:hidden">
        <legend className="sr-only">Sort by</legend>
        <div id="sort-options" className="flex flex-wrap gap-1.5">
          {sortByValues.map((option) => {
            const active = filters.sortBy === option;
            return (
              <button
                key={option}
                type="button"
                className={`btn ${active ? "bg-stone-300 dark:bg-stone-700" : ""}`}
                onClick={() => onSort(option)}
              >
                <span>{sortByLabels[option].toLowerCase()}</span>
                {active ? (
                  <span className="text-xs">
                    {filters.sortDirection === SortDirection.ASC ? <ArrowUp /> : <ArrowDown />}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
