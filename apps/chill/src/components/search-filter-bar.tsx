import { ArrowDown, ArrowUp } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
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

export function SearchFilterBar({
  filters,
  onResolutionChange,
  onCodecChange,
  onOtherChange,
  onSort,
}: Props) {
  return (
    <div className="flex flex-col space-y-6 mt-6 mb-2 lg:items-center">
      <fieldset className="flex flex-col space-y-1 lg:flex-row lg:space-x-2 lg:space-y-0 items-start lg:items-center">
        <legend className="text-sm font-medium leading-none">
          Quick filters<span className="lg:visible invisible">:</span>
        </legend>

        <div className="flex flex-row items-center space-x-3" id="quick-filters">
          <div className="flex flex-row space-x-2">
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

          <div>
            <div className="w-[1px] h-4 bg-stone-400 dark:bg-stone-700" />
          </div>

          <div className="flex flex-row space-x-2">
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

          <div>
            <div className="w-[1px] h-4 bg-stone-400 dark:bg-stone-700" />
          </div>

          <div className="flex flex-row space-x-2">
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

      <fieldset className="flex flex-col space-y-1 lg:hidden lg:space-x-2 lg:space-y-0 items-start lg:items-center">
        <legend className="text-sm font-medium leading-none">
          Sort by<span className="lg:visible invisible">:</span>
        </legend>

        <div className="flex flex-row space-x-2 flex-wrap" id="sort-options">
          {sortByValues.map((option) => {
            const active = filters.sortBy === option;
            return (
              <button
                key={option}
                type="button"
                className={`btn ${active ? "bg-stone-300 dark:bg-stone-700" : ""}`}
                onClick={() => onSort(option)}
              >
                <div className="flex flex-row items-center space-x-0.5">
                  <span>{sortByLabels[option].toLowerCase()}</span>
                  {active ? (
                    <span className="text-xs -mb-0.5">
                      {filters.sortDirection === SortDirection.ASC ? <ArrowUp /> : <ArrowDown />}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
