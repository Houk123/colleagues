import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../api/notificationApi";
import { useAuthStore } from "@/entities/user/model/authStore";

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!token,
  });
}

export function useUnreadCount() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000,
    enabled: !!token,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
