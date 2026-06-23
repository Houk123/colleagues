import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPortal,
  fetchPortals,
  searchPortals,
  createJoinRequest,
  getMyJoinRequest,
  cancelJoinRequest,
  fetchJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  type CreatePortalInput,
} from "../api/portalApi.js";

export function usePortals() {
  return useQuery({
    queryKey: ["portals"],
    queryFn: fetchPortals,
  });
}

export function useCreatePortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portals"] });
    },
  });
}

export function useSearchPortals(query: string) {
  return useQuery({
    queryKey: ["portals", "search", query],
    queryFn: () => searchPortals(query),
    enabled: query.length > 1,
  });
}

export function useMyJoinRequest(portalId: string) {
  return useQuery({
    queryKey: ["my-join-request", portalId],
    queryFn: () => getMyJoinRequest(portalId),
    enabled: !!portalId,
  });
}

export function useCreateJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portalId, message }: { portalId: string; message?: string }) =>
      createJoinRequest(portalId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-join-request", variables.portalId] });
    },
  });
}

export function useCancelJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelJoinRequest,
    onSuccess: (_, portalId) => {
      queryClient.invalidateQueries({ queryKey: ["portal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-join-request", portalId] });
    },
  });
}

export function useJoinRequests() {
  return useQuery({
    queryKey: ["portal-requests"],
    queryFn: fetchJoinRequests,
  });
}

export function useAcceptJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      roleId,
      options,
    }: {
      requestId: string;
      roleId: string;
      options?: {
        organizationId?: string;
        departmentId?: string;
        autoCreateOrganization?: boolean;
        organizationName?: string;
      };
    }) => acceptJoinRequest(requestId, roleId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectJoinRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-requests"] });
    },
  });
}

export { type CreatePortalInput };
