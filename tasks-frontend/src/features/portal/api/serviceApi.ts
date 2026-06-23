import api from "@/shared/api/axios.js";

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
