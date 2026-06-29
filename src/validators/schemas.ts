import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.string().min(1).max(50).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const createPortalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().max(1000).optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  portalId: z.string().uuid(),
  description: z.string().max(1000).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  organizationId: z.string().uuid(),
  description: z.string().max(1000).optional(),
});

export const createWorkLogSchema = z.object({
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  serviceId: z.string().uuid(),
  description: z.string().max(1000).optional(),
  time: z.number().int().min(1, "Time must be at least 1 minute"),
  date: z.string(),
  phaseId: z.string().uuid().optional(),
});

export const createInviteSchema = z.object({
  email: z.string().email("Valid email is required"),
  portalId: z.string().uuid(),
  roleId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  expiresInHours: z.number().int().min(1).max(168).optional(),
});

export const createCommentSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
  portalId: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000),
});
