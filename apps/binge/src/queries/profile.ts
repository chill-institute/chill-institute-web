import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function useProfileQuery() {
  const api = useApi();
  const { authToken } = useAuth();
  return useQuery({
    queryKey: ["user-profile", authToken],
    queryFn: ({ signal }) => api.getUserProfile(signal),
    staleTime: Infinity,
  });
}
