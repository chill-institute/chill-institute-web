import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import { readCachedIndexers, writeCachedIndexers } from "@/queries/options";

export function useIndexersQuery() {
  const api = useApi();
  return useQuery({
    queryKey: ["indexers"],
    queryFn: async ({ signal }) => {
      const indexers = await api.getIndexers(signal);
      writeCachedIndexers(indexers);
      return indexers;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: readCachedIndexers(),
  });
}
