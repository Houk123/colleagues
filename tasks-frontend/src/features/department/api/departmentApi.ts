import api from "@/shared/api/axios";

export interface Department {
  id: string;
  name: string;
}

export async function fetchDepartments(portalId: string): Promise<Department[]> {
  const { data } = await api.get<{ departments: Department[] }>("/departments", { params: { portalId } });
  return data.departments;
}

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  managerId?: string;
  portalId: string;
}

export async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  const { data } = await api.post<{ department: Department }>("/departments", input);
  return data.department;
}

export async function addDepartmentMember(departmentId: string, userId: string, role?: string) {
  const { data } = await api.post<{ member: unknown }>(`/departments/${departmentId}/members`, { userId, role });
  return data.member;
}
