import api from "@/shared/api/axios.js";

export interface Department {
  id: string;
  name: string;
}

export async function fetchDepartments(portalId: string): Promise<Department[]> {
  const { data } = await api.get<{ departments: Department[] }>("/departments", { params: { portalId } });
  return data.departments;
}
