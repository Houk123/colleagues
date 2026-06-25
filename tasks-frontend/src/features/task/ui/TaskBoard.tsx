import { useState } from "react";
import {
  Box,
  Card,
  Heading,
  Text,
  Badge,
  Stack,
  Button,
  Input,
  Textarea,
  Dialog,
  Portal,
  NativeSelect,
  Grid,
} from "@chakra-ui/react";
import {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask,
  useComments,
  useCreateComment,
  useTags,
  useCreateTag,
  useAddTagToTask,
  useRemoveTagFromTask,
} from "@/features/task/model/useTasks.js";
import { usePortalUsers } from "@/features/user/model/useUserManagement.js";
import type { Task } from "@/features/task/api/taskApi.js";

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "К выполнению", color: "gray" },
  { key: "in_progress", label: "В работе", color: "blue" },
  { key: "review", label: "На проверке", color: "yellow" },
  { key: "done", label: "Готово", color: "green" },
  { key: "cancelled", label: "Отменено", color: "red" },
];

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

export default function TaskBoard({
  projectId,
  portalId,
}: {
  projectId: string;
  portalId: string;
}) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const { data: portalUsers } = usePortalUsers(portalId);
  const { data: tags } = useTags(portalId);
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleCreate = async () => {
    if (!title) return;
    await createTask.mutateAsync({
      projectId,
      title,
      description: description || undefined,
      assigneeId: assigneeId || undefined,
      priority: priority as "low" | "medium" | "high" | "critical",
    });
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority("medium");
    setCreateOpen(false);
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    await updateTaskStatus.mutateAsync({ taskId, status });
  };

  if (isLoading) return <Text>Загрузка задач...</Text>;

  return (
    <Box>
      <Stack direction="row" justify="space-between" align="center" mb="4">
        <Heading size="md">Задачи</Heading>
        <Button colorPalette="blue" onClick={() => setCreateOpen(true)}>
          + Создать задачу
        </Button>
      </Stack>

      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="4">
        {COLUMNS.map((col) => {
          const colTasks = tasks?.filter((t) => t.status === col.key) ?? [];
          return (
            <Box key={col.key}>
              <Stack direction="row" align="center" mb="3">
                <Badge colorPalette={col.color}>{col.label}</Badge>
                <Text fontSize="sm" color="gray.500">({colTasks.length})</Text>
              </Stack>
              <Stack gap="3">
                {colTasks.map((task) => (
                  <Card.Root
                    key={task.id}
                    p="3"
                    cursor="pointer"
                    _hover={{ shadow: "md" }}
                    borderWidth="1px"
                    onClick={() => setDetailTaskId(task.id)}
                  >
                    <Card.Body>
                      <Text fontWeight="medium" mb="1">{task.title}</Text>
                      {task.description && (
                        <Text fontSize="sm" color="gray.600" truncate>{task.description}</Text>
                      )}
                      <Stack direction="row" gap="2" mt="2" wrap="wrap">
                        <Badge colorPalette={PRIORITY_COLORS[task.priority]} fontSize="xs">
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                        {task.assignee && (
                          <Text fontSize="xs" color="gray.500">
                            👤 {task.assignee.name || task.assignee.email}
                          </Text>
                        )}
                        {task.taskTags.map((tt) => (
                          <Badge key={tt.id} colorPalette="purple" fontSize="xs">
                            {tt.tag.name}
                          </Badge>
                        ))}
                        {task.comments && task.comments.length > 0 && (
                          <Text fontSize="xs" color="gray.500">
                            💬 {task.comments.length}
                          </Text>
                        )}
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                ))}
                {colTasks.length === 0 && (
                  <Text fontSize="sm" color="gray.500">Нет задач</Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </Grid>

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
                    <Text mb="1" fontWeight="bold">Название</Text>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" />
                  </Box>
                  <Box>
                    <Text mb="1" fontWeight="bold">Описание</Text>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Подробности..." />
                  </Box>
                  <Box>
                    <Text mb="1" fontWeight="bold">Исполнитель</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                        <option value="">Не назначен</option>
                        {portalUsers?.map((u) => (
                          <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                  <Box>
                    <Text mb="1" fontWeight="bold">Приоритет</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="critical">Критичный</option>
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

      {detailTaskId && (
        <TaskDetailDialog
          taskId={detailTaskId}
          portalId={portalId}
          onClose={() => setDetailTaskId(null)}
          onStatusChange={handleStatusChange}
          onDelete={async (id) => {
            await deleteTask.mutateAsync(id);
            setDetailTaskId(null);
          }}
          availableTags={tags ?? []}
        />
      )}
    </Box>
  );
}

function TaskDetailDialog({
  taskId,
  portalId,
  onClose,
  onStatusChange,
  onDelete,
  availableTags,
}: {
  taskId: string;
  portalId: string;
  onClose: () => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onDelete: (taskId: string) => void;
  availableTags: { id: string; name: string; color: string | null }[];
}) {
  const { data: task, isLoading } = useTask(taskId);
  const { data: comments } = useComments(taskId);
  const { data: portalUsers } = usePortalUsers(portalId);
  const createComment = useCreateComment();
  const updateTask = useUpdateTask();
  const addTagToTask = useAddTagToTask();
  const removeTagFromTask = useRemoveTagFromTask();
  const createTag = useCreateTag();

  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");

  if (isLoading || !task) {
    return (
      <Dialog.Root open onOpenChange={() => onClose()}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Body><Text>Загрузка...</Text></Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  }

  const handleSaveEdit = async () => {
    await updateTask.mutateAsync({
      taskId,
      input: {
        title: editTitle,
        description: editDesc,
        assigneeId: editAssignee || null,
        priority: editPriority as "low" | "medium" | "high" | "critical",
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
    if (!newTagName) return;
    await createTag.mutateAsync({ portalId, name: newTagName });
    setNewTagName("");
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setEditAssignee(task.assigneeId ?? "");
    setEditPriority(task.priority);
    setEditing(true);
  };

  return (
    <Dialog.Root open onOpenChange={() => onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Задача</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                {editing ? (
                  <Stack gap="3">
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Название" />
                    <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Описание" />
                    <NativeSelect.Root>
                      <NativeSelect.Field value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)}>
                        <option value="">Не назначен</option>
                        {portalUsers?.map((u) => (
                          <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="critical">Критичный</option>
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
                ) : (
                  <>
                    <Box>
                      <Heading size="sm">{task.title}</Heading>
                      {task.description && <Text mt="2" color="gray.600">{task.description}</Text>}
                    </Box>
                    <Stack direction="row" gap="2" wrap="wrap">
                      <Badge colorPalette={PRIORITY_COLORS[task.priority]}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.assignee && (
                        <Text fontSize="sm">👤 {task.assignee.name || task.assignee.email}</Text>
                      )}
                      <Text fontSize="sm" color="gray.500">
                        Автор: {task.author.name || task.author.email}
                      </Text>
                    </Stack>

                    <Box>
                      <Text fontWeight="bold" mb="1" fontSize="sm">Статус</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={task.status}
                          onChange={(e) => onStatusChange(taskId, e.target.value as Task["status"])}
                        >
                          {COLUMNS.map((col) => (
                            <option key={col.key} value={col.key}>{col.label}</option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb="1" fontSize="sm">Теги</Text>
                      <Stack direction="row" gap="2" wrap="wrap" mb="2">
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
                            {availableTags
                              .filter((t) => !task.taskTags.some((tt) => tt.tag.id === t.id))
                              .map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                        <Button size="sm" colorPalette="purple" disabled={!selectedTagId} onClick={handleAddTag}>
                          +
                        </Button>
                      </Stack>
                      <Stack direction="row" gap="2" mt="2">
                        <Input
                          size="sm"
                          placeholder="Новый тег"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <Button size="sm" variant="outline" disabled={!newTagName} onClick={handleCreateTag}>
                          Создать тег
                        </Button>
                      </Stack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb="2" fontSize="sm">Комментарии</Text>
                      <Stack gap="2" mb="3">
                        {comments?.map((c) => (
                          <Box key={c.id} p="2" borderRadius="md" bg="gray.50">
                            <Text fontSize="sm" fontWeight="medium">
                              {c.user.name || c.user.email}
                            </Text>
                            <Text fontSize="sm" color="gray.600">{c.text}</Text>
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
                        <Button colorPalette="blue" size="sm" disabled={!commentText} onClick={handleAddComment}>
                          Отправить
                        </Button>
                      </Stack>
                    </Box>

                    <Stack direction="row" gap="2" justify="space-between">
                      <Button size="sm" variant="outline" onClick={startEdit}>
                        Редактировать
                      </Button>
                      <Button size="sm" colorPalette="red" variant="outline" onClick={() => onDelete(taskId)}>
                        Удалить
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
