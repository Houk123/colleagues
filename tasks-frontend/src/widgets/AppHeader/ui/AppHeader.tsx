"use client";

import { useRouter, usePathname } from "next/navigation";
import { Box, HStack, Text, Button, Avatar, Menu, Portal } from "@chakra-ui/react";
import NotificationBell from "@/features/notification/ui/NotificationBell";
import { useLogout } from "@/features/auth/model/useAuth";
import { useAuthStore } from "@/entities/user/model/authStore";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname.startsWith("/invites/");

  if (isAuthPage) return null;

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <HStack
        maxW="1200px"
        mx="auto"
        px="6"
        h="56px"
        justify="space-between"
      >
        <HStack gap="3" cursor="pointer" onClick={() => router.push("/")}>
          <Box
            w="32px"
            h="32px"
            borderRadius="lg"
            bg="blue.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="800"
            fontSize="lg"
          >
            К
          </Box>
          <Text fontSize="1.5rem" fontWeight="800" letterSpacing="-0.03em" color="blue.700">
            Коллеги
          </Text>
        </HStack>

        <HStack gap="3">
          <NotificationBell />
          {user && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" gap="2">
                  <Avatar.Root size="xs" bg="blue.600" color="white">
                    <Avatar.Fallback>
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <Text fontSize="sm" display={{ base: "none", md: "block" }}>
                    {user.name || user.email}
                  </Text>
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="logout" onSelect={() => logout()}>
                      Выйти
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}
