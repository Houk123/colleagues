import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../api/auditLogApi.js";

export function useAuditLogs(params?: {
  entityType?: string;
  entityId?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
  });
}
