import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Dialog,
  Portal,
  NativeSelect,
} from "@chakra-ui/react";
import { useCreatableRoles, useCreatePortalUser } from "@/features/user/model/useUserManagement";
import { useOrganizations } from "@/features/organization/model/useOrganizations";
import { useDepartments } from "@/features/department/model/useDepartments";
import { useProjects } from "@/features/project/model/useProjects";
import { useRoles } from "@/features/role/model/useRoles";
import { FiX } from "react-icons/fi";

const ROLE_LABELS: Record<string, string> = {
  employee_admin: "Администратор",
  employee_manager: "Менеджер",
  employee_executor: "Исполнитель",
  client_owner: "Владелец",
  client_worker: "Работник",
};

function getRoleLabel(name: string): string {
  return ROLE_LABELS[name] || name;
}

const ALLOWED_ROLES = new Set([
  "employee_admin",
  "employee_manager",
  "employee_executor",
  "client_owner",
  "client_worker",
]);

function isClientRole(name: string): boolean {
  return name.toLowerCase() === "client_owner" || name.toLowerCase() === "client_worker";
}

function isWorkerRole(name: string): boolean {
  return name.toLowerCase().startsWith("employee_");
}

export default function CreateUserDialog({
  portalId,
  open,
  onOpenChange,
  userType,
}: {
  portalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: "employee" | "client";
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [organizationIds, setOrganizationIds] = useState<string[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [clientOrganizationRoles, setClientOrganizationRoles] = useState<{ organizationId: string; roleId: string }[]>([]);
  const [selectedClientOrgId, setSelectedClientOrgId] = useState("");
  const [selectedClientRoleId, setSelectedClientRoleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [projectAssignments, setProjectAssignments] = useState<{ projectId: string; roleId: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectRoleId, setSelectedProjectRoleId] = useState("");

  const { data: roles } = useCreatableRoles(portalId);
  const { data: organizations } = useOrganizations(portalId);
  const { data: departments } = useDepartments(portalId);
  const { data: allRoles } = useRoles();
  const createUser = useCreatePortalUser();

  const filteredRoles = roles?.filter((r) => {
    if (!ALLOWED_ROLES.has(r.name.toLowerCase())) return false;
    if (userType === "client") return isClientRole(r.name);
    if (userType === "employee") return isWorkerRole(r.name);
    return true;
  });

  const isClient = userType === "client";
  const isEmployee = userType === "employee";
  const showDept = isEmployee;
  const showProjects = true;

  const clientOrgIds = isClient
    ? clientOrganizationRoles.map((e) => e.organizationId)
    : organizationIds;
  const { data: allProjects } = useProjects(portalId);
  const projects = allProjects?.filter((p) => clientOrgIds.length > 0 && p.organizationId && clientOrgIds.includes(p.organizationId));

  const reset = () => {
    setEmail("");
    setName("");
    setPassword("");
    setRoleId("");
    setOrganizationIds([]);
    setSelectedOrgId("");
    setClientOrganizationRoles([]);
    setSelectedClientOrgId("");
    setSelectedClientRoleId("");
    setDepartmentId("");
    setProjectAssignments([]);
    setSelectedProjectId("");
    setSelectedProjectRoleId("");
  };

  const handleSubmit = async () => {
    if (!email || !name || !password) return;
    if (!isClient && !roleId) return;
    if (isClient && clientOrganizationRoles.length === 0) return;
    const effectiveRoleId = isClient ? clientOrganizationRoles[0].roleId : roleId;
    await createUser.mutateAsync({
      email,
      name,
      password,
      portalId,
      roleId: effectiveRoleId,
      ...(isClient && clientOrganizationRoles.length > 0 ? { clientOrganizationRoles } : {}),
      ...(!isClient && organizationIds.length > 0 ? { organizationIds } : {}),
      ...(showDept && departmentId ? { departmentId } : {}),
      ...(!isClient && projectAssignments.length > 0 ? { projectAssignments } : {}),
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{userType === "client" ? "Добавить клиента" : userType === "employee" ? "Добавить сотрудника" : "Создать пользователя"}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Box>
                  <Text mb="1" fontWeight="bold">Имя</Text>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
                </Box>
                <Box>
                  <Text mb="1" fontWeight="bold">Email</Text>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" />
                </Box>
                <Box>
                  <Text mb="1" fontWeight="bold">Пароль</Text>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Box>
                {!isClient && (
                  <Box>
                    <Text mb="1" fontWeight="bold">Роль</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                        <option value="">Выберите роль</option>
                        {filteredRoles?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {getRoleLabel(role.name)} ({role.scope})
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                )}

                {isClient && (
                  <Stack gap="3">
                    <Box>
                      <Text mb="1" fontWeight="bold">Организации и роли клиента</Text>
                      <Text fontSize="xs" color="gray.500" mb="2">Для каждой организации выберите роль: Владелец или Работник</Text>
                      <Stack gap="2">
                        {clientOrganizationRoles.map((entry) => {
                          const org = organizations?.find((o) => o.id === entry.organizationId);
                          const role = allRoles?.find((r) => r.id === entry.roleId);
                          return (
                            <Stack key={entry.organizationId} direction="row" justify="space-between" align="center">
                              <Text fontSize="sm">{org?.name ?? entry.organizationId} — {role ? getRoleLabel(role.name) : entry.roleId}</Text>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => setClientOrganizationRoles(clientOrganizationRoles.filter((e) => e.organizationId !== entry.organizationId))}
                              >
                                <FiX />
                              </Button>
                            </Stack>
                          );
                        })}
                        <Stack direction="row" gap="2" align="end">
                          <Box flex="1">
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={selectedClientOrgId}
                                onChange={(e) => setSelectedClientOrgId(e.target.value)}
                              >
                                <option value="">Организация</option>
                                {organizations?.filter((o) => !clientOrganizationRoles.some((e) => e.organizationId === o.id)).map((org) => (
                                  <option key={org.id} value={org.id}>
                                    {org.name}
                                  </option>
                                ))}
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                          <Box flex="1">
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={selectedClientRoleId}
                                onChange={(e) => setSelectedClientRoleId(e.target.value)}
                              >
                                <option value="">Роль</option>
                                {filteredRoles?.filter((r) => isClientRole(r.name)).map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {getRoleLabel(role.name)}
                                  </option>
                                ))}
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                          <Button
                            size="sm"
                            colorPalette="blue"
                            disabled={!selectedClientOrgId || !selectedClientRoleId}
                            onClick={() => {
                              if (selectedClientOrgId && selectedClientRoleId && !clientOrganizationRoles.some((e) => e.organizationId === selectedClientOrgId)) {
                                setClientOrganizationRoles([...clientOrganizationRoles, { organizationId: selectedClientOrgId, roleId: selectedClientRoleId }]);
                                setSelectedClientOrgId("");
                                setSelectedClientRoleId("");
                              }
                            }}
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                )}

                {isEmployee && (
                  <Stack gap="3">
                    <Box>
                      <Text mb="1" fontWeight="bold">Организации</Text>
                      <Text fontSize="xs" color="gray.500" mb="2">Можно не выбирать или выбрать несколько</Text>
                      <Stack gap="2">
                        {organizationIds.map((id) => {
                          const org = organizations?.find((o) => o.id === id);
                          return (
                            <Stack key={id} direction="row" justify="space-between" align="center">
                              <Text fontSize="sm">{org?.name ?? id}</Text>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => setOrganizationIds(organizationIds.filter((o) => o !== id))}
                              >
                                <FiX />
                              </Button>
                            </Stack>
                          );
                        })}
                        <Stack direction="row" gap="2" align="end">
                          <Box flex="1">
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={selectedOrgId}
                                onChange={(e) => setSelectedOrgId(e.target.value)}
                              >
                                <option value="">Выберите организацию</option>
                                {organizations?.filter((o) => !organizationIds.includes(o.id)).map((org) => (
                                  <option key={org.id} value={org.id}>
                                    {org.name}
                                  </option>
                                ))}
                              </NativeSelect.Field>
                            </NativeSelect.Root>
                          </Box>
                          <Button
                            size="sm"
                            colorPalette="blue"
                            disabled={!selectedOrgId}
                            onClick={() => {
                              if (selectedOrgId && !organizationIds.includes(selectedOrgId)) {
                                setOrganizationIds([...organizationIds, selectedOrgId]);
                                setSelectedOrgId("");
                              }
                            }}
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                )}

                {showDept && (
                  <Box>
                    <Text mb="1" fontWeight="bold">Отдел</Text>
                    <Text fontSize="xs" color="gray.500" mb="2">Закрепление за отделом необязательно</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
                        <option value="">Без отдела</option>
                        {departments?.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                )}

                {showProjects && (
                <Box>
                  <Text mb="1" fontWeight="bold">Проекты</Text>
                  <Text fontSize="xs" color="gray.500" mb="2">
                    {clientOrgIds.length === 0 ? "Сначала выберите организацию" : "Проекты выбранных организаций (необязательно)"}
                  </Text>
                  <Stack gap="2">
                    {projectAssignments.map((pa, idx) => {
                      const proj = projects?.find((p) => p.id === pa.projectId);
                      const role = allRoles?.find((r) => r.id === pa.roleId);
                      return (
                        <Stack key={idx} direction="row" justify="space-between" align="center">
                          <Text fontSize="sm">
                            {proj?.name ?? pa.projectId} — {role?.name ?? pa.roleId}
                          </Text>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => setProjectAssignments(projectAssignments.filter((_, i) => i !== idx))}
                          >
                            <FiX />
                          </Button>
                        </Stack>
                      );
                    })}
                    <Stack direction="row" gap="2" align="end">
                      <Box flex="1">
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                          >
                            <option value="">{organizationIds.length === 0 ? "Сначала организация" : "Проект"}</option>
                            {projects?.filter(
                              (p) => !projectAssignments.some((pa) => pa.projectId === p.id)
                            ).map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>
                      <Box flex="1">
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={selectedProjectRoleId}
                            onChange={(e) => setSelectedProjectRoleId(e.target.value)}
                          >
                            <option value="">Роль</option>
                            {allRoles?.filter((r) => isWorkerRole(r.name)).map((r) => (
                              <option key={r.id} value={r.id}>{getRoleLabel(r.name)}</option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>
                      <Button
                        size="sm"
                        colorPalette="blue"
                        disabled={!selectedProjectId || !selectedProjectRoleId}
                        onClick={() => {
                          setProjectAssignments([
                            ...projectAssignments,
                            { projectId: selectedProjectId, roleId: selectedProjectRoleId },
                          ]);
                          setSelectedProjectId("");
                          setSelectedProjectRoleId("");
                        }}
                      >
                        +
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
                )}

                <Button colorPalette="blue" loading={createUser.isPending} onClick={handleSubmit}>
                  {userType === "client" ? "Добавить клиента" : userType === "employee" ? "Добавить сотрудника" : "Создать пользователя"}
                </Button>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
