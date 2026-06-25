import api from "@/shared/api/axios";

export interface OrganizationUser {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  portalId: string;
  users: OrganizationUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  billingEmail?: string;
  billingAddress?: string;
  portalId: string;
}

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const { data } = await api.post<{ organization: Organization }>("/organizations", input);
  return data.organization;
}

export async function fetchOrganizations(portalId: string): Promise<Organization[]> {
  const { data } = await api.get<{ organizations: Organization[] }>("/organizations", {
    params: { portalId },
  });
  return data.organizations;
}

export async function fetchOrganizationBySlug(portalId: string, slug: string): Promise<Organization> {
  const { data } = await api.get<{ organization: Organization }>("/organizations/by-slug", {
    params: { portalId, slug },
  });
  return data.organization;
}
