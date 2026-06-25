import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDepartments,
  createDepartment,
  addDepartmentMember,
  type CreateDepartmentInput,
} from "../api/departmentApi";

export function useDepartments(portalId: string) {
  return useQuery({
    queryKey: ["departments", portalId],
    queryFn: () => fetchDepartments(portalId),
    enabled: !!portalId,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["departments", variables.portalId] });
    },
  });
}

export function useAddDepartmentMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, userId, role }: { departmentId: string; userId: string; role?: string }) =>
      addDepartmentMember(departmentId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
