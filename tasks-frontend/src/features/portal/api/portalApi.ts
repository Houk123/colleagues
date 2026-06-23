import api from "@/shared/api/axios.js";

export interface Portal {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortalInput {
  name: string;
  slug: string;
  description?: string;
}

export async function createPortal(input: CreatePortalInput): Promise<Portal> {
  const { data } = await api.post<{ portal: Portal }>("/portals", input);
  return data.portal;
}

export async function fetchPortals(): Promise<Portal[]> {
  const { data } = await api.get<{ portals: Portal[] }>("/portals");
  return data.portals;
}

export async function fetchPortal(id: string): Promise<Portal> {
  const { data } = await api.get<{ portal: Portal }>(`/portals/${id}`);
  return data.portal;
}

export async function fetchPortalBySlug(slug: string): Promise<Portal> {
  const { data } = await api.get<{ portal: Portal }>(`/portals/${slug}`);
  return data.portal;
}

export async function searchPortals(query: string): Promise<Portal[]> {
  const { data } = await api.get<{ portals: Portal[] }>("/portals/search", { params: { q: query } });
  return data.portals;
}

export interface PortalRequest {
  id: string;
  userId: string;
  portalId: string;
  status: "pending" | "accepted" | "rejected";
  message: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  portal: { id: string; name: string; slug: string };
}

export async function createJoinRequest(portalId: string, message?: string): Promise<PortalRequest> {
  const { data } = await api.post<{ request: PortalRequest }>(`/portals/${portalId}/join`, { message });
  return data.request;
}

export async function getMyJoinRequest(portalId: string): Promise<PortalRequest | null> {
  const { data } = await api.get<{ request: PortalRequest | null }>(`/portals/${portalId}/join`);
  return data.request;
}

export async function cancelJoinRequest(portalId: string): Promise<PortalRequest> {
  const { data } = await api.delete<{ request: PortalRequest }>(`/portals/${portalId}/join`);
  return data.request;
}

export async function fetchJoinRequests(): Promise<PortalRequest[]> {
  const { data } = await api.get<{ requests: PortalRequest[] }>("/portals/requests");
  return data.requests;
}

export async function acceptJoinRequest(
  requestId: string,
  roleId: string,
  options?: { organizationId?: string; departmentId?: string; autoCreateOrganization?: boolean; organizationName?: string }
): Promise<PortalRequest> {
  const { data } = await api.post<{ request: PortalRequest }>(`/portals/requests/${requestId}/accept`, {
    roleId,
    ...options,
  });
  return data.request;
}

export async function rejectJoinRequest(requestId: string): Promise<PortalRequest> {
  const { data } = await api.post<{ request: PortalRequest }>(`/portals/requests/${requestId}/reject`);
  return data.request;
}
