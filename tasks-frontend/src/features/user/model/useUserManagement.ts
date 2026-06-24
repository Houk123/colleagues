import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortalUser, fetchCreatableRoles, fetchPortalUsers, fetchUserRoles, assignRole } from "../api/userManagementApi.js";

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

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ["user-roles", userId],
    queryFn: () => fetchUserRoles(userId),
    enabled: !!userId,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: { roleId: string; scope: string; contextId: string } }) =>
      assignRole(userId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-roles", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    },
  });
}
