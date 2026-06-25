"use client";

import { Box, Container, Flex, HStack, Text } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box
      as="footer"
      bg="#0f172a"
      color="slate.400"
      py="10"
      borderTopWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <Container maxW="1200px" px="6">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <HStack gap="2">
            <Box
              w="8"
              h="8"
              borderRadius="md"
              bg="blue.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="800"
            >
              К
            </Box>
            <Text fontWeight="bold" color="white">
              Коллеги
            </Text>
          </HStack>
          <Text fontSize="sm">© 2026 Коллеги. Все права защищены.</Text>
        </Flex>
      </Container>
    </Box>
  );
}
