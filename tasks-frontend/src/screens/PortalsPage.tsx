"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Grid,
  Heading,
  Stack,
  Text,
  Dialog,
  Portal,
  Container,
  Flex,
  CloseButton,
} from "@chakra-ui/react";
import { usePortals } from "@/features/portal/model/usePortals";
import CreatePortalForm from "@/features/portal/ui/CreatePortalForm";

export default function PortalsPage() {
  const { data: portals, isLoading, error } = usePortals();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Box py="6">
      <Container maxW="1200px" px="6">
        <Stack direction="row" justify="space-between" align="center" mb="8">
          <Heading>Ваши порталы</Heading>
          <Stack direction="row" gap="3">
            <Button onClick={() => setOpen(true)} colorPalette="blue">
              + Создать портал
            </Button>
            <Button onClick={() => router.push("/join-portal")} variant="outline" colorPalette="blue">
              Вступить в портал
            </Button>
            <Button onClick={() => router.push("/portal-requests")} variant="outline">
              Запросы
            </Button>
          </Stack>
        </Stack>

        {isLoading && <Text color="gray.500">Загрузка...</Text>}
        {error && <Text color="red.500">Ошибка загрузки порталов</Text>}

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
          {portals?.map((portal) => (
            <Card.Root
              key={portal.id}
              p="5"
              cursor="pointer"
              _hover={{ borderColor: "blue.400", boxShadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              borderTop="3px solid"
              borderColor="blue.500"
              onClick={() => router.push(`/portals/${portal.slug}`)}
            >
              <Card.Body>
                <Heading size="md" color="blue.700">{portal.name}</Heading>
                <Text color="gray.500" fontSize="sm" mt="1">/{portal.slug}</Text>
                {portal.description && <Text mt="3" color="gray.600" fontSize="sm">{portal.description}</Text>}
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
        {!isLoading && portals?.length === 0 && (
          <Box textAlign="center" py="20">
            <Text color="gray.500" fontSize="lg">У вас пока нет порталов</Text>
            <Text color="gray.500" fontSize="sm" mt="2">Создайте первый или вступите в существующий</Text>
          </Box>
        )}
      </Container>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Создать портал</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <CreatePortalForm onSuccess={() => setOpen(false)} />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
