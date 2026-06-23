import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Card,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import {
  useSearchPortals,
  useCreateJoinRequest,
  useMyJoinRequest,
  useCancelJoinRequest,
} from "@/features/portal/model/usePortals.js";

export default function JoinPortalPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [message, setMessage] = useState("");

  const { data: portals } = useSearchPortals(query);
  const { data: myRequest, refetch } = useMyJoinRequest(selected?.id ?? "");
  const createRequest = useCreateJoinRequest();
  const cancelRequest = useCancelJoinRequest();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRequest = async () => {
    if (!selected) return;
    await createRequest.mutateAsync({ portalId: selected.id, message });
    refetch();
  };

  const handleCancel = async () => {
    if (!selected) return;
    await cancelRequest.mutateAsync(selected.id);
    refetch();
  };

  return (
    <Box p="6" maxW="700px" mx="auto">
      <Button variant="ghost" onClick={() => navigate("/")} mb="4">
        ← К порталам
      </Button>
      <Heading mb="4">Вступить в портал</Heading>

      <form onSubmit={handleSearch}>
        <Stack direction="row" gap="2" mb="6">
          <Input
            placeholder="Введите slug или название портала"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" colorScheme="blue">Найти</Button>
        </Stack>
      </form>

      <Stack gap="3" mb="6">
        {portals?.map((portal) => (
          <Card.Root
            key={portal.id}
            p="4"
            cursor="pointer"
            onClick={() => {
              setSelected(portal);
              setMessage("");
            }}
            borderWidth={selected?.id === portal.id ? "2px" : "1px"}
            borderColor={selected?.id === portal.id ? "blue.400" : undefined}
          >
            <Card.Body>
              <Heading size="md">{portal.name}</Heading>
              <Text color="gray.500">/{portal.slug}</Text>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>

      <Dialog.Root open={!!selected} onOpenChange={(e) => !e.open && setSelected(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Запрос на вступление в {selected?.name}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {myRequest?.status === "pending" ? (
                  <Stack gap="4">
                    <Text color="green.500">Запрос отправлен! Ожидайте подтверждения администратора.</Text>
                    <Button colorScheme="red" variant="outline" loading={cancelRequest.isPending} onClick={handleCancel}>
                      Отменить запрос
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="4">
                    <Text>Напишите короткое сообщение администратору:</Text>
                    <Input
                      placeholder="Например, я представляю компанию..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                      colorScheme="blue"
                      loading={createRequest.isPending}
                      onClick={handleRequest}
                    >
                      {myRequest?.status === "rejected" ? "Отправить запрос повторно" : "Отправить запрос"}
                    </Button>
                  </Stack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
