import { QueryClient } from "@tanstack/react-query";

import { shouldRetryQueryError } from "./lib/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQueryError,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
      staleTime: 15_000,
      gcTime: 10 * 60 * 1000,
    },
  },
});
