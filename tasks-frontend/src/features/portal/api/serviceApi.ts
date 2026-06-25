import api from "@/shared/api/axios";

export interface PortalService {
  id: string;
  portalId: string;
  name: string;
  description: string | null;
  pricePerHour: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  pricePerHour: number;
  currency?: string;
}

export async function fetchPortalServices(portalId: string): Promise<PortalService[]> {
  const { data } = await api.get<{ services: PortalService[] }>(`/portals/${portalId}/services`);
  return data.services;
}

export async function createPortalService(portalId: string, input: CreateServiceInput): Promise<PortalService> {
  const { data } = await api.post<{ service: PortalService }>(`/portals/${portalId}/services`, input);
  return data.service;
}

export async function updatePortalService(portalId: string, serviceId: string, input: Partial<CreateServiceInput>): Promise<PortalService> {
  const { data } = await api.patch<{ service: PortalService }>(`/portals/${portalId}/services/${serviceId}`, input);
  return data.service;
}

export async function deletePortalService(portalId: string, serviceId: string): Promise<void> {
  await api.delete(`/portals/${portalId}/services/${serviceId}`);
}
