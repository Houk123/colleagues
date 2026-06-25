"use client";

import { useRouter, usePathname } from "next/navigation";
import { Box, HStack, Text, Button, Menu, Portal } from "@chakra-ui/react";
import NotificationBell from "@/features/notification/ui/NotificationBell";
import { useLogout } from "@/features/auth/model/useAuth";
import { useAuthStore } from "@/entities/user/model/authStore";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "Порталы", href: "/portals" },
];

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="0 1px 2px rgba(0, 0, 0, 0.04)"
    >
      <HStack
        maxW="1200px"
        mx="auto"
        px="6"
        h="56px"
        justify="space-between"
      >
        <HStack gap="8">
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

          {user && (
            <HStack gap="1" display={{ base: "none", md: "flex" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    color={isActive ? "blue.700" : "gray.600"}
                    bg={isActive ? "blue.50" : "transparent"}
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </HStack>
          )}
        </HStack>

        <HStack gap="3">
          {user && <NotificationBell />}
          {user && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button variant="ghost" size="sm" gap="2" px="2">
                  <Box
                    w="8"
                    h="8"
                    borderRadius="full"
                    bg="blue.600"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="700"
                    fontSize="sm"
                  >
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </Box>
                  <Text fontSize="sm" display={{ base: "none", md: "block" }} color="gray.700">
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
