import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortalUser, fetchCreatableRoles, fetchPortalEmployees, fetchPortalClients, fetchUserRoles, assignRole, type PortalUser } from "../api/userManagementApi";

export function useCreatableRoles(portalId: string) {
  return useQuery({
    queryKey: ["creatable-roles", portalId],
    queryFn: () => fetchCreatableRoles(portalId),
    enabled: !!portalId,
  });
}

export function usePortalEmployees(portalId: string) {
  return useQuery({
    queryKey: ["portal-employees", portalId],
    queryFn: () => fetchPortalEmployees(portalId),
    enabled: !!portalId,
  });
}

export function usePortalClients(portalId: string) {
  return useQuery({
    queryKey: ["portal-clients", portalId],
    queryFn: () => fetchPortalClients(portalId),
    enabled: !!portalId,
  });
}

export function usePortalUsers(portalId: string) {
  const { data: employees } = usePortalEmployees(portalId);
  const { data: clients } = usePortalClients(portalId);
  const map = new Map<string, PortalUser>();
  employees?.forEach((u) => map.set(u.id, u));
  clients?.forEach((u) => map.set(u.id, u));
  return { data: Array.from(map.values()) };
}

export function useCreatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPortalUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["portal-employees"] });
      queryClient.invalidateQueries({ queryKey: ["portal-clients"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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
