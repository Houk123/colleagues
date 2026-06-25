import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { useProjects } from "@/features/project/model/useProjects.js";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi.js";
import { fetchOrganizationBySlug } from "@/features/organization/api/organizationApi.js";
import CreateProjectForm from "@/features/project/ui/CreateProjectForm.js";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

export default function OrganizationPage() {
  const { portalSlug, orgSlug } = useParams<{ portalSlug: string; orgSlug: string }>();
  const navigate = useNavigate();
  const [projectOpen, setProjectOpen] = useState(false);

  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug!),
    enabled: !!portalSlug,
  });

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", portal?.id, orgSlug],
    queryFn: () => fetchOrganizationBySlug(portal!.id, orgSlug!),
    enabled: !!portal?.id && !!orgSlug,
  });

  const { data: projects, isLoading } = useProjects(portal?.id ?? "", organization?.id ?? "");

  if (!portalSlug || !orgSlug) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box p="6">
      <Breadcrumbs />
      <Heading mb="2">
        {orgLoading ? "Загрузка..." : organization?.name ?? "Организация"}
      </Heading>
      <Text color="gray.500" mb="6">
        Проекты внутри организации. Каждый проект — отдельный кошелёк и фазы.
      </Text>

      <Button
        onClick={() => setProjectOpen(true)}
        colorPalette="blue"
        mb="6"
        disabled={!organization?.id}
      >
        + Создать проект
      </Button>

      <Card.Root p="4" mb="6">
        <Card.Body>
          <Heading size="md" mb="3">Участники организации</Heading>
          <Stack gap="2">
            {organization?.users.map((ou) => (
              <Stack key={ou.id} direction="row" justify="space-between" align="center">
                <Text>
                  {ou.user.name || ou.user.email} <Text as="span" color="gray.500">({ou.user.email})</Text>
                </Text>
                <Badge colorPalette={ou.role === "owner" ? "green" : "blue"}>{ou.role}</Badge>
              </Stack>
            ))}
          </Stack>
          {!organization?.users.length && <Text color="gray.500">Нет участников.</Text>}
        </Card.Body>
      </Card.Root>

      {isLoading && <Text>Загрузка...</Text>}

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
        {projects?.map((project) => (
          <Card.Root
            key={project.id}
            p="4"
            cursor="pointer"
            _hover={{ shadow: "md", borderColor: "blue.400" }}
            borderWidth="1px"
            onClick={() =>
              navigate(`/portals/${portalSlug}/organizations/${orgSlug}/projects/${project.slug}`)
            }
          >
            <Card.Body>
              <Heading size="md" mb="1">{project.name}</Heading>
              <Badge
                colorPalette={
                  project.status === "active"
                    ? "green"
                    : project.status === "closed"
                    ? "red"
                    : "gray"
                }
                mb="2"
              >
                {project.status}
              </Badge>
              {project.description && (
                <Text color="gray.600" fontSize="sm">{project.description}</Text>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      {!isLoading && projects?.length === 0 && (
        <Text color="gray.500" mt="4">Нет проектов. Создайте первый.</Text>
      )}

      <Dialog.Root open={projectOpen} onOpenChange={(e) => setProjectOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Создать проект</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateProjectForm
                  portalId={portal?.id ?? ""}
                  organizationId={organization?.id ?? ""}
                  onSuccess={() => setProjectOpen(false)}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
