import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
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
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "@/features/organization/model/useOrganizations.js";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi.js";
import CreateOrganizationForm from "@/features/organization/ui/CreateOrganizationForm.js";
import CreateUserDialog from "@/features/user/ui/CreateUserDialog.js";

export default function PortalPage() {
  const { portalSlug } = useParams<{ portalSlug: string }>();
  const navigate = useNavigate();
  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const { data: portal, isLoading: portalLoading } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug!),
    enabled: !!portalSlug,
  });

  const { data: organizations, isLoading } = useOrganizations(portal?.id ?? "");

  if (!portalSlug) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box p="6">
      <Button variant="ghost" onClick={() => navigate("/")} mb="4">
        ← Назад к порталам
      </Button>
      <Heading mb="2">
        {portalLoading ? "Загрузка..." : portal?.name ?? "Портал"}
      </Heading>
      <Text color="gray.500" mb="6">
        Клиентские организации. Проекты создаются внутри организации.
      </Text>

      <Stack direction="row" gap="3" mb="6" wrap="wrap">
        <Button onClick={() => setOrgOpen(true)} colorScheme="blue">
          + Добавить организацию
        </Button>
        <Button onClick={() => setUserOpen(true)} colorScheme="green">
          + Создать пользователя
        </Button>
      </Stack>

      {isLoading && <Text>Загрузка...</Text>}

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
        {organizations?.map((org) => (
          <Card.Root
            key={org.id}
            p="4"
            cursor="pointer"
            _hover={{ shadow: "md", borderColor: "blue.400" }}
            borderWidth="1px"
            onClick={() => navigate(`/portals/${portalSlug}/organizations/${org.slug}`)}
          >
            <Card.Body>
              <Heading size="md" mb="1">{org.name}</Heading>
              <Badge colorScheme="gray" mb="2">/{org.slug}</Badge>
              {org.description && (
                <Text color="gray.600" fontSize="sm">{org.description}</Text>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      {!isLoading && organizations?.length === 0 && (
        <Text color="gray.500" mt="4">Пока нет организаций. Добавьте первую.</Text>
      )}

      <Dialog.Root open={orgOpen} onOpenChange={(e) => setOrgOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Добавить организацию</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateOrganizationForm
                  portalId={portal?.id ?? ""}
                  onSuccess={() => setOrgOpen(false)}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <CreateUserDialog
        portalId={portal?.id ?? ""}
        open={userOpen}
        onOpenChange={setUserOpen}
      />
    </Box>
  );
}

