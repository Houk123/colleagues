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
  Checkbox,
} from "@chakra-ui/react";
import { useCreatableRoles, useCreatePortalUser } from "@/features/user/model/useUserManagement.js";
import { useOrganizations } from "@/features/organization/model/useOrganizations.js";
import { useDepartments } from "@/features/department/model/useDepartments.js";
import { useProjects } from "@/features/project/model/useProjects.js";
import { useRoles } from "@/features/role/model/useRoles.js";

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

function isWorkerRole(name: string): boolean {
  return name.toLowerCase().includes("worker");
}

export default function CreateUserDialog({
  portalId,
  open,
  onOpenChange,
}: {
  portalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [autoCreateOrg, setAutoCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [projectAssignments, setProjectAssignments] = useState<{ projectId: string; roleId: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectRoleId, setSelectedProjectRoleId] = useState("");

  const { data: roles } = useCreatableRoles(portalId);
  const { data: organizations } = useOrganizations(portalId);
  const { data: departments } = useDepartments(portalId);
  const { data: allRoles } = useRoles();
  const createUser = useCreatePortalUser();

  const selectedRole = roles?.find((r) => r.id === roleId);
  const showOrg = selectedRole ? isClientRole(selectedRole.name) : false;
  const showDept = selectedRole ? isWorkerRole(selectedRole.name) : false;

  const effectiveOrgId = showOrg && !autoCreateOrg ? organizationId : "";
  const { data: projects } = useProjects(portalId, effectiveOrgId || undefined);

  const reset = () => {
    setEmail("");
    setName("");
    setPassword("");
    setRoleId("");
    setOrganizationId("");
    setDepartmentId("");
    setAutoCreateOrg(false);
    setOrgName("");
    setProjectAssignments([]);
    setSelectedProjectId("");
    setSelectedProjectRoleId("");
  };

  const handleSubmit = async () => {
    if (!email || !name || !password || !roleId) return;
    await createUser.mutateAsync({
      email,
      name,
      password,
      portalId,
      roleId,
      ...(showOrg && autoCreateOrg ? { organizationId: undefined } : {}),
      ...(showOrg && !autoCreateOrg && organizationId ? { organizationId } : {}),
      ...(showDept && departmentId ? { departmentId } : {}),
      ...(projectAssignments.length > 0 ? { projectAssignments } : {}),
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
              <Dialog.Title>Создать пользователя</Dialog.Title>
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

                {showOrg && (
                  <Stack gap="3">
                    <Box>
                      <Checkbox.Root
                        checked={autoCreateOrg}
                        onCheckedChange={(e) => setAutoCreateOrg(!!e.checked)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>Создать новую организацию</Checkbox.Label>
                      </Checkbox.Root>
                    </Box>
                    {autoCreateOrg ? (
                      <Box>
                        <Text mb="1" fontWeight="bold">Название организации</Text>
                        <Input
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="ООО Ромашка"
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Text mb="1" fontWeight="bold">Организация</Text>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={organizationId}
                            onChange={(e) => setOrganizationId(e.target.value)}
                          >
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
                  </Stack>
                )}

                {showDept && (
                  <Box>
                    <Text mb="1" fontWeight="bold">Отдел</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                      >
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

                <Box>
                  <Text mb="1" fontWeight="bold">Проекты</Text>
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
                            variant="outline"
                            colorScheme="red"
                            onClick={() => setProjectAssignments(projectAssignments.filter((_, i) => i !== idx))}
                          >
                            Убрать
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
                            <option value="">Проект</option>
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
                            {allRoles?.map((r) => (
                              <option key={r.id} value={r.id}>{getRoleLabel(r.name)}</option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="blue"
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

                <Button colorScheme="blue" loading={createUser.isPending} onClick={handleSubmit}>
                  Создать пользователя
                </Button>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
