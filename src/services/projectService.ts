import prisma from "../config/db.js";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  portalId: string;
  organizationId: string;
}

export async function createProject(input: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    let baseSlug = slugify(input.name) || "project";
    let slug = baseSlug;
    let suffix = 1;
    while (await tx.project.findUnique({ where: { portalId_slug: { portalId: input.portalId, slug } } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const project = await tx.project.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        portalId: input.portalId,
        organizationId: input.organizationId,
      },
    });

    await tx.walletProject.create({
      data: {
        projectId: project.id,
        balance: 0,
        currency: "RUB",
      },
    });

    return project;
  });
}

export async function getProjectsByPortal(portalId: string, organizationId?: string, memberUserId?: string) {
  return prisma.project.findMany({
    where: {
      portalId,
      ...(organizationId ? { organizationId } : {}),
      ...(memberUserId
        ? {
            userProjects: {
              some: { userId: memberUserId },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      _count: { select: { tasks: true, userProjects: true } },
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      organization: true,
      userProjects: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          role: { select: { id: true, name: true } },
        },
      },
      wallet: { select: { id: true, balance: true, currency: true } },
    },
  });
}

export async function getProjectBySlug(portalId: string, slug: string) {
  return prisma.project.findUnique({
    where: { portalId_slug: { portalId, slug } },
    include: {
      organization: true,
      userProjects: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          role: { select: { id: true, name: true } },
        },
      },
      wallet: { select: { id: true, balance: true, currency: true } },
    },
  });
}

export async function addMember(projectId: string, userId: string, roleId: string) {
  const existing = await prisma.userProject.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (existing) {
    throw new Error("User is already a member of this project");
  }

  return prisma.userProject.create({
    data: {
      userId,
      projectId,
      roleId,
    },
  });
}

export async function getProjectPhases(projectId: string) {
  return prisma.projectPhase.findMany({
    where: { projectId },
    orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
    include: { payments: { orderBy: { dueDate: "asc" } } },
  });
}

export interface CreatePhaseInput {
  projectId: string;
  name: string;
  type: "development" | "support" | "custom";
  pricingMode: "fixed_budget" | "hourly";
  budgetTotal?: number;
  paymentMode?: "full" | "installments";
  installmentAmount?: number;
  billingPeriod?: string;
  currency?: string;
}

export async function createPhase(input: CreatePhaseInput) {
  return prisma.projectPhase.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      type: input.type,
      pricingMode: input.pricingMode,
      budgetTotal: input.budgetTotal,
      paymentMode: input.paymentMode,
      installmentAmount: input.installmentAmount,
      billingPeriod: input.billingPeriod,
      currency: input.currency ?? "RUB",
      status: "active",
      isCurrent: true,
    },
  });
}

export async function getProjectServices(projectId: string) {
  return prisma.projectService.findMany({
    where: { projectId },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });
}

export interface AddProjectServiceInput {
  projectId: string;
  serviceId: string;
  customPricePerHour?: number;
  discountPercent?: number;
  enabled?: boolean;
}

export async function addProjectService(input: AddProjectServiceInput) {
  const existing = await prisma.projectService.findUnique({
    where: { projectId_serviceId: { projectId: input.projectId, serviceId: input.serviceId } },
  });
  if (existing) {
    throw new Error("Service is already connected to this project");
  }

  return prisma.projectService.create({
    data: {
      projectId: input.projectId,
      serviceId: input.serviceId,
      enabled: input.enabled ?? true,
      customPricePerHour: input.customPricePerHour,
      discountPercent: input.discountPercent,
    },
    include: { service: true },
  });
}

export async function getProjectTransactions(projectId: string) {
  const wallet = await prisma.walletProject.findUnique({
    where: { projectId },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });
  return wallet?.transactions ?? [];
}

export interface CreateTransactionInput {
  projectId: string;
  amount: number;
  description?: string;
  type: "deposit" | "charge" | "refund" | "adjustment";
}

export async function createTransaction(input: CreateTransactionInput) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.walletProject.findUnique({
      where: { projectId: input.projectId },
    });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const delta = input.type === "charge" ? -input.amount : input.amount;

    const transaction = await tx.transactionProject.create({
      data: {
        walletProjectId: wallet.id,
        amount: input.amount,
        type: input.type,
        description: input.description,
      },
    });

    await tx.walletProject.update({
      where: { id: wallet.id },
      data: { balance: { increment: delta } },
    });

    return transaction;
  });
}
