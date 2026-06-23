import api from "@/shared/api/axios.js";

export interface CreatedUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreatableRole {
  id: string;
  name: string;
  scope: string;
}

export async function createPortalUser(input: {
  email: string;
  name: string;
  password: string;
  portalId: string;
  roleId: string;
  organizationId?: string;
  departmentId?: string;
  projectAssignments?: { projectId: string; roleId: string }[];
}): Promise<CreatedUser> {
  const { data } = await api.post<{ user: CreatedUser }>("/users/portal", input);
  return data.user;
}

export async function fetchCreatableRoles(portalId: string): Promise<CreatableRole[]> {
  const { data } = await api.get<{ roles: CreatableRole[] }>("/users/creatable-roles", {
    params: { portalId },
  });
  return data.roles;
}

export interface PortalUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export async function fetchPortalUsers(portalId: string): Promise<PortalUser[]> {
  const { data } = await api.get<{ users: PortalUser[] }>("/users/portal", {
    params: { portalId },
  });
  return data.users;
}
