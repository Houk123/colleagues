import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Heading,
  Stack,
  Text,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useLogout } from "@/features/auth/model/useAuth.js";
import { usePortals } from "@/features/portal/model/usePortals.js";
import CreatePortalForm from "@/features/portal/ui/CreatePortalForm.js";

export default function PortalsPage() {
  const { data: portals, isLoading, error } = usePortals();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Box p="6">
      <Heading mb="4">Порталы</Heading>
      <Stack direction="row" gap="4" mb="6" wrap="wrap">
        <Button onClick={() => setOpen(true)} colorScheme="blue">
          Создать портал
        </Button>
        <Button onClick={() => navigate("/join-portal")} colorScheme="teal" variant="outline">
          Вступить в портал
        </Button>
        <Button onClick={() => navigate("/portal-requests")} colorScheme="purple" variant="outline">
          Запросы на вступление
        </Button>
        <Button onClick={logout} colorScheme="red" variant="outline">
          Выйти
        </Button>
      </Stack>

      {isLoading && <Text>Загрузка...</Text>}
      {error && <Text color="red.500">Ошибка загрузки порталов</Text>}

      <Stack gap="4">
        {portals?.map((portal) => (
          <Card.Root
            key={portal.id}
            p="4"
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            onClick={() => navigate(`/portals/${portal.slug}`)}
          >
            <Card.Body>
              <Heading size="md">{portal.name}</Heading>
              <Text color="gray.500">/{portal.slug}</Text>
              {portal.description && <Text mt="2">{portal.description}</Text>}
            </Card.Body>
          </Card.Root>
        ))}
        {!isLoading && portals?.length === 0 && (
          <Text color="gray.500">У вас пока нет порталов. Создайте первый.</Text>
        )}
      </Stack>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Создать портал</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreatePortalForm onSuccess={() => setOpen(false)} />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost" mt="4">Отмена</Button>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
