import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
  createPortalSchema,
  createOrganizationSchema,
  createProjectSchema,
  createWorkLogSchema,
  createInviteSchema,
  createCommentSchema,
  createTagSchema,
  sendMessageSchema,
} from "../src/validators/schemas.js";

describe("Validation schemas", () => {
  it("createTaskSchema — valid input", () => {
    const result = createTaskSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test task",
    });
    expect(result.success).toBe(true);
  });

  it("createTaskSchema — missing title", () => {
    const result = createTaskSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("createTaskSchema — invalid priority", () => {
    const result = createTaskSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test",
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("updateTaskSchema — partial update", () => {
    const result = updateTaskSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(true);
  });

  it("updateTaskSchema — invalid status", () => {
    const result = updateTaskSchema.safeParse({ status: "blocked" });
    expect(result.success).toBe(false);
  });

  it("createPortalSchema — valid", () => {
    const result = createPortalSchema.safeParse({ name: "My Portal", slug: "my-portal" });
    expect(result.success).toBe(true);
  });

  it("createPortalSchema — invalid slug", () => {
    const result = createPortalSchema.safeParse({ name: "My Portal", slug: "My Portal!" });
    expect(result.success).toBe(false);
  });

  it("createOrganizationSchema — valid", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme",
      portalId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("createProjectSchema — valid", () => {
    const result = createProjectSchema.safeParse({
      name: "Project A",
      slug: "project-a",
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("createWorkLogSchema — valid", () => {
    const result = createWorkLogSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      time: 30,
      date: "2024-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("createWorkLogSchema — time must be positive", () => {
    const result = createWorkLogSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      time: 0,
      date: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("createInviteSchema — invalid email", () => {
    const result = createInviteSchema.safeParse({
      email: "not-an-email",
      portalId: "550e8400-e29b-41d4-a716-446655440000",
      roleId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(false);
  });

  it("createCommentSchema — empty text", () => {
    const result = createCommentSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("createTagSchema — valid", () => {
    const result = createTagSchema.safeParse({
      name: "bug",
      portalId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("sendMessageSchema — empty text", () => {
    const result = sendMessageSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });
});
