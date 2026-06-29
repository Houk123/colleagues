import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES = [
  { name: "employee_admin", scope: "worker" as const },
  { name: "employee_manager", scope: "worker" as const },
  { name: "employee_executor", scope: "worker" as const },
  { name: "client_owner", scope: "client" as const },
  { name: "client_worker", scope: "client" as const },
];

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@colleagues.local" },
    update: {},
    create: {
      email: "admin@colleagues.local",
      name: "Администратор",
      passwordHash,
    },
  });

  const projects = await prisma.project.findMany();
  const DEFAULT_STATUSES = [
    { name: "todo",        color: "#9ca3af", order: 0, isDefault: true },
    { name: "in_progress", color: "#3b82f6", order: 1, isDefault: true },
    { name: "review",      color: "#a855f7", order: 2, isDefault: true },
    { name: "done",        color: "#22c55e", order: 3, isDefault: true },
    { name: "cancelled",   color: "#ef4444", order: 4, isDefault: true },
  ];
  for (const project of projects) {
    const existing = await prisma.projectTaskStatus.count({ where: { projectId: project.id } });
    if (existing > 0) continue;
    await prisma.projectTaskStatus.createMany({
      data: DEFAULT_STATUSES.map((s) => ({ ...s, projectId: project.id })),
    });
  }

  console.log("Seeded roles + admin user + project task statuses");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
