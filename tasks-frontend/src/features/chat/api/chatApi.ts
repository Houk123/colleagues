import api from "@/shared/api/axios";

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
}

export interface Room {
  id: string;
  projectId: string | null;
  type: string;
  name: string | null;
  messages: ChatMessage[];
}

export async function fetchProjectRoom(projectId: string): Promise<Room> {
  const { data } = await api.get<{ room: Room }>("/chat/room", { params: { projectId } });
  return data.room;
}

export async function fetchMessages(roomId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<{ messages: ChatMessage[] }>(`/chat/${roomId}/messages`);
  return data.messages;
}

export async function sendMessage(roomId: string, text: string): Promise<ChatMessage> {
  const { data } = await api.post<{ message: ChatMessage }>(`/chat/${roomId}/messages`, { text });
  return data.message;
}
