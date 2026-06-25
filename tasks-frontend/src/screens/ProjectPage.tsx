"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Tabs,
  Badge,
  Input,
  NativeSelect,
  Textarea,
} from "@chakra-ui/react";
import { useProjectBySlug, useProjectPhases, useCreatePhase, useProjectServices, useAddProjectService, useProjectTransactions, useCreateTransaction, useAddProjectMember } from "@/features/project/model/useProjects";
import { usePortalServices, useCreatePortalService } from "@/features/portal/model/useServices";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import { usePortalUsers } from "@/features/user/model/useUserManagement";
import { useRoles } from "@/features/role/model/useRoles";
import { useTasks, useCreateTask, useUpdateTaskStatus, useComments, useCreateComment } from "@/features/task/model/useTasks";
import { useWorkLogsByTask } from "@/features/workLog/model/useWorkLogs";
import WorkLogForm from "@/features/workLog/ui/WorkLogForm";
import { useAttachmentsByTask, useCreateAttachment } from "@/features/attachment/model/useAttachments";
import { useProjectStatistics } from "@/features/statistics/model/useStatistics";
import { useAuthStore } from "@/entities/user/model/authStore";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { useSocket } from "@/shared/hooks/useSocket";

export default function ProjectPage({ portalSlug, orgSlug, projectSlug }: { portalSlug: string; orgSlug: string; projectSlug: string }) {
  const router = useRouter();

  const [phaseOpen, setPhaseOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [portalServiceOpen, setPortalServiceOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRoleId, setMemberRoleId] = useState("");

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [selectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug!),
    enabled: !!portalSlug,
  });

  const { data: project } = useProjectBySlug(portal?.id ?? "", projectSlug);
  const projectId = project?.id ?? "";

  const { data: phases } = useProjectPhases(projectId);
  const { data: projectServices } = useProjectServices(projectId);
  const { data: transactions } = useProjectTransactions(projectId);
  const { data: portalServices } = usePortalServices(portal?.id ?? "");

  const createPhase = useCreatePhase();
  const addProjectService = useAddProjectService();
  const createPortalService = useCreatePortalService();
  const createTransaction = useCreateTransaction();
  const addMember = useAddProjectMember();
  const { data: portalUsers } = usePortalUsers(portal?.id ?? "");
  const { data: allRoles } = useRoles();

  const { data: tasks } = useTasks(projectId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const { data: taskComments } = useComments(selectedTaskId ?? "");
  const createComment = useCreateComment();
  const { data: taskWorkLogs } = useWorkLogsByTask(selectedTaskId ?? "");
  const createAttachment = useCreateAttachment();
  const { data: taskAttachments } = useAttachmentsByTask(selectedTaskId ?? "");
  const { data: projectStats } = useProjectStatistics(projectId);

  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const socketRef = useSocket(user?.id ?? null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !projectId) return;

    socket.emit("joinProject", projectId);

    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    };
    const handleTaskUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    };
    const handleTaskDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    };
    const handleCommentCreated = () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    };

    socket.on("taskCreated", handleTaskCreated);
    socket.on("taskUpdated", handleTaskUpdated);
    socket.on("taskDeleted", handleTaskDeleted);
    socket.on("commentCreated", handleCommentCreated);

    return () => {
      socket.emit("leaveProject", projectId);
      socket.off("taskCreated", handleTaskCreated);
      socket.off("taskUpdated", handleTaskUpdated);
      socket.off("taskDeleted", handleTaskDeleted);
      socket.off("commentCreated", handleCommentCreated);
    };
  }, [socketRef, projectId, queryClient]);

  if (!portalSlug || !orgSlug || !projectSlug) {
    router.replace("/");
    return null;
  }

  const balance = project?.wallet?.balance ? Number(project.wallet.balance) : 0;
  const isNegative = balance < 0;

  return (
    <Box p="6">
      <Breadcrumbs />
      <Stack direction="row" justify="space-between" align="flex-start" mb="6">
        <Box>
          <Heading mb="1">{project?.name ?? "Загрузка..."}</Heading>
          <Badge colorPalette={project?.status === "active" ? "green" : "gray"} mb="2">
            {project?.status}
          </Badge>
        </Box>
        <Card.Root p="4" minW="240px">
          <Card.Body>
            <Text fontSize="sm" color="gray.500">Кошелёк проекта</Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isNegative ? "red.500" : "green.500"}
            >
              {isNegative ? "−" : ""}
              {Math.abs(balance).toLocaleString("ru-RU")} {project?.wallet?.currency ?? "RUB"}
            </Text>
            {isNegative && (
              <Text color="red.500" fontSize="sm" mt="1">Превышен бюджет</Text>
            )}
          </Card.Body>
        </Card.Root>
      </Stack>

      <Card.Root p="4" mb="6">
        <Card.Body>
          <Stack direction="row" justify="space-between" align="center" mb="3">
            <Heading size="md">Участники проекта</Heading>
            <Button size="sm" colorPalette="green" onClick={() => setMemberOpen(true)}>
              + Добавить участника
            </Button>
          </Stack>
          <Stack gap="2">
            {project?.userProjects.map((up) => (
              <Stack key={up.id} direction="row" justify="space-between" align="center">
                <Text>
                  {up.user.name || up.user.email} <Text as="span" color="gray.500">({up.user.email})</Text>
                </Text>
                <Badge colorPalette="blue">{up.role.name}</Badge>
              </Stack>
            ))}
          </Stack>
          {!project?.userProjects.length && <Text color="gray.500">Нет участников.</Text>}
        </Card.Body>
      </Card.Root>

      <Tabs.Root defaultValue="phases">
        <Tabs.List>
          <Tabs.Trigger value="tasks">Задачи</Tabs.Trigger>
          <Tabs.Trigger value="phases">Фазы</Tabs.Trigger>
          <Tabs.Trigger value="services">Услуги</Tabs.Trigger>
          <Tabs.Trigger value="transactions">Транзакции</Tabs.Trigger>
          <Tabs.Trigger value="statistics">Статистика</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="tasks">
          <Stack gap="4" mt="4">
            <Button onClick={() => setTaskOpen(true)} colorPalette="blue" w="fit-content">
              + Создать задачу
            </Button>
            <KanbanBoard
              tasks={tasks ?? []}
              onTaskClick={(taskId) => {
                router.push(`/portals/${portalSlug}/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`);
              }}
            />
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="phases">
          <Stack gap="4" mt="4">
            <Button onClick={() => setPhaseOpen(true)} colorPalette="blue" w="fit-content">
              + Добавить фазу
            </Button>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
              {phases?.map((phase) => (
                <Card.Root key={phase.id} p="4" borderWidth={phase.isCurrent ? "2px" : "1px"} borderColor={phase.isCurrent ? "blue.400" : undefined}>
                  <Card.Body>
                    <Stack direction="row" justify="space-between" align="center" mb="2">
                      <Heading size="md">{phase.name}</Heading>
                      {phase.isCurrent && <Badge colorPalette="blue">Текущая</Badge>}
                    </Stack>
                    <Text fontSize="sm" color="gray.500">
                      {phase.pricingMode === "fixed_budget"
                        ? `Бюджет: ${phase.budgetTotal ?? "—"} ${phase.currency} (потрачено: ${phase.spentAmount})`
                        : `Почасовая оплата, ${phase.currency}`}
                    </Text>
                    {phase.paymentMode && (
                      <Text fontSize="sm" color="gray.500">
                        Оплата: {phase.paymentMode === "installments" ? `частями по ${phase.installmentAmount}` : "полностью"}
                      </Text>
                    )}
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
            {!phases?.length && <Text color="gray.500">Нет фаз.</Text>}
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="services">
          <Stack gap="4" mt="4">
            <Stack direction="row" gap="2">
              <Button onClick={() => setServiceOpen(true)} colorPalette="blue" w="fit-content">
                + Подключить услугу
              </Button>
              <Button onClick={() => setPortalServiceOpen(true)} colorPalette="gray" variant="outline" w="fit-content">
                + Новая услуга портала
              </Button>
            </Stack>
            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap="4">
              {projectServices?.map((ps) => (
                <Card.Root key={ps.id} p="4">
                  <Card.Body>
                    <Heading size="md" mb="1">{ps.service.name}</Heading>
                    <Text fontSize="sm" color="gray.500">
                      Базовая: {ps.service.pricePerHour} {ps.service.currency}/ч
                    </Text>
                    {ps.customPricePerHour && (
                      <Text fontSize="sm" color="blue.500">
                        Цена проекта: {ps.customPricePerHour} {ps.service.currency}/ч
                      </Text>
                    )}
                    {ps.discountPercent && (
                      <Text fontSize="sm" color="green.500">
                        Скидка: {ps.discountPercent}%
                      </Text>
                    )}
                    {!ps.enabled && <Badge colorPalette="gray" mt="2">Отключена</Badge>}
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
            {!projectServices?.length && <Text color="gray.500">Услуги не подключены.</Text>}
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="transactions">
          <Stack gap="4" mt="4">
            <Button onClick={() => setDepositOpen(true)} colorPalette="green" w="fit-content">
              + Пополнить кошелёк
            </Button>
            <Stack gap="2">
              {transactions?.map((t) => (
                <Card.Root key={t.id} p="3">
                  <Card.Body>
                    <Stack direction="row" justify="space-between">
                      <Text>
                        <Badge colorPalette={t.type === "deposit" ? "green" : t.type === "charge" ? "red" : "gray"}>
                          {t.type}
                        </Badge>
                        {t.description && <Text as="span" ml="2" color="gray.600">{t.description}</Text>}
                      </Text>
                      <Text fontWeight="bold" color={t.type === "charge" ? "red.500" : "green.500"}>
                        {t.type === "charge" ? "−" : "+"}{t.amount}
                      </Text>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              ))}
            </Stack>
            {!transactions?.length && <Text color="gray.500">Нет транзакций.</Text>}
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="statistics">
          <Stack gap="4" mt="4">
            <Stack direction="row" gap="4">
              <Card.Root p="4" flex="1">
                <Card.Body>
                  <Text color="gray.500">Всего потрачено</Text>
                  <Heading size="lg">{projectStats?.totalSpent ?? 0} ₽</Heading>
                </Card.Body>
              </Card.Root>
              <Card.Root p="4" flex="1">
                <Card.Body>
                  <Text color="gray.500">Всего минут</Text>
                  <Heading size="lg">{projectStats?.totalMinutes ?? 0}</Heading>
                </Card.Body>
              </Card.Root>
            </Stack>
            <Heading size="sm">По задачам</Heading>
            <Stack gap="2">
              {projectStats?.taskStats.map((ts) => (
                <Card.Root key={ts.id} p="2">
                  <Card.Body>
                    <Stack direction="row" justify="space-between">
                      <Text fontSize="sm">{ts.task.title}</Text>
                      <Text fontSize="sm">{ts.totalAmount} ₽ / {ts.totalMinutes} мин</Text>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              ))}
              {!projectStats?.taskStats.length && <Text color="gray.500">Нет данных.</Text>}
            </Stack>
          </Stack>
        </Tabs.Content>
      </Tabs.Root>

      {/* Create Phase Dialog */}
      <Dialog.Root open={phaseOpen} onOpenChange={(e) => setPhaseOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Новая фаза</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <PhaseForm
                  projectId={projectId}
                  onSuccess={() => setPhaseOpen(false)}
                  createPhase={createPhase}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Add Project Service Dialog */}
      <Dialog.Root open={serviceOpen} onOpenChange={(e) => setServiceOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Подключить услугу</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <AddServiceForm
                  projectId={projectId}
                  portalServices={portalServices ?? []}
                  onSuccess={() => setServiceOpen(false)}
                  addProjectService={addProjectService}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Create Portal Service Dialog */}
      <Dialog.Root open={portalServiceOpen} onOpenChange={(e) => setPortalServiceOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Новая услуга портала</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <CreatePortalServiceForm
                  portalId={portal?.id ?? ""}
                  onSuccess={() => setPortalServiceOpen(false)}
                  createPortalService={createPortalService}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Deposit Dialog */}
      <Dialog.Root open={depositOpen} onOpenChange={(e) => setDepositOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Пополнить кошелёк</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <DepositForm
                  projectId={projectId}
                  onSuccess={() => setDepositOpen(false)}
                  createTransaction={createTransaction}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={memberOpen} onOpenChange={(e) => setMemberOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Добавить участника</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Box>
                    <Text mb="1" fontWeight="bold">Пользователь</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}>
                        <option value="">Выберите пользователя</option>
                        {portalUsers
                          ?.filter((u) => !project?.userProjects.some((up) => up.userId === u.id))
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name || u.email} ({u.email})
                            </option>
                          ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <Text mb="1" fontWeight="bold">Роль в проекте</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={memberRoleId} onChange={(e) => setMemberRoleId(e.target.value)}>
                        <option value="">Выберите роль</option>
                        {allRoles?.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Button
                    colorPalette="green"
                    loading={addMember.isPending}
                    disabled={!memberUserId || !memberRoleId}
                    onClick={async () => {
                      await addMember.mutateAsync({
                        projectId,
                        userId: memberUserId,
                        roleId: memberRoleId,
                      });
                      setMemberOpen(false);
                      setMemberUserId("");
                      setMemberRoleId("");
                    }}
                  >
                    Добавить
                  </Button>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Create Task Dialog */}
      <Dialog.Root open={taskOpen} onOpenChange={(e) => setTaskOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Создать задачу</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newTaskTitle || !projectId) return;
                    await createTask.mutateAsync({
                      projectId,
                      title: newTaskTitle,
                      description: newTaskDesc || undefined,
                      priority: newTaskPriority,
                      assigneeId: newTaskAssignee || undefined,
                    });
                    setNewTaskTitle("");
                    setNewTaskDesc("");
                    setNewTaskPriority("medium");
                    setNewTaskAssignee("");
                    setTaskOpen(false);
                  }}
                >
                  <Stack gap="4">
                    <Input placeholder="Название" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                    <Textarea placeholder="Описание" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                    <NativeSelect.Root>
                      <NativeSelect.Field value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)}>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="critical">Критический</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}>
                        <option value="">Исполнитель (необязательно)</option>
                        {project?.userProjects.map((up) => (
                          <option key={up.userId} value={up.userId}>{up.user.name || up.user.email}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <Button type="submit" loading={createTask.isPending} colorPalette="blue">Создать</Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Task Detail Dialog */}
      <Dialog.Root open={taskDetailOpen} onOpenChange={(e) => setTaskDetailOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>{tasks?.find((t) => t.id === selectedTaskId)?.title ?? "Задача"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {(() => {
                  const task = tasks?.find((t) => t.id === selectedTaskId);
                  if (!task) return <Text>Загрузка...</Text>;
                  return (
                    <Stack gap="4">
                      <Text color="gray.600">{task.description || "Нет описания"}</Text>
                      <Stack direction="row" gap="2" wrap="wrap">
                        <Badge colorPalette={task.status === "done" ? "green" : task.status === "in_progress" ? "blue" : "gray"}>{task.status}</Badge>
                        <Badge colorPalette={task.priority === "critical" ? "red" : task.priority === "high" ? "orange" : "gray"}>{task.priority}</Badge>
                        {task.assignee && <Text fontSize="sm">Исполнитель: {task.assignee.name || task.assignee.email}</Text>}
                      </Stack>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={task.status}
                          onChange={(e) => updateTaskStatus.mutate({ taskId: task.id, status: e.target.value as any })}
                        >
                          <option value="todo">К выполнению</option>
                          <option value="in_progress">В работе</option>
                          <option value="review">На review</option>
                          <option value="done">Готово</option>
                          <option value="cancelled">Отменено</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                      <Heading size="sm">Трек времени</Heading>
                      {selectedTaskId && projectId && (
                        <WorkLogForm
                          projectId={projectId}
                          taskId={selectedTaskId}
                          serviceOptions={projectServices ?? []}
                        />
                      )}
                      <Stack gap="2" maxH="160px" overflowY="auto">
                        {taskWorkLogs?.map((wl) => (
                          <Card.Root key={wl.id} p="2">
                            <Card.Body>
                              <Stack direction="row" justify="space-between">
                                <Text fontSize="sm">{wl.user.name || wl.user.email} — {(wl.time / 60).toFixed(2)} ч</Text>
                                <Text fontSize="sm" color="green.600">{wl.amount ? `−${wl.amount}` : ""}</Text>
                              </Stack>
                              {wl.description && <Text fontSize="xs" color="gray.500">{wl.description}</Text>}
                            </Card.Body>
                          </Card.Root>
                        ))}
                        {!taskWorkLogs?.length && <Text color="gray.500" fontSize="sm">Нет записей.</Text>}
                      </Stack>
                      <Heading size="sm">Комментарии</Heading>
                      <Stack gap="2" maxH="240px" overflowY="auto">
                        {taskComments?.map((c) => (
                          <Card.Root key={c.id} p="2">
                            <Card.Body>
                              <Text fontSize="sm" fontWeight="bold">{c.user.name || c.user.email}</Text>
                              <Text fontSize="sm">{c.text}</Text>
                            </Card.Body>
                          </Card.Root>
                        ))}
                        {!taskComments?.length && <Text color="gray.500" fontSize="sm">Нет комментариев.</Text>}
                      </Stack>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget as HTMLFormElement;
                          const fd = new FormData(form);
                          const text = fd.get("commentText") as string;
                          if (!text || !selectedTaskId) return;
                          await createComment.mutateAsync({ taskId: selectedTaskId, text });
                          form.reset();
                        }}
                      >
                        <Stack direction="row" gap="2">
                          <Input name="commentText" placeholder="Написать комментарий..." required />
                          <Button type="submit" loading={createComment.isPending} size="sm" colorPalette="blue">Отправить</Button>
                        </Stack>
                      </form>
                      <Heading size="sm">Файлы</Heading>
                      <Stack gap="2" maxH="160px" overflowY="auto">
                        {taskAttachments?.map((att) => (
                          <Card.Root key={att.id} p="2">
                            <Card.Body>
                              <Stack direction="row" justify="space-between" align="center">
                                <Text fontSize="sm">
                                  <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{att.fileName}</a>
                                </Text>
                                <Text fontSize="xs" color="gray.500">{att.uploadedBy.name || att.uploadedBy.email}</Text>
                              </Stack>
                            </Card.Body>
                          </Card.Root>
                        ))}
                        {!taskAttachments?.length && <Text color="gray.500" fontSize="sm">Нет файлов.</Text>}
                      </Stack>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!fileUrl || !fileName || !selectedTaskId) return;
                          await createAttachment.mutateAsync({
                            fileName,
                            fileUrl,
                            taskId: selectedTaskId,
                          });
                          setFileUrl("");
                          setFileName("");
                        }}
                      >
                        <Stack gap="2">
                          <Stack direction="row" gap="2">
                            <Input placeholder="Название файла" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
                            <Input placeholder="URL файла" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
                          </Stack>
                          <Button type="submit" loading={createAttachment.isPending} size="sm" colorPalette="blue">Прикрепить файл</Button>
                        </Stack>
                      </form>
                    </Stack>
                  );
                })()}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

function PhaseForm({
  projectId,
  onSuccess,
  createPhase,
}: {
  projectId: string;
  onSuccess: () => void;
  createPhase: ReturnType<typeof useCreatePhase>;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"development" | "support" | "custom">("development");
  const [pricingMode, setPricingMode] = useState<"fixed_budget" | "hourly">("fixed_budget");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [paymentMode, setPaymentMode] = useState<"full" | "installments">("full");
  const [installmentAmount, setInstallmentAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPhase.mutateAsync({
      projectId,
      input: {
        name,
        type,
        pricingMode,
        budgetTotal: budgetTotal ? Number(budgetTotal) : undefined,
        paymentMode,
        installmentAmount: installmentAmount ? Number(installmentAmount) : undefined,
      },
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        <Input placeholder="Название фазы" value={name} onChange={(e) => setName(e.target.value)} required />
        <NativeSelect.Root>
          <NativeSelect.Field value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="development">Разработка</option>
            <option value="support">Поддержка</option>
            <option value="custom">Другое</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root>
          <NativeSelect.Field value={pricingMode} onChange={(e) => setPricingMode(e.target.value as any)}>
            <option value="fixed_budget">Фиксированный бюджет</option>
            <option value="hourly">Почасовая оплата</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
        {pricingMode === "fixed_budget" && (
          <>
            <Input placeholder="Бюджет" type="number" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} />
            <NativeSelect.Root>
              <NativeSelect.Field value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
                <option value="full">Оплата полностью</option>
                <option value="installments">Частями</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
            {paymentMode === "installments" && (
              <Input placeholder="Сумма части" type="number" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} />
            )}
          </>
        )}
        <Button type="submit" loading={createPhase.isPending} colorPalette="blue">Создать</Button>
      </Stack>
    </form>
  );
}

function AddServiceForm({
  projectId,
  portalServices,
  onSuccess,
  addProjectService,
}: {
  projectId: string;
  portalServices: { id: string; name: string; pricePerHour: string; currency: string }[];
  onSuccess: () => void;
  addProjectService: ReturnType<typeof useAddProjectService>;
}) {
  const [serviceId, setServiceId] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProjectService.mutateAsync({
      projectId,
      input: {
        serviceId,
        customPricePerHour: customPrice ? Number(customPrice) : undefined,
        discountPercent: discount ? Number(discount) : undefined,
      },
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        <NativeSelect.Root>
          <NativeSelect.Field value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Выберите услугу</option>
            {portalServices.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.pricePerHour} {s.currency}/ч)</option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
        <Input placeholder="Цена для проекта (необязательно)" type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
        <Input placeholder="Скидка % для проекта (необязательно)" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        <Button type="submit" loading={addProjectService.isPending} colorPalette="blue">Подключить</Button>
      </Stack>
    </form>
  );
}

function CreatePortalServiceForm({
  portalId,
  onSuccess,
  createPortalService,
}: {
  portalId: string;
  onSuccess: () => void;
  createPortalService: ReturnType<typeof useCreatePortalService>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPortalService.mutateAsync({
      portalId,
      input: { name, description, pricePerHour: Number(price) },
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        <Input placeholder="Название услуги" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input placeholder="Цена за час" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <Button type="submit" loading={createPortalService.isPending} colorPalette="blue">Создать</Button>
      </Stack>
    </form>
  );
}

function DepositForm({
  projectId,
  onSuccess,
  createTransaction,
}: {
  projectId: string;
  onSuccess: () => void;
  createTransaction: ReturnType<typeof useCreateTransaction>;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransaction.mutateAsync({
      projectId,
      input: { amount: Number(amount), description, type: "deposit" },
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="4">
        <Input placeholder="Сумма" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" loading={createTransaction.isPending} colorPalette="green">Пополнить</Button>
      </Stack>
    </form>
  );
}

function KanbanBoard({
  tasks,
  onTaskClick,
}: {
  tasks: { id: string; title: string; status: string; priority: string; assignee: { name: string; email: string } | null; taskTags: { tag: { name: string; color: string | null } }[] }[];
  onTaskClick: (taskId: string) => void;
}) {
  const columns: { key: string; label: string; color: string }[] = [
    { key: "todo", label: "К выполнению", color: "gray" },
    { key: "in_progress", label: "В работе", color: "blue" },
    { key: "review", label: "На review", color: "purple" },
    { key: "done", label: "Готово", color: "green" },
  ];

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap="4" alignItems="start">
      {columns.map((col) => (
        <Stack key={col.key} gap="3">
          <Text fontWeight="bold" color={`${col.color}.600`}>{col.label}</Text>
          <Stack gap="2">
            {tasks
              .filter((t) => t.status === col.key)
              .map((t) => (
                <Card.Root
                  key={t.id}
                  p="3"
                  borderWidth="1px"
                  cursor="pointer"
                  _hover={{ shadow: "sm", borderColor: "blue.300" }}
                  onClick={() => onTaskClick(t.id)}
                >
                  <Card.Body>
                    <Text fontWeight="medium" mb="1">{t.title}</Text>
                    <Stack direction="row" gap="1" mb="1">
                      {t.taskTags.map((tt) => (
                        <Badge key={tt.tag.name} size="sm" colorPalette={tt.tag.color ? undefined : "blue"} bg={tt.tag.color ?? undefined}>
                          {tt.tag.name}
                        </Badge>
                      ))}
                    </Stack>
                    <Text fontSize="xs" color="gray.500">
                      {t.assignee ? t.assignee.name || t.assignee.email : "Не назначен"}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
            {tasks.filter((t) => t.status === col.key).length === 0 && (
              <Text color="gray.500" fontSize="sm">Нет задач</Text>
            )}
          </Stack>
        </Stack>
      ))}
    </Grid>
  );
}
