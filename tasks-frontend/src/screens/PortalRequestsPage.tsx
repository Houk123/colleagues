"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Heading,
  Input,
  Stack,
  Text,
  Dialog,
  Portal,
  NativeSelect,
  Badge,
} from "@chakra-ui/react";
import {
  useJoinRequests,
  useAcceptJoinRequest,
  useRejectJoinRequest,
} from "@/features/portal/model/usePortals";
import { useRoles } from "@/features/role/model/useRoles";
import { useOrganizations } from "@/features/organization/model/useOrganizations";
import { useDepartments } from "@/features/department/model/useDepartments";

const ROLE_LABELS: Record<string, string> = {
  portal_admin: "Администратор портала",
  portal_manager: "Менеджер портала",
  client_project_owner: "Владелец проектов клиента",
  client_project_member: "Участник проектов клиента",
  client_viewer: "Наблюдатель клиента",
  client_manager: "Менеджер клиента",
  worker_admin: "Администратор работников",
  worker_manager: "Менеджер работников",
  worker_executor: "Исполнитель",
  worker: "Работник",
  project_manager: "Менеджер проекта",
  viewer: "Наблюдатель",
};

function getRoleLabel(name: string): string {
  return ROLE_LABELS[name] || name;
}

function isClientRole(name: string): boolean {
  return name.toLowerCase().includes("client");
}

export default function PortalRequestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [roleId, setRoleId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [autoCreateOrg, setAutoCreateOrg] = useState(true);

  const { data: requests, isLoading } = useJoinRequests();
  const { data: roles } = useRoles();
  const accept = useAcceptJoinRequest();
  const reject = useRejectJoinRequest();

  const selectedRequest = requests?.find((r) => r.id === selected);
  const portalId = selectedRequest?.portalId ?? "";
  const { data: organizations } = useOrganizations(portalId);
  const { data: departments } = useDepartments(portalId);

  const selectedRole = roles?.find((r) => r.id === roleId);
  const showAutoCreate = selectedRole ? isClientRole(selectedRole.name) : false;
  const showDepartment = selectedRole ? selectedRole.name.toLowerCase().includes("worker") : false;

  const handleAccept = async () => {
    if (!selected || !roleId) return;
    await accept.mutateAsync({
      requestId: selected,
      roleId,
      options: {
        ...(organizationId ? { organizationId } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(showAutoCreate && autoCreateOrg ? { autoCreateOrganization: true, organizationName } : {}),
      },
    });
    setSelected(null);
    setRoleId("");
    setOrganizationId("");
    setOrganizationName("");
    setDepartmentId("");
    setAutoCreateOrg(true);
  };

  const handleReject = async (id: string) => {
    await reject.mutateAsync(id);
  };

  return (
    <Box p="6">
      <Button variant="ghost" onClick={() => router.push("/")} mb="4">
        ← К порталам
      </Button>
      <Heading mb="4">Запросы на вступление</Heading>

      {isLoading ? (
        <Text>Загрузка...</Text>
      ) : (
        <Stack gap="3">
          {requests?.map((req) => (
            <Card.Root key={req.id} p="4">
              <Card.Body>
                <Stack direction="row" justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{req.user.name || req.user.email}</Text>
                    <Text color="gray.500" fontSize="sm">
                      {req.user.email} · {req.portal.name}
                    </Text>
                    {req.message && (
                      <Text color="gray.600" mt="1" fontSize="sm">
                        {req.message}
                      </Text>
                    )}
                    <Badge colorPalette="yellow" mt="2">{req.status}</Badge>
                  </Box>
                  <Stack direction="row" gap="2">
                    <Button colorPalette="green" onClick={() => setSelected(req.id)}>
                      Принять
                    </Button>
                    <Button colorPalette="red" variant="outline" onClick={() => handleReject(req.id)}>
                      Отклонить
                    </Button>
                  </Stack>
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </Stack>
      )}

      {!isLoading && !requests?.length && (
        <Text color="gray.500">Нет запросов на вступление.</Text>
      )}

      <Dialog.Root open={!!selected} onOpenChange={(e) => !e.open && setSelected(null)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Принять пользователя</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Text>
                    <strong>{selectedRequest?.user.name || selectedRequest?.user.email}</strong> хочет вступить в{" "}
                    <strong>{selectedRequest?.portal.name}</strong>
                  </Text>

                  <Box>
                    <Text mb="1" fontWeight="bold">Роль</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                        <option value="">Выберите роль</option>
                        {roles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {getRoleLabel(role.name)} ({role.scope})
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>

                  {showAutoCreate && (
                    <Stack gap="3">
                      <Box>
                        <Checkbox.Root
                          checked={autoCreateOrg}
                          onCheckedChange={(e) => setAutoCreateOrg(!!e.checked)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>Создать организацию для клиента и сделать его управляющим</Checkbox.Label>
                        </Checkbox.Root>
                      </Box>
                      {autoCreateOrg && (
                        <Box>
                          <Text mb="1" fontWeight="bold">Название организации</Text>
                          <Input
                            placeholder="Например, ООО Ромашка"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                          />
                        </Box>
                      )}
                    </Stack>
                  )}

                  {showAutoCreate && !autoCreateOrg && (
                    <Box>
                      <Text mb="1" fontWeight="bold">Существующая организация</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                          <option value="">Не выбрано</option>
                          {organizations?.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  )}

                  {!showAutoCreate && (
                    <Box>
                      <Text mb="1" fontWeight="bold">Организация</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                          <option value="">Не выбрано</option>
                          {organizations?.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  )}

                  {showDepartment && (
                    <Box>
                      <Text mb="1" fontWeight="bold">Отдел (для работника)</Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                          <option value="">Не выбрано</option>
                          {departments?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Box>
                  )}

                  <Button colorPalette="green" loading={accept.isPending} onClick={handleAccept}>
                    Принять и назначить
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
