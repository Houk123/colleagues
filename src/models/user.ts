import prisma from "../config/db.js";
import type { User } from "../../shared/types.js";

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return users as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return (user as User) ?? null;
}

export async function createUser(
  email: string,
  name: string,
  type: "client" | "worker" = "worker",
): Promise<User | null> {
  const user = await prisma.user.create({
    data: {
      email,
      name,
      type,
      passwordHash: "",
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return user as User;
}
