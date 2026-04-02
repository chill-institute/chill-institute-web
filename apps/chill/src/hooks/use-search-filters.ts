import { useEffect, useReducer, useRef } from "react";

import type { UserSettings } from "@/lib/types";
import { SortBy, SortDirection } from "@/lib/types";

export type FilterState = {
  resolution: UserSettings["resolutionFilters"];
  codec: UserSettings["codecFilters"];
  other: UserSettings["otherFilters"];
  sortBy: UserSettings["sortBy"];
  sortDirection: UserSettings["sortDirection"];
};

type Action =
  | { type: "SYNC_SETTINGS"; settings: UserSettings }
  | { type: "SET_RESOLUTION"; value: FilterState["resolution"] }
  | { type: "SET_CODEC"; value: FilterState["codec"] }
  | { type: "SET_OTHER"; value: FilterState["other"] }
  | { type: "SET_SORT"; value: FilterState["sortBy"] }
  | { type: "TOGGLE_SORT_DIR" };

function reducer(state: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "SYNC_SETTINGS":
      return {
        resolution: action.settings.resolutionFilters,
        codec: action.settings.codecFilters,
        other: action.settings.otherFilters,
        sortBy: action.settings.sortBy,
        sortDirection: action.settings.sortDirection,
      };
    case "SET_RESOLUTION":
      return { ...state, resolution: action.value };
    case "SET_CODEC":
      return { ...state, codec: action.value };
    case "SET_OTHER":
      return { ...state, other: action.value };
    case "SET_SORT":
      return { ...state, sortBy: action.value };
    case "TOGGLE_SORT_DIR":
      return {
        ...state,
        sortDirection:
          state.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
      };
  }
}

const initialState: FilterState = {
  resolution: [],
  codec: [],
  other: [],
  sortBy: SortBy.SEEDERS,
  sortDirection: SortDirection.DESC,
};

function toFilterState(settingsData: UserSettings | undefined): FilterState {
  if (!settingsData) {
    return initialState;
  }

  return {
    resolution: settingsData.resolutionFilters,
    codec: settingsData.codecFilters,
    other: settingsData.otherFilters,
    sortBy: settingsData.sortBy,
    sortDirection: settingsData.sortDirection,
  };
}

export function useSearchFilters(settingsData: UserSettings | undefined) {
  const [state, dispatch] = useReducer(reducer, settingsData, toFilterState);
  const prevSettingsRef = useRef(settingsData);

  useEffect(() => {
    if (!settingsData || settingsData === prevSettingsRef.current) {
      return;
    }

    prevSettingsRef.current = settingsData;
    dispatch({ type: "SYNC_SETTINGS", settings: settingsData });
  }, [settingsData]);

  return { filters: state, dispatch };
}
