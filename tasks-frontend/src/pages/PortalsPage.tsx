import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import { usePortals } from "@/features/portal/model/usePortals.js";
import CreatePortalForm from "@/features/portal/ui/CreatePortalForm.js";

export default function PortalsPage() {
  const { data: portals, isLoading, error } = usePortals();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Box p="6">
      <Stack direction="row" justify="space-between" align="center" mb="8">
        <Heading>Ваши порталы</Heading>
        <Stack direction="row" gap="3">
          <Button onClick={() => setOpen(true)} colorPalette="blue">
            + Создать портал
          </Button>
          <Button onClick={() => navigate("/join-portal")} variant="outline" colorPalette="blue">
            Вступить в портал
          </Button>
          <Button onClick={() => navigate("/portal-requests")} variant="outline">
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
            onClick={() => navigate(`/portals/${portal.slug}`)}
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
