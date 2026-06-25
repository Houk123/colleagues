import { useState, useEffect, useRef } from "react";
import { Box, Stack, Text, Input, Button, Card } from "@chakra-ui/react";
import { useMessages, useSendMessage } from "@/features/chat/model/useChat";
import { useSocket } from "@/shared/hooks/useSocket";
import { useAuthStore } from "@/entities/user/model/authStore";
import type { ChatMessage } from "@/features/chat/api/chatApi";

export default function ProjectChat({ roomId }: { roomId: string }) {
  const { data: messages } = useMessages(roomId);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const socketRef = useSocket(user?.id ?? null);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket && roomId) {
      socket.emit("joinRoom", `room:${roomId}`);
      const handler = (msg: any) => {
        if (msg.roomId === roomId) {
          setLiveMessages((prev) => [...prev, msg as ChatMessage]);
        }
      };
      socket.on("chatMessage", handler);
      return () => {
        socket.off("chatMessage", handler);
        socket.emit("leaveRoom", `room:${roomId}`);
      };
    }
  }, [socketRef, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, liveMessages]);

  const allMessages = [
    ...(messages ?? []),
    ...liveMessages.filter((lm) => !messages?.some((m) => m.id === lm.id)),
  ];

  const handleSend = async () => {
    if (!text) return;
    await sendMessage.mutateAsync({ roomId, text });
    setText("");
  };

  return (
    <Card.Root p="0" h="500px" flexDir="column">
      <Box px="4" py="3" borderBottomWidth="1px">
        <Text fontWeight="bold">Чат проекта</Text>
      </Box>
      <Box ref={scrollRef} flex="1" overflowY="auto" px="4" py="3">
        <Stack gap="3">
          {allMessages.map((msg) => (
            <Box key={msg.id} maxW="80%">
              <Text fontSize="xs" color="gray.500" mb="0">
                {msg.user.name || msg.user.email}
              </Text>
              <Box
                bg={msg.user ? "blue.50" : "gray.50"}
                px="3"
                py="2"
                borderRadius="md"
                borderWidth="1px"
              >
                <Text fontSize="sm">{msg.text}</Text>
              </Box>
            </Box>
          ))}
          {allMessages.length === 0 && (
            <Text color="gray.500" fontSize="sm">Нет сообщений. Начните разговор!</Text>
          )}
        </Stack>
      </Box>
      <Box px="4" py="3" borderTopWidth="1px">
        <Stack direction="row" gap="2">
          <Input
            placeholder="Написать сообщение..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button colorPalette="blue" size="sm" disabled={!text} onClick={handleSend} loading={sendMessage.isPending}>
            Отправить
          </Button>
        </Stack>
      </Box>
    </Card.Root>
  );
}
