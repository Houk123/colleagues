import api from "@/shared/api/axios";

export interface Subscription {
  id: string;
  userId: string;
  entityType: "task" | "project" | "room";
  entityId: string;
  type: "email" | "push" | "socket";
  createdAt: string;
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data } = await api.get<{ subscriptions: Subscription[] }>("/subscriptions");
  return data.subscriptions;
}

export async function subscribe(entityType: string, entityId: string): Promise<Subscription> {
  const { data } = await api.post<{ subscription: Subscription }>("/subscriptions", { entityType, entityId });
  return data.subscription;
}

export async function unsubscribe(entityType: string, entityId: string): Promise<void> {
  await api.delete("/subscriptions", { data: { entityType, entityId } });
}
