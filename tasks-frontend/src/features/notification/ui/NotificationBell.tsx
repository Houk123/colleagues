import { useEffect } from "react";
import {
  Box,
  Button,
  Badge,
  Stack,
  Text,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../model/useNotifications";
import { useAuthStore } from "@/entities/user/model/authStore";
import { useSocket } from "@/shared/hooks/useSocket";

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const { data: notifications } = useNotifications();
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const socketRef = useSocket(user?.id ?? null);

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
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="ghost" size="sm" px="2" position="relative">
          <BellIcon />
          {!!unreadCount && (
            <Badge colorPalette="red" borderRadius="full" position="absolute" top="0" right="0" fontSize="xs" minW="18px" h="18px" display="flex" alignItems="center" justifyContent="center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="320px" maxW="320px" maxH="400px" overflowY="auto">
            <Box p="3">
              <Stack direction="row" justify="space-between" align="center" mb="3">
                <Text fontWeight="semibold" color="gray.900">Уведомления</Text>
                {!!unreadCount && (
                  <Button size="xs" variant="ghost" onClick={() => markAllAsRead.mutate()}>
                    Прочитать все
                  </Button>
                )}
              </Stack>
              {notifications?.map((n) => (
                <Box
                  key={n.id}
                  p="3"
                  mb="2"
                  borderRadius="md"
                  bg={n.read ? "gray.50" : "blue.50"}
                  cursor="pointer"
                  onClick={() => {
                    if (!n.read) markAsRead.mutate(n.id);
                  }}
                  borderLeft="3px solid"
                  borderColor={n.read ? "gray.200" : "blue.500"}
                >
                  <Text fontWeight="medium" fontSize="sm" color="gray.900">{n.title}</Text>
                  <Text fontSize="xs" color="gray.500" mt="1">{n.body}</Text>
                </Box>
              ))}
              {!notifications?.length && (
                <Text color="gray.500" fontSize="sm" textAlign="center" py="4">Нет уведомлений</Text>
              )}
            </Box>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
