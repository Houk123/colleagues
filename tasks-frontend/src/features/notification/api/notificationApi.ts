import api from "@/shared/api/axios";

export interface Notification {
  id: string;
  userId: string;
  type: "task_assigned" | "comment" | "mention";
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<{ notifications: Notification[] }>("/notifications");
  return data.notifications;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await api.patch("/notifications/mark-all-read");
}
