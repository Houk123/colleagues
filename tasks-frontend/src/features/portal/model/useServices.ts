import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPortalServices, createPortalService, type CreateServiceInput } from "../api/serviceApi.js";

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

export { type CreateServiceInput };
