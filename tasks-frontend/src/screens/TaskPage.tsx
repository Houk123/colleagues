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
  Badge,
  Input,
  Textarea,
  NativeSelect,
} from "@chakra-ui/react";
import {
  useTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useUpdateTaskAssignee,
  useDeleteTask,
  useComments,
  useCreateComment,
  useTags,
  useAddTagToTask,
  useRemoveTagFromTask,
  useCreateTag,
} from "@/features/task/model/useTasks";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import { useProjectBySlug } from "@/features/project/model/useProjects";
import { usePortalUsers } from "@/features/user/model/useUserManagement";
import { useProjectRoom } from "@/features/chat/model/useChat";
import ProjectChat from "@/features/chat/ui/ProjectChat";
import { useWorkLogsByTask } from "@/features/workLog/model/useWorkLogs";
import WorkLogForm from "@/features/workLog/ui/WorkLogForm";
import { useProjectServices } from "@/features/project/model/useProjects";
import { useAttachmentsByTask, useUploadFile, useDeleteAttachment } from "@/features/attachment/model/useAttachments";
import { useSubscriptions, useSubscribe, useUnsubscribe } from "@/features/subscription/model/useSubscriptions";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

const STATUS_LABELS: Record<string, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
  cancelled: "Отменено",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критичный",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

