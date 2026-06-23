import { useQuery } from "@tanstack/react-query";
import { fetchDepartments } from "../api/departmentApi.js";

export function useDepartments(portalId: string) {
  return useQuery({
    queryKey: ["departments", portalId],
    queryFn: () => fetchDepartments(portalId),
    enabled: !!portalId,
  });
}
