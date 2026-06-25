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

  console.log("Seeded roles + admin user (admin@colleagues.local / password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
