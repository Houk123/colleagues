"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  HStack,
  Flex,
} from "@chakra-ui/react";
import { useProjects } from "@/features/project/model/useProjects";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import { fetchOrganizationBySlug } from "@/features/organization/api/organizationApi";
import CreateProjectForm from "@/features/project/ui/CreateProjectForm";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { FiPlus, FiFolder, FiUsers, FiBriefcase } from "react-icons/fi";

export default function OrganizationPage({ portalSlug, orgSlug }: { portalSlug: string; orgSlug: string }) {
  const router = useRouter();
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
    router.replace("/");
    return null;
  }

  return (
    <Box bg="gray.50" minH="calc(100vh - 56px)" p="6">
      <Box maxW="1200px" mx="auto">
        <Breadcrumbs />

        <Card.Root p="6" mb="6" bg="white" borderWidth="1px" borderColor="gray.100" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
          <Card.Body>
            <Flex direction={{ base: "column", md: "row" }} gap="4" justify="space-between" align={{ base: "flex-start", md: "center" }}>
              <HStack gap="4">
                <Box w="12" h="12" borderRadius="lg" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
                  <Box as={FiBriefcase} color="blue.600" fontSize="24px" />
                </Box>
                <Stack gap="0">
                  <Text color="gray.500" fontSize="sm">Организация</Text>
                  <Heading size="lg" color="gray.900">
                    {orgLoading ? "Загрузка..." : organization?.name ?? "Организация"}
                  </Heading>
                </Stack>
              </HStack>
              <Button
                onClick={() => setProjectOpen(true)}
                colorPalette="blue"
                variant="outline"
                disabled={!organization?.id}
              >
                <FiPlus />
                Создать проект
              </Button>
            </Flex>
            <Text color="gray.500" mt="4" fontSize="sm">
              Проекты внутри организации. Каждый проект — отдельный кошелёк и фазы.
            </Text>
          </Card.Body>
        </Card.Root>

        <Stack gap="6">
          <Box>
            <HStack gap="3" mb="4">
              <Box w="8" h="8" borderRadius="md" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                <Box as={FiFolder} color="gray.600" fontSize="16px" />
              </Box>
              <Heading size="md" color="gray.900">Проекты</Heading>
            </HStack>

            {isLoading && <Text color="gray.500">Загрузка...</Text>}

            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
              {projects?.map((project) => (
                <Card.Root
                  key={project.id}
                  p="5"
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.100"
                  cursor="pointer"
                  boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                  transition="all 0.2s"
                  onClick={() =>
                    router.push(`/portals/${portalSlug}/organizations/${orgSlug}/projects/${project.slug}`)
                  }
                >
                  <Card.Body>
                    <HStack gap="3" mb="3">
                      <Box w="10" h="10" borderRadius="md" bg="green.50" display="flex" alignItems="center" justifyContent="center">
                        <Box as={FiFolder} color="green.600" fontSize="20px" />
                      </Box>
                      <Stack gap="0">
                        <Heading size="md" color="gray.900">{project.name}</Heading>
                        <Text fontSize="xs" color="gray.500">/{project.slug}</Text>
                      </Stack>
                    </HStack>
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
              <Card.Root p="6" bg="white" borderWidth="1px" borderColor="gray.100" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                <Card.Body>
                  <Box textAlign="center">
                    <Text color="gray.500">Нет проектов. Создайте первый.</Text>
                    <Button size="sm" mt="3" colorPalette="blue" variant="outline" onClick={() => setProjectOpen(true)}>
                      <FiPlus /> Создать проект
                    </Button>
                  </Box>
                </Card.Body>
              </Card.Root>
            )}
          </Box>

          <Card.Root p="5" bg="white" borderWidth="1px" borderColor="gray.100" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
            <Card.Body>
              <HStack gap="3" mb="4">
                <Box w="8" h="8" borderRadius="md" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                  <Box as={FiUsers} color="gray.600" fontSize="16px" />
                </Box>
                <Heading size="md" color="gray.900">Участники организации</Heading>
              </HStack>
              <Stack gap="3">
                {organization?.users.map((ou) => (
                  <Card.Root key={ou.id} p="3" bg="gray.50" borderWidth="1px" borderColor="gray.100">
                    <Card.Body>
                      <Flex justify="space-between" align="center">
                        <HStack gap="3">
                          <Box w="8" h="8" borderRadius="full" bg="blue.600" color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="700" fontSize="xs">
                            {(ou.user.name || ou.user.email || "?").charAt(0).toUpperCase()}
                          </Box>
                          <Stack gap="0">
                            <Text fontSize="sm" fontWeight="medium" color="gray.900">{ou.user.name || ou.user.email}</Text>
                            <Text fontSize="xs" color="gray.500">{ou.user.email}</Text>
                          </Stack>
                        </HStack>
                        <Badge colorPalette={ou.role === "owner" ? "green" : "blue"} size="sm">{ou.role}</Badge>
                      </Flex>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Stack>
              {!organization?.users.length && (
                <Box textAlign="center" py="8">
                  <Text color="gray.500">Нет участников.</Text>
                </Box>
              )}
            </Card.Body>
          </Card.Root>
        </Stack>
      </Box>

      <Dialog.Root open={projectOpen} onOpenChange={(e) => setProjectOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Создать проект</Dialog.Title>
                </Flex>
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
