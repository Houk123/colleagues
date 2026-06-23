import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  { name: "portal_admin", scope: "portal" as const },
  { name: "owner", scope: "client" as const },
  { name: "client_manager", scope: "client" as const },
  { name: "project_manager", scope: "worker" as const },
  { name: "executor", scope: "worker" as const },
];

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("Seeded roles");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
