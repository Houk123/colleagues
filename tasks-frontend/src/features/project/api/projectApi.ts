import api from "@/shared/api/axios";

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  role: {
    id: string;
    name: string;
  };
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "archived" | "paused" | "closed";
  portalId: string;
  organizationId: string | null;
  wallet: {
    id: string;
    balance: string;
    currency: string;
  } | null;
  userProjects: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  portalId: string;
  organizationId: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  type: "development" | "support" | "custom";
  pricingMode: "fixed_budget" | "hourly";
  budgetTotal: string | null;
  spentAmount: string;
  paymentMode: "full" | "installments" | null;
  installmentAmount: string | null;
  billingPeriod: string | null;
  currency: string;
  status: "draft" | "active" | "completed" | "cancelled";
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectServiceItem {
  id: string;
  projectId: string;
  serviceId: string;
  enabled: boolean;
  customPricePerHour: string | null;
  discountPercent: string | null;
  service: {
    id: string;
    name: string;
    description: string | null;
    pricePerHour: string;
    currency: string;
  };
}

export interface ProjectTransaction {
  id: string;
  walletProjectId: string;
  workLogId: string | null;
  taskId: string | null;
  phaseId: string | null;
  amount: string;
  time: number | null;
  type: "deposit" | "charge" | "refund" | "adjustment";
  description: string | null;
  createdAt: string;
}

export interface CreatePhaseInput {
  name: string;
  type: "development" | "support" | "custom";
  pricingMode: "fixed_budget" | "hourly";
  budgetTotal?: number;
  paymentMode?: "full" | "installments";
  installmentAmount?: number;
  billingPeriod?: string;
  currency?: string;
}

export interface AddProjectServiceInput {
  serviceId: string;
  customPricePerHour?: number;
  discountPercent?: number;
  enabled?: boolean;
}

export interface CreateTransactionInput {
  amount: number;
  description?: string;
  type: "deposit" | "charge" | "refund" | "adjustment";
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data } = await api.post<{ project: Project }>("/projects", input);
  return data.project;
}

export async function fetchProjects(portalId: string, organizationId?: string): Promise<Project[]> {
  const { data } = await api.get<{ projects: Project[] }>("/projects", {
    params: { portalId, ...(organizationId ? { organizationId } : {}) },
  });
  return data.projects;
}

export async function fetchProjectBySlug(portalId: string, slug: string): Promise<Project> {
  const { data } = await api.get<{ project: Project }>("/projects/by-slug", {
    params: { portalId, slug },
  });
  return data.project;
}

export async function fetchProjectPhases(projectId: string): Promise<ProjectPhase[]> {
  const { data } = await api.get<{ phases: ProjectPhase[] }>(`/projects/${projectId}/phases`);
  return data.phases;
}

export async function createPhase(projectId: string, input: CreatePhaseInput): Promise<ProjectPhase> {
  const { data } = await api.post<{ phase: ProjectPhase }>(`/projects/${projectId}/phases`, input);
  return data.phase;
}

export async function fetchProjectServices(projectId: string): Promise<ProjectServiceItem[]> {
  const { data } = await api.get<{ services: ProjectServiceItem[] }>(`/projects/${projectId}/services`);
  return data.services;
}

export async function addProjectService(projectId: string, input: AddProjectServiceInput): Promise<ProjectServiceItem> {
  const { data } = await api.post<{ service: ProjectServiceItem }>(`/projects/${projectId}/services`, input);
  return data.service;
}

export async function fetchProjectTransactions(projectId: string): Promise<ProjectTransaction[]> {
  const { data } = await api.get<{ transactions: ProjectTransaction[] }>(`/projects/${projectId}/transactions`);
  return data.transactions;
}

export async function createTransaction(projectId: string, input: CreateTransactionInput): Promise<ProjectTransaction> {
  const { data } = await api.post<{ transaction: ProjectTransaction }>(`/projects/${projectId}/transactions`, input);
  return data.transaction;
}

export async function addProjectMember(projectId: string, userId: string, roleId: string): Promise<ProjectMember> {
  const { data } = await api.post<{ member: ProjectMember }>(`/projects/${projectId}/members`, { userId, roleId });
  return data.member;
}
