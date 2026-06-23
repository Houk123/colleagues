import { prisma } from "../config/db.js";

export async function getProjectStatistics(projectId: string) {
  const monthly = await prisma.monthlyStatistic.findMany({
    where: { projectId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { user: { select: { id: true, name: true, email: true } }, service: { select: { id: true, name: true } } },
  });

  const taskStats = await prisma.taskStatistic.findMany({
    where: { projectId },
    orderBy: { totalAmount: "desc" },
    include: { task: { select: { id: true, title: true } } },
  });

  const totalSpent = taskStats.reduce((sum: number, ts: { totalAmount: unknown }) => sum + Number(ts.totalAmount), 0);
  const totalMinutes = taskStats.reduce((sum: number, ts: { totalMinutes: number }) => sum + ts.totalMinutes, 0);

  return { monthly, taskStats, totalSpent, totalMinutes };
}

export async function getTaskStatistics(taskId: string) {
  const stat = await prisma.taskStatistic.findUnique({
    where: { taskId },
    include: { task: { select: { id: true, title: true } } },
  });
  return stat;
}

export async function getUserStatistics(userId: string) {
  const monthly = await prisma.monthlyStatistic.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { project: { select: { id: true, name: true } }, service: { select: { id: true, name: true } } },
  });

  const totalEarned = monthly.reduce((sum: number, m: { totalAmount: unknown }) => sum + Number(m.totalAmount), 0);
  const totalMinutes = monthly.reduce((sum: number, m: { totalMinutes: number }) => sum + m.totalMinutes, 0);

  return { monthly, totalEarned, totalMinutes };
}