export default function TaskPage({ portalSlug, orgSlug, projectSlug, taskId }: { portalSlug: string; orgSlug: string; projectSlug: string; taskId: string }) {
  const router = useRouter();

  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug),
    enabled: !!portalSlug,
  });
  const { data: project } = useProjectBySlug(portal?.id ?? "", projectSlug);
  const { data: task, isLoading } = useTask(taskId ?? "");
  const { data: comments } = useComments(taskId ?? "");
  const { data: portalUsers } = usePortalUsers(portal?.id ?? "");
  const { data: tags } = useTags(portal?.id ?? "");
  const { data: room } = useProjectRoom(project?.id ?? "");
  const { data: taskWorkLogs } = useWorkLogsByTask(taskId ?? "");
  const { data: projectServices } = useProjectServices(project?.id ?? "");
  const { data: taskAttachments } = useAttachmentsByTask(taskId ?? "");
  const uploadFile = useUploadFile();
  const deleteAttachment = useDeleteAttachment();
  const { data: subscriptions } = useSubscriptions();
  const subscribeMut = useSubscribe();
  const unsubscribeMut = useUnsubscribe();

  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const updateTaskAssignee = useUpdateTaskAssignee();
  const deleteTask = useDeleteTask();
  const createComment = useCreateComment();
  const addTagToTask = useAddTagToTask();
  const removeTagFromTask = useRemoveTagFromTask();
  const createTag = useCreateTag();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [commentText, setCommentText] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [newTagName, setNewTagName] = useState("");

  if (!portalSlug || !orgSlug || !projectSlug || !taskId) {
    router.replace("/");
    return null;
  }

  if (isLoading || !task) {
    return <Box p="6"><Text>Загрузка задачи...</Text></Box>;
  }

  const backUrl = `/portals/${portalSlug}/organizations/${orgSlug}/projects/${projectSlug}`;

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditPriority(task.priority);
    setEditAssignee(task.assigneeId ?? "");
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    await updateTask.mutateAsync({
      taskId,
      input: {
        title: editTitle,
        description: editDesc,
        priority: editPriority as any,
        assigneeId: editAssignee || null,
      },
    });
    setEditing(false);
  };

  const handleAddComment = async () => {
    if (!commentText) return;
    await createComment.mutateAsync({ taskId, text: commentText });
    setCommentText("");
  };

  const handleAddTag = async () => {
    if (!selectedTagId) return;
    await addTagToTask.mutateAsync({ taskId, tagId: selectedTagId });
    setSelectedTagId("");
  };

  const handleCreateTag = async () => {
    if (!newTagName || !portal) return;
    await createTag.mutateAsync({ portalId: portal.id, name: newTagName });
    setNewTagName("");
  };

  return (
    <Box p="6" maxW="900px" mx="auto">
      <Breadcrumbs />
      <Grid templateColumns="1fr 350px" gap="6" alignItems="start">
        {/* Left column: task details + comments */}
        <Stack gap="4">
          {editing ? (
            <Card.Root p="4">
              <Card.Body>
                <Stack gap="3">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Название" />
                  <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Описание" />
                  <NativeSelect.Root>
                    <NativeSelect.Field value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                      <option value="critical">Критичный</option>
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <NativeSelect.Root>
                    <NativeSelect.Field value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)}>
                      <option value="">Не назначен</option>
                      {portalUsers?.map((u) => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Stack direction="row" gap="2">
                    <Button colorPalette="blue" size="sm" onClick={handleSaveEdit} loading={updateTask.isPending}>
                      Сохранить
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                      Отмена
                    </Button>
                  </Stack>
                </Stack>
              </Card.Body>
            </Card.Root>
          ) : (
            <Card.Root p="4">
              <Card.Body>
                <Heading size="md" mb="2">{task.title}</Heading>
                <Stack direction="row" gap="2" wrap="wrap" mb="3">
                  <Badge colorPalette={PRIORITY_COLORS[task.priority]}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <Badge colorPalette="gray">
                    {STATUS_LABELS[task.status] ?? task.status}
                  </Badge>
                  {task.assignee && (
                    <Text fontSize="sm">👤 {task.assignee.name || task.assignee.email}</Text>
                  )}
                </Stack>
                {task.description ? (
                  <Text color="gray.700" whiteSpace="pre-wrap">{task.description}</Text>
                ) : (
                  <Text color="gray.500" fontSize="sm">Нет описания</Text>
                )}
                <Text fontSize="xs" color="gray.500" mt="3">
                  Автор: {task.author.name || task.author.email}
                </Text>
                <Stack direction="row" gap="2" mt="3">
                  <Button size="sm" variant="outline" onClick={startEdit}>
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    colorPalette="red"
                    variant="outline"
                    onClick={async () => {
                      await deleteTask.mutateAsync(taskId);
                      router.push(backUrl);
                    }}
                  >
                    Удалить
                  </Button>
                </Stack>
              </Card.Body>
            </Card.Root>
          )}

          {/* Tags */}
          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="2" fontSize="sm">Теги</Text>
              <Stack direction="row" gap="2" wrap="wrap" mb="3">
                {task.taskTags.map((tt) => (
                  <Badge
                    key={tt.id}
                    colorPalette="purple"
                    cursor="pointer"
                    onClick={() => removeTagFromTask.mutateAsync({ taskId, tagId: tt.tag.id })}
                  >
                    {tt.tag.name} ×
                  </Badge>
                ))}
                {task.taskTags.length === 0 && <Text fontSize="sm" color="gray.500">Нет тегов</Text>}
              </Stack>
              <Stack direction="row" gap="2" align="end">
                <NativeSelect.Root flex="1">
                  <NativeSelect.Field value={selectedTagId} onChange={(e) => setSelectedTagId(e.target.value)}>
                    <option value="">Выбрать тег</option>
                    {tags?.filter((t) => !task.taskTags.some((tt) => tt.tag.id === t.id)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
                <Button size="sm" colorPalette="purple" disabled={!selectedTagId} onClick={handleAddTag}>+</Button>
              </Stack>
              <Stack direction="row" gap="2" mt="2">
                <Input size="sm" placeholder="Новый тег" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                <Button size="sm" variant="outline" disabled={!newTagName} onClick={handleCreateTag}>Создать</Button>
              </Stack>
            </Card.Body>
          </Card.Root>

          {/* Time tracking */}
          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="3" fontSize="sm">Трек времени</Text>
              {project?.id && (
                <WorkLogForm
                  projectId={project.id}
                  taskId={taskId}
                  serviceOptions={projectServices ?? []}
                />
              )}
              <Stack gap="2" mt="3" maxH="200px" overflowY="auto">
                {taskWorkLogs?.map((wl) => (
                  <Box key={wl.id} p="2" borderRadius="md" bg="gray.50">
                    <Stack direction="row" justify="space-between">
                      <Text fontSize="sm">{wl.user.name || wl.user.email} — {(wl.time / 60).toFixed(2)} ч</Text>
                      <Text fontSize="sm" color="green.600">{wl.amount ? `−${wl.amount}` : ""}</Text>
                    </Stack>
                    {wl.description && <Text fontSize="xs" color="gray.500">{wl.description}</Text>}
                  </Box>
                ))}
                {!taskWorkLogs?.length && <Text color="gray.500" fontSize="sm">Нет записей</Text>}
              </Stack>
            </Card.Body>
          </Card.Root>

          {/* Comments */}
          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="3" fontSize="sm">Комментарии ({comments?.length ?? 0})</Text>
              <Stack gap="3" mb="3">
                {comments?.map((c) => (
                  <Box key={c.id} p="3" borderRadius="md" bg="gray.50">
                    <Text fontSize="sm" fontWeight="medium">
                      {c.user.name || c.user.email}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mt="1">{c.text}</Text>
                  </Box>
                ))}
                {(!comments || comments.length === 0) && (
                  <Text fontSize="sm" color="gray.500">Нет комментариев</Text>
                )}
              </Stack>
              <Stack direction="row" gap="2">
                <Input
                  placeholder="Написать комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button colorPalette="blue" size="sm" disabled={!commentText} onClick={handleAddComment} loading={createComment.isPending}>
                  Отправить
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>

          {/* Attachments */}
          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="3" fontSize="sm">Файлы ({taskAttachments?.length ?? 0})</Text>
              <Stack gap="2" mb="3">
                {taskAttachments?.map((att) => (
                  <Box key={att.id} p="2" borderRadius="md" bg="gray.50">
                    <Stack direction="row" justify="space-between" align="center">
                      <a href={`http://localhost:4000${att.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <Text fontSize="sm" color="blue.500" _hover={{ textDecoration: "underline" }}>
                          📎 {att.fileName}
                        </Text>
                      </a>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => deleteAttachment.mutate({ id: att.id })}
                      >
                        ×
                      </Button>
                    </Stack>
                    <Text fontSize="xs" color="gray.500">
                      {att.uploadedBy.name || att.uploadedBy.email}
                    </Text>
                  </Box>
                ))}
                {(!taskAttachments || taskAttachments.length === 0) && (
                  <Text fontSize="sm" color="gray.500">Нет файлов</Text>
                )}
              </Stack>
              <input
                type="file"
                style={{ display: "none" }}
                id="file-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await uploadFile.mutateAsync({ file, taskId });
                  e.target.value = "";
                }}
              />
              <Button
                size="sm"
                variant="outline"
                colorPalette="blue"
                loading={uploadFile.isPending}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                📁 Загрузить файл
              </Button>
            </Card.Body>
          </Card.Root>
        </Stack>

        {/* Right column: sidebar */}
        <Stack gap="4">
          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="2" fontSize="sm">Статус</Text>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={task.status}
                  onChange={(e) => updateTaskStatus.mutateAsync({ taskId, status: e.target.value as any })}
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Card.Body>
          </Card.Root>

          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="2" fontSize="sm">Отслеживание</Text>
              {subscriptions?.some((s) => s.entityType === "task" && s.entityId === taskId) ? (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  loading={unsubscribeMut.isPending}
                  onClick={() => unsubscribeMut.mutate({ entityType: "task", entityId: taskId })}
                >
                  ★ Отписаться
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="yellow"
                  loading={subscribeMut.isPending}
                  onClick={() => subscribeMut.mutate({ entityType: "task", entityId: taskId })}
                >
                  ☆ Отслеживать
                </Button>
              )}
            </Card.Body>
          </Card.Root>

          <Card.Root p="4">
            <Card.Body>
              <Text fontWeight="bold" mb="2" fontSize="sm">Исполнитель</Text>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={task.assigneeId ?? ""}
                  onChange={(e) => updateTaskAssignee.mutateAsync({ taskId, assigneeId: e.target.value || null })}
                >
                  <option value="">Не назначен</option>
                  {portalUsers?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Card.Body>
          </Card.Root>

          {room?.id && <ProjectChat roomId={room.id} />}
        </Stack>
      </Grid>
    </Box>
  );
}
