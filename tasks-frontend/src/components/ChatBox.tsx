import { useState, useEffect, useCallback } from "react";
import { Box, Input, Button, HStack, VStack, Text } from "@chakra-ui/react";
import { Avatar } from "@/shared/ui/avatar";
import { useSocket } from "@/shared/hooks/useSocket";
import type { ChatMessage } from "@/shared/types";

const USER_ID_KEY = "userId";

function generateUserId(): string {
  return Math.random().toString(36).substring(7);
}

const ChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [userId] = useState<string | null>(() => {
    let storedUserId = sessionStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = generateUserId();
      sessionStorage.setItem(USER_ID_KEY, storedUserId);
    }
    return storedUserId;
  });
  const socketRef = useSocket(userId);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [socketRef]);

  const sendMessage = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !userId) return;

    const message: ChatMessage = {
      userId,
      text: trimmed,
    };

    socketRef.current?.emit("sendMessage", message);
    setInput("");
  }, [input, userId, socketRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <VStack gap={4} align="stretch">
      <Box h="400px" p={4} borderWidth="1px" borderRadius="lg" overflowY="auto">
        {messages.map((msg, index) => (
          <HStack key={index} gap={2} justify={msg.userId === userId ? "flex-start" : "flex-end"}>
            {msg.userId === userId && <Avatar name="Me" size="sm" />}
            <Box
              bg={msg.userId === userId ? "blue.100" : "green.100"}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              <Text>{msg.text}</Text>
            </Box>
            {msg.userId !== userId && <Avatar name="Other" size="sm" />}
          </HStack>
        ))}
      </Box>

      <HStack gap={2}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
        />
        <Button onClick={sendMessage} colorPalette="teal">
          Send
        </Button>
      </HStack>
    </VStack>
  );
};

export default ChatBox;
