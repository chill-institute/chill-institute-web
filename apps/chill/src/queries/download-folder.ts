import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";

export function useDownloadFolderQuery() {
  const api = useApi();
  return useQuery({
    queryKey: ["download-folder"],
    queryFn: ({ signal }) => api.getDownloadFolder(signal),
    staleTime: 5 * 60 * 1000,
  });
}
