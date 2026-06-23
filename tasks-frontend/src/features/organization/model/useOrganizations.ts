import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrganization,
  fetchOrganizations,
  type CreateOrganizationInput,
} from "../api/organizationApi.js";

export function useOrganizations(portalId: string) {
  return useQuery({
    queryKey: ["organizations", portalId],
    queryFn: () => fetchOrganizations(portalId),
    enabled: !!portalId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations", variables.portalId] });
    },
  });
}

export { type CreateOrganizationInput };
