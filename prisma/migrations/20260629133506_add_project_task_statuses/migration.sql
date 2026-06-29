/*
  Warnings:

  - The `status` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[portalId,slug]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PortalRequestStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'todo';

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "project_task_statuses" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#9ca3af',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_task_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "status" "PortalRequestStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_task_statuses_projectId_name_key" ON "project_task_statuses"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "portal_requests_userId_portalId_key" ON "portal_requests"("userId", "portalId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_portalId_slug_key" ON "projects"("portalId", "slug");

-- AddForeignKey
ALTER TABLE "project_task_statuses" ADD CONSTRAINT "project_task_statuses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_requests" ADD CONSTRAINT "portal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_requests" ADD CONSTRAINT "portal_requests_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "portals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
