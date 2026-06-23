import { prisma } from "../config/db.js";

export interface CreateWorkLogInput {
  userId: string;
  projectId: string;
  taskId?: string;
  serviceId: string;
  description?: string;
  time: number; // minutes
  date: string;
  phaseId?: string;
}

export async function createWorkLog(input: CreateWorkLogInput) {
  return prisma.$transaction(async (tx) => {
    // Resolve effective rate
    const projectService = await tx.projectService.findFirst({
      where: { projectId: input.projectId, serviceId: input.serviceId, enabled: true },
      include: { service: true },
    });

    const service = projectService?.service ?? (await tx.service.findUnique({ where: { id: input.serviceId } }));
    if (!service) throw new Error("Service not found");

    const baseRate = Number(service.pricePerHour);
    const customRate = projectService?.customPricePerHour ? Number(projectService.customPricePerHour) : null;
    const discount = projectService?.discountPercent ? Number(projectService.discountPercent) : 0;

    let ratePerHour = customRate ?? baseRate;
    if (discount) {
      ratePerHour = ratePerHour * (1 - discount / 100);
    }

    const hours = input.time / 60;
    const amount = Math.round(ratePerHour * hours * 100) / 100;

    // Wallet
    const wallet = await tx.walletProject.findUnique({
      where: { projectId: input.projectId },
    });
    if (!wallet) throw new Error("Project wallet not found");

    const workLog = await tx.workLog.create({
      data: {
        userId: input.userId,
        projectId: input.projectId,
        taskId: input.taskId ?? null,
        serviceId: input.serviceId,
        description: input.description,
        time: input.time,
        date: new Date(input.date),
        phaseId: input.phaseId ?? null,
        resolvedRate: ratePerHour,
        amount,
        walletProjectId: wallet.id,
      },
    });

    await tx.transactionProject.create({
      data: {
        walletProjectId: wallet.id,
        workLogId: workLog.id,
        taskId: input.taskId ?? null,
        phaseId: input.phaseId ?? null,
        amount,
        time: input.time,
        type: "charge",
        description: input.description || "Work log charge",
      },
    });

    await tx.walletProject.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    // Monthly statistic
    const now = new Date(input.date);
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await tx.monthlyStatistic.upsert({
      where: {
        projectId_userId_serviceId_year_month: {
          projectId: input.projectId,
          userId: input.userId,
          serviceId: input.serviceId,
          year,
          month,
        },
      },
      update: {
        totalMinutes: { increment: input.time },
        totalAmount: { increment: amount },
        totalTransactions: { increment: 1 },
      },
      create: {
        projectId: input.projectId,
        userId: input.userId,
        serviceId: input.serviceId,
        year,
        month,
        totalMinutes: input.time,
        totalAmount: amount,
        totalTransactions: 1,
        currency: service.currency,
      },
    });

    // Task statistic
    if (input.taskId) {
      await tx.taskStatistic.upsert({
        where: { taskId: input.taskId },
        update: {
          totalMinutes: { increment: input.time },
          totalAmount: { increment: amount },
          totalTransactions: { increment: 1 },
        },
        create: {
          taskId: input.taskId,
          projectId: input.projectId,
          totalMinutes: input.time,
          totalAmount: amount,
          totalTransactions: 1,
          currency: service.currency,
        },
      });
    }

    // Phase spentAmount
    if (input.phaseId) {
      await tx.projectPhase.update({
        where: { id: input.phaseId },
        data: { spentAmount: { increment: amount } },
      });
    }

    return workLog;
  });
}

export async function getWorkLogsByProject(projectId: string) {
  return prisma.workLog.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, pricePerHour: true } },
      task: { select: { id: true, title: true } },
    },
  });
}

export async function getWorkLogsByUser(userId: string) {
  return prisma.workLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
  });
}

export async function getWorkLogsByTask(taskId: string) {
  return prisma.workLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, pricePerHour: true } },
    },
  });
}
