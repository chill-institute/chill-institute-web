import { useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";

type FastestPhase = "idle" | "fastest" | "all" | "empty";

type SearchInfo = {
  results: { length: number };
  totalCount: number;
  nonEmptyResolvedCount: number;
  pendingCount: number;
  hasPending: boolean;
};

type Action = { type: "SET_PHASE"; phase: FastestPhase };

function reducer(_state: FastestPhase, action: Action): FastestPhase {
  return action.phase;
}

export function useFastestMode(
  isFastestMode: boolean,
  submittedQuery: string,
  searchState: SearchInfo,
) {
  const [fastestPhase, dispatch] = useReducer(reducer, "idle" as FastestPhase);
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const prevQueryRef = useRef(submittedQuery);

  // Reset phase when query changes
  if (submittedQuery !== prevQueryRef.current) {
    prevQueryRef.current = submittedQuery;
    dispatch({ type: "SET_PHASE", phase: "idle" });
    if (toastIdRef.current !== undefined) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = undefined;
    }
  }

  // Fastest mode transitions
  useEffect(() => {
    if (!isFastestMode || submittedQuery.length === 0) {
      return;
    }

    const { totalCount, nonEmptyResolvedCount, pendingCount } = searchState;
    const allDone = totalCount > 0 && !searchState.hasPending;
    const threshold = Math.min(Math.ceil(totalCount / 2), 3);

    if (fastestPhase === "idle") {
      if (allDone && searchState.results.length === 0) {
        dispatch({ type: "SET_PHASE", phase: "empty" });
      } else if (nonEmptyResolvedCount >= threshold && searchState.results.length > 0) {
        dispatch({ type: "SET_PHASE", phase: "fastest" });
      } else if (allDone && searchState.results.length > 0) {
        dispatch({ type: "SET_PHASE", phase: "all" });
      }
    }

    if (fastestPhase === "fastest") {
      if (allDone) {
        dispatch({ type: "SET_PHASE", phase: "all" });
        if (toastIdRef.current !== undefined) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = undefined;
        }
      } else {
        toastIdRef.current = toast.loading(
          `Fetching more from ${pendingCount} indexer${pendingCount > 1 ? "s" : ""}`,
          {
            id: toastIdRef.current,
            duration: Number.POSITIVE_INFINITY,
            position: "bottom-center",
            action: {
              label: "Update",
              onClick: () => {
                dispatch({ type: "SET_PHASE", phase: "all" });
                toast.dismiss(toastIdRef.current);
                toastIdRef.current = undefined;
              },
            },
          },
        );
      }
    }
  }, [isFastestMode, searchState, submittedQuery, fastestPhase]);

  // Dismiss toast on unmount
  useEffect(() => {
    return () => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  return fastestPhase;
}
