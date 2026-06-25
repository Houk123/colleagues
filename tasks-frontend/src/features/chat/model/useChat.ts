import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjectRoom, fetchMessages, sendMessage } from "../api/chatApi";

export function useProjectRoom(projectId: string) {
  return useQuery({
    queryKey: ["chat-room", projectId],
    queryFn: () => fetchProjectRoom(projectId),
    enabled: !!projectId,
  });
}

export function useMessages(roomId: string) {
  return useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: () => fetchMessages(roomId),
    enabled: !!roomId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, text }: { roomId: string; text: string }) => sendMessage(roomId, text),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.roomId] });
    },
  });
}
