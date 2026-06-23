export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: Date;
}

export interface ChatMessage {
  userId: string;
  text: string;
  timestamp?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read?: boolean;
  createdAt?: Date;
}

export interface TaskEventPayload {
  id: string;
  projectId: string;
  status?: string;
  assigneeId?: string | null;
  title?: string;
  priority?: string;
  updatedAt?: string;
}

export interface CommentEventPayload {
  id: string;
  taskId: string;
  text: string;
  userId: string;
  createdAt?: string;
}

export interface ServerToClientEvents {
  receiveMessage: (message: ChatMessage) => void;
  userConnected: (data: { userId: string }) => void;
  userDisconnected: (data: { userId: string }) => void;
  notification: (notification: Notification) => void;
  taskCreated: (payload: TaskEventPayload) => void;
  taskUpdated: (payload: TaskEventPayload) => void;
  taskDeleted: (payload: { id: string; projectId: string }) => void;
  commentCreated: (payload: CommentEventPayload) => void;
}

export interface ClientToServerEvents {
  sendMessage: (message: ChatMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  markNotificationRead: (id: string) => void;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  email: string;
}
