"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Input,
  NativeSelect,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "@/features/organization/model/useOrganizations";
import { useDepartments, useCreateDepartment } from "@/features/department/model/useDepartments";
import { useInvites, useCreateInvite } from "@/features/invite/model/useInvites";
import { useRoles } from "@/features/role/model/useRoles";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import CreateOrganizationForm from "@/features/organization/ui/CreateOrganizationForm";
import CreateUserDialog from "@/features/user/ui/CreateUserDialog";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";

export default function PortalPage({ portalSlug }: { portalSlug: string }) {
  const router = useRouter();
  const [orgOpen, setOrgOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");

  const { data: portal, isLoading: portalLoading } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => fetchPortalBySlug(portalSlug!),
    enabled: !!portalSlug,
  });

  const { data: organizations, isLoading } = useOrganizations(portal?.id ?? "");
  const { data: departments } = useDepartments(portal?.id ?? "");
  const createDepartment = useCreateDepartment();
  const { data: invites } = useInvites(portal?.id ?? "");
  const createInvite = useCreateInvite();
  const { data: allRoles } = useRoles();

  if (!portalSlug) {
    router.replace("/");
    return null;
  }

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !portal?.id) return;
    await createDepartment.mutateAsync({
      name: deptName,
      description: deptDesc || undefined,
      portalId: portal.id,
    });
    setDeptName("");
    setDeptDesc("");
    setDeptOpen(false);
  };

  return (
    <Box p="6">
      <Breadcrumbs />
      <Stack direction="row" justify="space-between" align="center" mb="2">
        <Heading>
          {portalLoading ? "Загрузка..." : portal?.name ?? "Портал"}
        </Heading>
        <Button variant="outline" size="sm" onClick={() => router.push(`/portals/${portalSlug}/settings`)}>
          ⚙ Настройки
        </Button>
      </Stack>
      <Text color="gray.500" mb="6">
        Клиентские организации. Проекты создаются внутри организации.
      </Text>

      <Stack direction="row" gap="3" mb="6" wrap="wrap">
        <Button onClick={() => setOrgOpen(true)} colorPalette="blue">
          + Добавить организацию
        </Button>
        <Button onClick={() => setDeptOpen(true)} colorPalette="purple">
          + Добавить отдел
        </Button>
        <Button onClick={() => setUserOpen(true)} colorPalette="green">
          + Создать пользователя
        </Button>
        <Button onClick={() => setInviteOpen(true)} colorPalette="orange">
          + Пригласить
        </Button>
      </Stack>

      {isLoading && <Text>Загрузка...</Text>}

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4" mb="8">
        {organizations?.map((org) => (
          <Card.Root
            key={org.id}
            p="4"
            cursor="pointer"
            _hover={{ shadow: "md", borderColor: "blue.400" }}
            borderWidth="1px"
            onClick={() => router.push(`/portals/${portalSlug}/organizations/${org.slug}`)}
          >
            <Card.Body>
              <Heading size="md" mb="1">{org.name}</Heading>
              <Badge colorPalette="gray" mb="2">/{org.slug}</Badge>
              {org.description && (
                <Text color="gray.600" fontSize="sm">{org.description}</Text>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>

      {!isLoading && organizations?.length === 0 && (
        <Text color="gray.500" mt="4">Пока нет организаций. Добавьте первую.</Text>
      )}

      <Heading size="md" mb="4">Отделы</Heading>
      <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap="3">
        {departments?.map((dept) => (
          <Card.Root key={dept.id} p="4" borderWidth="1px">
            <Card.Body>
              <Heading size="sm">{dept.name}</Heading>
            </Card.Body>
          </Card.Root>
        ))}
      </Grid>
      {!departments?.length && <Text color="gray.500">Нет отделов.</Text>}

      <Dialog.Root open={orgOpen} onOpenChange={(e) => setOrgOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Добавить организацию</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <CreateOrganizationForm
                  portalId={portal?.id ?? ""}
                  onSuccess={() => setOrgOpen(false)}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={deptOpen} onOpenChange={(e) => setDeptOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Добавить отдел</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleCreateDept}>
                  <Stack gap="4">
                    <Input
                      placeholder="Название отдела"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Описание"
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                    />
                    <Button type="submit" loading={createDepartment.isPending} colorPalette="purple">
                      Создать
                    </Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={inviteOpen} onOpenChange={(e) => setInviteOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Пригласить пользователя</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inviteEmail || !inviteRoleId || !portal?.id) return;
                    await createInvite.mutateAsync({
                      email: inviteEmail,
                      portalId: portal.id,
                      roleId: inviteRoleId,
                    });
                    setInviteEmail("");
                    setInviteRoleId("");
                    setInviteOpen(false);
                  }}
                >
                  <Stack gap="4">
                    <Input
                      placeholder="Email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                    <NativeSelect.Root>
                      <NativeSelect.Field value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)}>
                        <option value="">Выберите роль</option>
                        {allRoles?.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <Button type="submit" loading={createInvite.isPending} colorPalette="orange">
                      Отправить приглашение
                    </Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Heading size="md" mb="4">Приглашения</Heading>
      <Stack gap="2" mb="8">
        {invites?.map((inv) => (
          <Card.Root key={inv.id} p="3">
            <Card.Body>
              <Stack direction="row" justify="space-between" align="center">
                <Text fontSize="sm">{inv.email}</Text>
                <Badge colorPalette={inv.status === "accepted" ? "green" : inv.status === "declined" ? "red" : "yellow"}>
                  {inv.status}
                </Badge>
              </Stack>
              <Text fontSize="xs" color="gray.500">Роль: {inv.role.name} | Пригласил: {inv.invitedBy.name || inv.invitedBy.email}</Text>
            </Card.Body>
          </Card.Root>
        ))}
        {!invites?.length && <Text color="gray.500">Нет приглашений.</Text>}
      </Stack>

      <CreateUserDialog
        portalId={portal?.id ?? ""}
        open={userOpen}
        onOpenChange={setUserOpen}
      />
    </Box>
  );
}

