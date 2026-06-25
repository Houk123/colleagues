import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvite, fetchInvites, acceptInvite, type CreateInviteInput } from "../api/inviteApi";

export function useInvites(portalId: string) {
  return useQuery({
    queryKey: ["invites", portalId],
    queryFn: () => fetchInvites(portalId),
    enabled: !!portalId,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInviteInput) => createInvite(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invites", variables.portalId] });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}
