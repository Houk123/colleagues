"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Heading,
  Stack,
  Text,
  Badge,
  Flex,
  Dialog,
  Portal,
  Input,
  NativeSelect,
  Textarea,
  HStack,
} from "@chakra-ui/react";
import { useTasks, useCreateTask } from "@/features/task/model/useTasks";
import { useProjectStatuses } from "@/features/task/model/useTaskStatuses";
import { useProjectBySlug } from "@/features/project/model/useProjects";
import { usePortalUsers } from "@/features/user/model/useUserManagement";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { FiPlus, FiArrowLeft } from "react-icons/fi";

const PRIORITY_COLORS: Record<string, string> = {
  low: "#9ca3af",
  medium: "#3b82f6",
  high: "#f97316",
  critical: "#ef4444",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критичный",
};

export default function TasksBoardPage({
  portalSlug,
  orgSlug,
  projectSlug,
}: {
  portalSlug: string;
  orgSlug: string;
  projectSlug: string;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("");

  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug),
  });

  const { data: project } = useProjectBySlug(portal?.id ?? "", projectSlug);
  const { data: tasks } = useTasks(project?.id ?? "");
  const { data: statuses } = useProjectStatuses(project?.id ?? "");
  const { data: users } = usePortalUsers(portal?.id ?? "");
  const createTask = useCreateTask();

  const projectPath = `/portals/${portalSlug}/organizations/${orgSlug}/projects/${projectSlug}`;

  const handleCreate = async () => {
    if (!title || !project) return;
    await createTask.mutateAsync({
      projectId: project.id,
      title,
      description: description || undefined,
      priority: priority as "low" | "medium" | "high" | "critical",
      assigneeId: assigneeId || undefined,
      status: status || undefined,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setStatus("");
    setCreateOpen(false);
  };

  if (!project || !statuses) return <Text p="6">Загрузка...</Text>;

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Box bg="white" borderBottomWidth="1px" borderColor="gray.200" px="6" py="4">
        <Breadcrumbs />
        <Flex justify="space-between" align="center" mt="3">
          <HStack gap="4">
            <Button variant="ghost" size="sm" onClick={() => router.push(projectPath)}>
              <FiArrowLeft /> К проекту
            </Button>
            <Heading size="lg">{project.name} — Задачи</Heading>
          </HStack>
          <Button colorPalette="blue" onClick={() => setCreateOpen(true)}>
            <FiPlus /> Создать задачу
          </Button>
        </Flex>
        <Text color="gray.500" fontSize="sm" mt="1">
          {tasks?.length ?? 0} задач · {statuses.length} статусов
        </Text>
      </Box>

      <Box flex="1" overflow="hidden">
        <Box overflowX="auto" h="full" px="6" py="4">
          <Flex gap="4" alignItems="start" h="full" minW="fit-content">
            {statuses.map((col) => {
              const colTasks = tasks?.filter((t) => t.status === col.name) ?? [];
              return (
                <Box
                  key={col.id}
                  minW="300px"
                  maxW="300px"
                  h="full"
                  maxH="calc(100vh - 200px)"
                  bg="white"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.200"
                  display="flex"
                  flexDirection="column"
                >
                  <Flex
                    px="4"
                    py="3"
                    align="center"
                    gap="2"
                    borderBottomWidth="1px"
                    borderColor="gray.100"
                  >
                    <Box w="8px" h="8px" borderRadius="full" bg={col.color} flexShrink={0} />
                    <Text fontWeight="600" fontSize="sm" color="gray.800" flex="1">
                      {col.name}
                    </Text>
                    <Badge variant="subtle" colorPalette="gray" size="sm">
                      {colTasks.length}
                    </Badge>
                  </Flex>

                  <Box
                    overflowY="auto"
                    flex="1"
                    p="3"
                    display="flex"
                    flexDirection="column"
                    gap="2"
                  >
                    {colTasks.map((t) => (
                      <Card.Root
                        key={t.id}
                        p="3"
                        cursor="pointer"
                        borderWidth="1px"
                        _hover={{ borderColor: "blue.300", shadow: "sm" }}
                        onClick={() => router.push(`${projectPath}/tasks/${t.id}`)}
                        transition="all 0.15s"
                      >
                        <Card.Body>
                          <Text fontWeight="500" fontSize="sm" lineClamp={2} mb="2">
                            {t.title}
                          </Text>
                          {t.taskTags.length > 0 && (
                            <Flex gap="1" flexWrap="wrap" mb="2">
                              {t.taskTags.slice(0, 3).map((tt) => (
                                <Badge key={tt.id} size="sm" variant="subtle" colorPalette="purple" fontSize="10px">
                                  {tt.tag.name}
                                </Badge>
                              ))}
                            </Flex>
                          )}
                          <Flex justify="space-between" align="center" mt="1">
                            <Flex align="center" gap="1">
                              <Box w="6px" h="6px" borderRadius="full" bg={PRIORITY_COLORS[t.priority]} />
                              <Text fontSize="10px" color="gray.500">
                                {PRIORITY_LABELS[t.priority]}
                              </Text>
                            </Flex>
                            <Text fontSize="10px" color="gray.400" maxW="100px" truncate>
                              {t.assignee ? t.assignee.name || t.assignee.email : "—"}
                            </Text>
                          </Flex>
                        </Card.Body>
                      </Card.Root>
                    ))}
                    {colTasks.length === 0 && (
                      <Flex
                        h="80px"
                        align="center"
                        justify="center"
                        borderRadius="lg"
                        borderWidth="1px"
                        borderStyle="dashed"
                        borderColor="gray.200"
                      >
                        <Text color="gray.400" fontSize="xs">Нет задач</Text>
                      </Flex>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Box>

      <Dialog.Root open={createOpen} onOpenChange={(e) => setCreateOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Новая задача</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Box>
                    <Text mb="1" fontWeight="500">Название</Text>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" />
                  </Box>
                  <Box>
                    <Text mb="1" fontWeight="500">Описание</Text>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Подробности..." />
                  </Box>
                  <Flex gap="4">
                    <Box flex="1">
                      <Text mb="1" fontWeight="500">Статус</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={status} onChange={(e) => setStatus(e.target.value)}>
                          <option value="">По умолчанию</option>
                          {statuses.map((s) => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                    <Box flex="1">
                      <Text mb="1" fontWeight="500">Приоритет</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={priority} onChange={(e) => setPriority(e.target.value)}>
                          <option value="low">Низкий</option>
                          <option value="medium">Средний</option>
                          <option value="high">Высокий</option>
                          <option value="critical">Критичный</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  </Flex>
                  <Box>
                    <Text mb="1" fontWeight="500">Исполнитель</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                        <option value="">Не назначен</option>
                        {users?.map((u) => (
                          <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Button colorPalette="blue" loading={createTask.isPending} onClick={handleCreate}>
                    Создать
                  </Button>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}
