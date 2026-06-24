import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Badge,
  Stack,
  Text,
  Card,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../model/useNotifications.js";
import { useAuthStore } from "@/entities/user/model/authStore.js";
import { useSocket } from "@/shared/hooks/useSocket.js";

export default function NotificationBell() {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const socketRef = useSocket(user?.id ?? null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socketRef, queryClient]);

  return (
    <Box position="relative" ref={ref}>
      <Button variant="ghost" onClick={() => setOpen(!open)} size="sm">
        🔔
        {!!unreadCount && (
          <Badge colorPalette="red" borderRadius="full" position="absolute" top="0" right="0" fontSize="xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
      {open && (
        <Box
          position="absolute"
          right="0"
          mt="2"
          w="320px"
          bg="white"
          borderWidth="1px"
          borderRadius="md"
          shadow="lg"
          zIndex="popover"
          maxH="400px"
          overflowY="auto"
        >
          <Stack p="3" gap="2">
            <Stack direction="row" justify="space-between" align="center">
              <Text fontWeight="bold">Уведомления</Text>
              {!!unreadCount && (
                <Button size="xs" variant="ghost" onClick={() => markAllAsRead.mutate()}>
                  Прочитать все
                </Button>
              )}
            </Stack>
            {notifications?.map((n) => (
              <Card.Root
                key={n.id}
                p="2"
                bg={n.read ? "gray.50" : "blue.50"}
                cursor="pointer"
                onClick={() => {
                  if (!n.read) markAsRead.mutate(n.id);
                }}
              >
                <Card.Body>
                  <Text fontWeight="medium" fontSize="sm">{n.title}</Text>
                  <Text fontSize="xs" color="gray.500">{n.body}</Text>
                </Card.Body>
              </Card.Root>
            ))}
            {!notifications?.length && (
              <Text color="gray.500" fontSize="sm">Нет уведомлений</Text>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
