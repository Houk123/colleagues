import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortalUser, fetchCreatableRoles, fetchPortalUsers } from "../api/userManagementApi.js";

export function useCreatableRoles(portalId: string) {
  return useQuery({
    queryKey: ["creatable-roles", portalId],
    queryFn: () => fetchCreatableRoles(portalId),
    enabled: !!portalId,
  });
}

export function usePortalUsers(portalId: string) {
  return useQuery({
    queryKey: ["portal-users", portalId],
    queryFn: () => fetchPortalUsers(portalId),
    enabled: !!portalId,
  });
}

export function useCreatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPortalUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    },
  });
}
