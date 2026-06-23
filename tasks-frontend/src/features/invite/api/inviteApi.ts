import api from "@/shared/api/axios.js";

export interface Invite {
  id: string;
  email: string;
  portalId: string;
  projectId: string | null;
  organizationId: string | null;
  roleId: string;
  status: "pending" | "accepted" | "declined";
  token: string;
  expiresAt: string;
  createdAt: string;
  role: { id: string; name: string };
  invitedBy: { id: string; name: string; email: string };
}

export interface CreateInviteInput {
  email: string;
  portalId: string;
  projectId?: string;
  organizationId?: string;
  roleId: string;
}

export async function createInvite(input: CreateInviteInput): Promise<Invite> {
  const { data } = await api.post<{ invite: Invite }>("/invites", input);
  return data.invite;
}

export async function fetchInvites(portalId: string): Promise<Invite[]> {
  const { data } = await api.get<{ invites: Invite[] }>("/invites", { params: { portalId } });
  return data.invites;
}

export async function acceptInvite(token: string): Promise<Invite> {
  const { data } = await api.post<{ invite: Invite }>(`/invites/${token}/accept`);
  return data.invite;
}
