import api from "@/shared/api/axios";

export interface Role {
  id: string;
  name: string;
  scope: string;
  permissions: Record<string, unknown> | null;
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<{ roles: Role[] }>("/roles");
  return data.roles;
}
