import { PrismaClient, RoleScope } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  { name: "portal_admin", scope: RoleScope.portal },
  { name: "portal_manager", scope: RoleScope.portal },
  { name: "worker_admin", scope: RoleScope.worker },
  { name: "worker_manager", scope: RoleScope.worker },
  { name: "worker_executor", scope: RoleScope.worker },
  { name: "client_project_owner", scope: RoleScope.client },
  { name: "client_project_member", scope: RoleScope.client },
  { name: "client_viewer", scope: RoleScope.client },
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
