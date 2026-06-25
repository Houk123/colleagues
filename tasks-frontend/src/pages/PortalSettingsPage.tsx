import { useState } from "react";
import { useParams } from "react-router-dom";
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
  Tabs,
  NativeSelect,
  Table,
} from "@chakra-ui/react";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi.js";
import { usePortalUsers, useUserRoles, useAssignRole } from "@/features/user/model/useUserManagement.js";
import { useRoles } from "@/features/role/model/useRoles.js";
import { useAuditLogs } from "@/features/auditLog/model/useAuditLogs.js";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

const ACTION_LABELS: Record<string, string> = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
};

const ENTITY_LABELS: Record<string, string> = {
  task: "Задача",
  comment: "Комментарий",
  project: "Проект",
};

export default function PortalSettingsPage() {
  const { portalSlug } = useParams<{ portalSlug: string }>();

  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug!),
    enabled: !!portalSlug,
  });

  if (!portalSlug) return <Text>Портал не найден</Text>;

  return (
    <Box p="6" maxW="900px" mx="auto">
      <Breadcrumbs />
      <Heading size="lg" mb="6">Настройки портала</Heading>

      <Tabs.Root defaultValue="members">
        <Tabs.List>
          <Tabs.Trigger value="members">Участники и роли</Tabs.Trigger>
          <Tabs.Trigger value="audit">Журнал изменений</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="members">
          <MembersTab portalId={portal?.id ?? ""} />
        </Tabs.Content>

        <Tabs.Content value="audit">
          <AuditTab />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

function MembersTab({ portalId }: { portalId: string }) {
  const { data: users } = usePortalUsers(portalId);
  const { data: roles } = useRoles();
  const assignRole = useAssignRole();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!portalId) return <Text>Загрузка...</Text>;

  return (
    <Stack gap="4" mt="4">
      <Text color="gray.500" fontSize="sm">Управление ролями участников портала</Text>
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
        {users?.map((u) => (
          <Card.Root key={u.id} p="4" cursor="pointer"
            borderColor={selectedUserId === u.id ? "blue.400" : undefined}
            borderWidth={selectedUserId === u.id ? "2px" : "1px"}
            onClick={() => setSelectedUserId(u.id)}
          >
            <Card.Body>
              <Text fontWeight="medium">{u.name || u.email}</Text>
              <Text fontSize="sm" color="gray.500">{u.email}</Text>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      {selectedUserId && (
        <RoleManager userId={selectedUserId} portalId={portalId} roles={roles ?? []} assignRole={assignRole} />
      )}
    </Stack>
  );
}

function RoleManager({
  userId,
  portalId,
  roles,
  assignRole,
}: {
  userId: string;
  portalId: string;
  roles: { id: string; name: string }[];
  assignRole: ReturnType<typeof useAssignRole>;
}) {
  const { data: userRoles } = useUserRoles(userId);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const portalRoles = userRoles?.filter((ur) => ur.scope === "portal" && ur.contextId === portalId) ?? [];

  const handleAssign = async () => {
    if (!selectedRoleId) return;
    await assignRole.mutateAsync({
      userId,
      input: { roleId: selectedRoleId, scope: "portal", contextId: portalId },
    });
    setSelectedRoleId("");
  };

  return (
    <Card.Root p="4">
      <Card.Body>
        <Heading size="sm" mb="3">Роли в портале</Heading>
        <Stack gap="2" mb="4">
          {portalRoles.map((ur) => (
            <Badge key={ur.id} colorPalette="blue">{ur.role.name}</Badge>
          ))}
          {portalRoles.length === 0 && <Text fontSize="sm" color="gray.500">Нет ролей</Text>}
        </Stack>
        <Stack direction="row" gap="2" align="end">
          <NativeSelect.Root flex="1">
            <NativeSelect.Field value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
              <option value="">Выбрать роль</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
          <Button colorPalette="blue" size="sm" disabled={!selectedRoleId} onClick={handleAssign} loading={assignRole.isPending}>
            Назначить
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function AuditTab() {
  const { data: logs, isLoading } = useAuditLogs();

  if (isLoading) return <Text mt="4">Загрузка...</Text>;

  return (
    <Stack gap="4" mt="4">
      <Text color="gray.500" fontSize="sm">История изменений</Text>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Действие</Table.ColumnHeader>
            <Table.ColumnHeader>Тип</Table.ColumnHeader>
            <Table.ColumnHeader>Пользователь</Table.ColumnHeader>
            <Table.ColumnHeader>Дата</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {logs?.map((log) => (
            <Table.Row key={log.id}>
              <Table.Cell>
                <Badge colorPalette={log.action === "create" ? "green" : log.action === "delete" ? "red" : "blue"}>
                  {ACTION_LABELS[log.action] ?? log.action}
                </Badge>
              </Table.Cell>
              <Table.Cell>{ENTITY_LABELS[log.entityType] ?? log.entityType}</Table.Cell>
              <Table.Cell>{log.user?.name ?? log.user?.email ?? "—"}</Table.Cell>
              <Table.Cell fontSize="sm" color="gray.500">
                {new Date(log.createdAt).toLocaleString("ru-RU")}
              </Table.Cell>
            </Table.Row>
          ))}
          {(!logs || logs.length === 0) && (
            <Table.Row>
              <Table.Cell colSpan={4}><Text color="gray.500">Нет записей</Text></Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Stack>
  );
}
