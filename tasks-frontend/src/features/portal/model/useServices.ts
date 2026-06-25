import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPortalServices, createPortalService, updatePortalService, deletePortalService, type CreateServiceInput } from "../api/serviceApi";

export function usePortalServices(portalId: string) {
  return useQuery({
    queryKey: ["portal-services", portalId],
    queryFn: () => fetchPortalServices(portalId),
    enabled: !!portalId,
  });
}

export function useCreatePortalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portalId, input }: { portalId: string; input: CreateServiceInput }) =>
      createPortalService(portalId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portal-services", variables.portalId] });
    },
  });
}

export function useUpdatePortalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portalId, serviceId, input }: { portalId: string; serviceId: string; input: Partial<CreateServiceInput> }) =>
      updatePortalService(portalId, serviceId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portal-services", variables.portalId] });
    },
  });
}

export function useDeletePortalService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portalId, serviceId }: { portalId: string; serviceId: string }) =>
      deletePortalService(portalId, serviceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["portal-services", variables.portalId] });
    },
  });
}

export { type CreateServiceInput };
