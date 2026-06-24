import prisma from "../config/db.js";

export async function getOrCreateProjectRoom(projectId: string): Promise<string> {
  const existing = await prisma.room.findFirst({
    where: { projectId, type: "group" },
  });
  if (existing) return existing.id;

  const room = await prisma.room.create({
    data: { projectId, type: "group", name: "Project Chat" },
  });
  return room.id;
}

export async function getRoomByProject(projectId: string) {
  const room = await prisma.room.findFirst({
    where: { projectId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
    },
  });
  return room;
}

export async function getMessages(roomId: string) {
  return prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}

export async function sendMessage(roomId: string, userId: string, text: string) {
  return prisma.chatMessage.create({
    data: { roomId, userId, text },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}

export async function joinRoom(roomId: string, userId: string) {
  const existing = await prisma.userRoom.findUnique({
    where: { userId_roomId: { userId, roomId } },
  });
  if (existing) return existing;
  return prisma.userRoom.create({
    data: { userId, roomId },
  });
}
