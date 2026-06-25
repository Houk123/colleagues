import api from "@/shared/api/axios";

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export async function fetchAuditLogs(params?: {
  entityType?: string;
  entityId?: string;
  userId?: string;
}): Promise<AuditLog[]> {
  const { data } = await api.get<{ logs: AuditLog[] }>("/audit-logs", { params });
  return data.logs;
}
