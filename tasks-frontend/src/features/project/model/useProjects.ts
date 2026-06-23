import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  fetchProjects,
  fetchProjectBySlug,
  fetchProjectPhases,
  createPhase,
  fetchProjectServices,
  addProjectService,
  fetchProjectTransactions,
  createTransaction,
  addProjectMember,
  type CreateProjectInput,
  type CreatePhaseInput,
  type AddProjectServiceInput,
  type CreateTransactionInput,
} from "../api/projectApi.js";

export function useProjects(portalId: string, organizationId?: string) {
  return useQuery({
    queryKey: ["projects", portalId, organizationId],
    queryFn: () => fetchProjects(portalId, organizationId),
    enabled: !!portalId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.portalId, variables.organizationId] });
    },
  });
}

export function useProjectBySlug(portalId: string, slug?: string) {
  return useQuery({
    queryKey: ["project", portalId, slug],
    queryFn: () => fetchProjectBySlug(portalId, slug!),
    enabled: !!portalId && !!slug,
  });
}

export function useProjectPhases(projectId: string) {
  return useQuery({
    queryKey: ["phases", projectId],
    queryFn: () => fetchProjectPhases(projectId),
    enabled: !!projectId,
  });
}

export function useCreatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: CreatePhaseInput }) =>
      createPhase(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phases", variables.projectId] });
    },
  });
}

export function useProjectServices(projectId: string) {
  return useQuery({
    queryKey: ["project-services", projectId],
    queryFn: () => fetchProjectServices(projectId),
    enabled: !!projectId,
  });
}

export function useAddProjectService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: AddProjectServiceInput }) =>
      addProjectService(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-services", variables.projectId] });
    },
  });
}

export function useProjectTransactions(projectId: string) {
  return useQuery({
    queryKey: ["transactions", projectId],
    queryFn: () => fetchProjectTransactions(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: CreateTransactionInput }) =>
      createTransaction(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, roleId }: { projectId: string; userId: string; roleId: string }) =>
      addProjectMember(projectId, userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export { type CreateProjectInput, type CreatePhaseInput, type AddProjectServiceInput, type CreateTransactionInput };
