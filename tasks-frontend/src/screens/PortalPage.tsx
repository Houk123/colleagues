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
  HStack,
  Text,
  Dialog,
  Portal,
  Badge,
  Input,
  NativeSelect,
  Container,
  Flex,
  CloseButton,
  Tabs,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizations } from "@/features/organization/model/useOrganizations";
import { useDepartments, useCreateDepartment } from "@/features/department/model/useDepartments";
import { useInvites, useCreateInvite } from "@/features/invite/model/useInvites";
import { useRoles } from "@/features/role/model/useRoles";
import { usePortalServices, useCreatePortalService, useUpdatePortalService, useDeletePortalService } from "@/features/portal/model/useServices";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import type { PortalService } from "@/features/portal/api/serviceApi";
import CreateOrganizationForm from "@/features/organization/ui/CreateOrganizationForm";
import CreateUserDialog from "@/features/user/ui/CreateUserDialog";
import { usePortalEmployees, usePortalClients } from "@/features/user/model/useUserManagement";
import { Breadcrumbs } from "@/widgets/Breadcrumbs";
import { FiSettings, FiPlus, FiUsers, FiBriefcase, FiLayers, FiMail, FiDollarSign, FiUserCheck } from "react-icons/fi";

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
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCurrency, setServiceCurrency] = useState("RUB");

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
  const { data: employees } = usePortalEmployees(portal?.id ?? "");
  const { data: clients } = usePortalClients(portal?.id ?? "");
  const [userType, setUserType] = useState<"employee" | "client">("employee");
  const { data: services } = usePortalServices(portal?.id ?? "");
  const createService = useCreatePortalService();
  const updateService = useUpdatePortalService();
  const deleteService = useDeletePortalService();
  const { data: allRoles } = useRoles();
  const [editingService, setEditingService] = useState<PortalService | null>(null);

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

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(servicePrice);
    if (!serviceName || !price || !portal?.id) return;
    await createService.mutateAsync({
      portalId: portal.id,
      input: { name: serviceName, description: serviceDesc || undefined, pricePerHour: price, currency: serviceCurrency },
    });
    setServiceName("");
    setServiceDesc("");
    setServicePrice("");
    setServiceCurrency("RUB");
    setServiceOpen(false);
  };

  return (
    <Box py="6" bg="gray.50" minH="calc(100vh - 56px)">
      <Container maxW="1200px" px="6">
        <Breadcrumbs />

        <Card.Root p="6" bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 1px 2px rgba(0,0,0,0.04)" mb="6">
          <Card.Body>
            <Flex direction={{ base: "column", md: "row" }} gap="4" justify="space-between" align={{ base: "flex-start", md: "center" }}>
              <Stack gap="0">
                <Heading size="xl" color="gray.900">
                  {portalLoading ? "Загрузка..." : portal?.name ?? "Портал"}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  /{portalSlug} · Клиентские организации и проекты
                </Text>
              </Stack>
              <Button variant="outline" size="sm" onClick={() => router.push(`/portals/${portalSlug}/settings`)}>
                <FiSettings />
                Настройки
              </Button>
            </Flex>
          </Card.Body>
        </Card.Root>

        <Tabs.Root defaultValue="organizations" variant="line" colorPalette="blue">
          <Card.Root bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
            <Tabs.List p="4" pb="0" gap="4">
              <Tabs.Trigger value="organizations">
                <FiBriefcase />
                Организации
                <Badge size="sm" colorPalette="gray" ml="2">{organizations?.length ?? 0}</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="departments">
                <FiLayers />
                Отделы
                <Badge size="sm" colorPalette="gray" ml="2">{departments?.length ?? 0}</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="employees">
                <FiUserCheck />
                Сотрудники
                <Badge size="sm" colorPalette="gray" ml="2">{employees?.length ?? 0}</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="clients">
                <FiUsers />
                Клиенты
                <Badge size="sm" colorPalette="gray" ml="2">{clients?.length ?? 0}</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="services">
                <FiDollarSign />
                Услуги
                <Badge size="sm" colorPalette="gray" ml="2">{services?.length ?? 0}</Badge>
              </Tabs.Trigger>
              <Tabs.Trigger value="invites">
                <FiMail />
                Приглашения
                <Badge size="sm" colorPalette="gray" ml="2">{invites?.length ?? 0}</Badge>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="organizations" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Организации и их проекты</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => setOrgOpen(true)}>
                  <FiPlus /> Добавить
                </Button>
              </Flex>
              {isLoading && <Text color="gray.500">Загрузка...</Text>}
              <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
                {organizations?.map((org) => (
                  <Card.Root
                    key={org.id}
                    p="5"
                    cursor="pointer"
                    _hover={{ borderColor: "blue.300", transform: "translateY(-2px)" }}
                    borderWidth="1px"
                    borderColor="gray.100"
                    bg="white"
                    boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                    transition="all 0.2s"
                    onClick={() => router.push(`/portals/${portalSlug}/organizations/${org.slug}`)}
                  >
                    <Card.Body>
                      <HStack gap="3" mb="2">
                        <Box w="10" h="10" borderRadius="md" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiBriefcase} color="blue.600" fontSize="20px" />
                        </Box>
                        <Stack gap="0">
                          <Heading size="md" color="gray.900">{org.name}</Heading>
                          <Badge colorPalette="gray" size="sm">/{org.slug}</Badge>
                        </Stack>
                      </HStack>
                      {org.description && (
                        <Text color="gray.600" fontSize="sm" mt="2">{org.description}</Text>
                      )}
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
              {!isLoading && organizations?.length === 0 && (
                <Box textAlign="center" py="12">
                  <Text color="gray.500">Пока нет организаций. Добавьте первую.</Text>
                  <Button size="sm" mt="3" colorPalette="blue" onClick={() => setOrgOpen(true)}>
                    <FiPlus /> Добавить организацию
                  </Button>
                </Box>
              )}
            </Tabs.Content>

            <Tabs.Content value="departments" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Внутренние отделы портала</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => setDeptOpen(true)}>
                  <FiPlus /> Добавить
                </Button>
              </Flex>
              <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap="4">
                {departments?.map((dept) => (
                  <Card.Root key={dept.id} p="4" borderWidth="1px" borderColor="gray.100" bg="white" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                    <Card.Body>
                      <HStack gap="3">
                        <Box w="8" h="8" borderRadius="md" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiLayers} color="gray.600" fontSize="16px" />
                        </Box>
                        <Heading size="sm" color="gray.900">{dept.name}</Heading>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
              {!departments?.length && (
                <Box textAlign="center" py="12">
                  <Text color="gray.500">Нет отделов.</Text>
                </Box>
              )}
            </Tabs.Content>

            <Tabs.Content value="employees" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Сотрудники портала</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => { setUserType("employee"); setUserOpen(true); }}>
                  <FiPlus /> Добавить сотрудника
                </Button>
              </Flex>
              <Stack gap="3">
                {employees?.map((user) => (
                  <Card.Root key={user.id} p="4" bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                    <Card.Body>
                      <HStack gap="3">
                        <Box w="8" h="8" borderRadius="full" bg="blue.600" color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="700" fontSize="xs">
                          {(user.name || user.email || "?").charAt(0).toUpperCase()}
                        </Box>
                        <Stack gap="0">
                          <Text fontSize="sm" fontWeight="medium" color="gray.900">{user.name || user.email}</Text>
                          <Text fontSize="xs" color="gray.500">{user.email}</Text>
                        </Stack>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
                {!employees?.length && (
                  <Box textAlign="center" py="12">
                    <Text color="gray.500">Нет сотрудников.</Text>
                  </Box>
                )}
              </Stack>
            </Tabs.Content>

            <Tabs.Content value="clients" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Клиенты портала</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => { setUserType("client"); setUserOpen(true); }}>
                  <FiPlus /> Добавить клиента
                </Button>
              </Flex>
              <Stack gap="3">
                {clients?.map((user) => (
                  <Card.Root key={user.id} p="4" bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                    <Card.Body>
                      <HStack gap="3">
                        <Box w="8" h="8" borderRadius="full" bg="green.600" color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="700" fontSize="xs">
                          {(user.name || user.email || "?").charAt(0).toUpperCase()}
                        </Box>
                        <Stack gap="0">
                          <Text fontSize="sm" fontWeight="medium" color="gray.900">{user.name || user.email}</Text>
                          <Text fontSize="xs" color="gray.500">{user.email}</Text>
                        </Stack>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
                {!clients?.length && (
                  <Box textAlign="center" py="12">
                    <Text color="gray.500">Нет клиентов.</Text>
                  </Box>
                )}
              </Stack>
            </Tabs.Content>

            <Tabs.Content value="services" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Услуги и почасовые ставки</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => setServiceOpen(true)}>
                  <FiPlus /> Добавить услугу
                </Button>
              </Flex>
              <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap="4">
                {services?.map((service) => (
                  <Card.Root key={service.id} p="4" borderWidth="1px" borderColor="gray.100" bg="white" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                    <Card.Body>
                      <Flex justify="space-between" align="flex-start">
                        <HStack gap="3" mb="2">
                          <Box w="8" h="8" borderRadius="md" bg="green.50" display="flex" alignItems="center" justifyContent="center">
                            <Box as={FiDollarSign} color="green.600" fontSize="16px" />
                          </Box>
                          <Heading size="sm" color="gray.900">{service.name}</Heading>
                        </HStack>
                        <HStack gap="1">
                          <Button size="xs" variant="ghost" onClick={() => setEditingService(service)}>Изменить</Button>
                          <Button size="xs" variant="ghost" colorPalette="red" onClick={() => portal?.id && deleteService.mutate({ portalId: portal.id, serviceId: service.id })}>Удалить</Button>
                        </HStack>
                      </Flex>
                      {service.description && (
                        <Text color="gray.600" fontSize="sm" mb="2">{service.description}</Text>
                      )}
                      <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                        {service.pricePerHour} {service.currency}/час
                      </Text>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
              {!services?.length && (
                <Box textAlign="center" py="12">
                  <Text color="gray.500">Нет услуг. Добавьте первую.</Text>
                </Box>
              )}
            </Tabs.Content>

            <Tabs.Content value="invites" p="4">
              <Flex justify="space-between" align="center" mb="4">
                <Text color="gray.500" fontSize="sm">Приглашения пользователей</Text>
                <Button size="sm" colorPalette="blue" variant="outline" onClick={() => setInviteOpen(true)}>
                  <FiPlus /> Пригласить
                </Button>
              </Flex>
              <Stack gap="3">
                {invites?.map((inv) => (
                  <Card.Root key={inv.id} p="4" bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 1px 2px rgba(0,0,0,0.04)">
                    <Card.Body>
                      <Flex justify="space-between" align="center" flexWrap="wrap" gap="2">
                        <Stack gap="0">
                          <Text fontSize="sm" fontWeight="medium" color="gray.900">{inv.email}</Text>
                          <Text fontSize="xs" color="gray.500">Роль: {inv.role.name} · Пригласил: {inv.invitedBy.name || inv.invitedBy.email}</Text>
                        </Stack>
                        <Badge colorPalette={inv.status === "accepted" ? "green" : inv.status === "declined" ? "red" : "yellow"} size="sm">
                          {inv.status}
                        </Badge>
                      </Flex>
                    </Card.Body>
                  </Card.Root>
                ))}
                {!invites?.length && (
                  <Box textAlign="center" py="12">
                    <Text color="gray.500">Нет приглашений.</Text>
                  </Box>
                )}
              </Stack>
            </Tabs.Content>
          </Card.Root>
        </Tabs.Root>
      </Container>

      <Dialog.Root open={orgOpen} onOpenChange={(e) => setOrgOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Добавить организацию</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
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
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Добавить отдел</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleCreateDept}>
                  <Stack gap="4">
                    <Input placeholder="Название отдела" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
                    <Input placeholder="Описание" value={deptDesc} onChange={(e) => setDeptDesc(e.target.value)} />
                    <Button type="submit" loading={createDepartment.isPending} colorPalette="blue">
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
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Пригласить пользователя</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inviteEmail || !inviteRoleId || !portal?.id) return;
                    await createInvite.mutateAsync({ email: inviteEmail, portalId: portal.id, roleId: inviteRoleId });
                    setInviteEmail("");
                    setInviteRoleId("");
                    setInviteOpen(false);
                  }}
                >
                  <Stack gap="4">
                    <Input placeholder="Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                    <NativeSelect.Root>
                      <NativeSelect.Field value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)}>
                        <option value="">Выберите роль</option>
                        {allRoles?.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.scope})</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <Button type="submit" loading={createInvite.isPending} colorPalette="blue">
                      Отправить приглашение
                    </Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <CreateUserDialog
        portalId={portal?.id ?? ""}
        open={userOpen}
        onOpenChange={setUserOpen}
        userType={userType}
      />

      <Dialog.Root open={serviceOpen} onOpenChange={(e) => setServiceOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Добавить услугу</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={handleCreateService}>
                  <Stack gap="4">
                    <Input placeholder="Название услуги" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
                    <Input placeholder="Описание" value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} />
                    <Stack direction="row" gap="3">
                      <Input placeholder="Цена за час" type="number" min="0" step="0.01" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} required />
                      <Input placeholder="Валюта" value={serviceCurrency} onChange={(e) => setServiceCurrency(e.target.value)} required />
                    </Stack>
                    <Button type="submit" loading={createService.isPending} colorPalette="blue">
                      Сохранить
                    </Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Dialog.Root open={!!editingService} onOpenChange={(e) => { if (!e.open) setEditingService(null); }}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" />
          <Dialog.Positioner>
            <Dialog.Content bg="white" borderColor="gray.100" borderWidth="1px" boxShadow="0 8px 30px rgba(0,0,0,0.08)" borderRadius="xl">
              <Dialog.Header>
                <Flex justify="space-between" align="center" w="full">
                  <Dialog.Title color="gray.900">Изменить услугу</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editingService || !portal?.id) return;
                  const price = parseFloat(editingService.pricePerHour);
                  await updateService.mutateAsync({
                    portalId: portal.id,
                    serviceId: editingService.id,
                    input: {
                      name: editingService.name,
                      description: editingService.description || undefined,
                      pricePerHour: price,
                      currency: editingService.currency,
                    },
                  });
                  setEditingService(null);
                }}>
                  <Stack gap="4">
                    <Input placeholder="Название услуги" value={editingService?.name || ""} onChange={(e) => setEditingService((s) => s ? { ...s, name: e.target.value } : null)} required />
                    <Input placeholder="Описание" value={editingService?.description || ""} onChange={(e) => setEditingService((s) => s ? { ...s, description: e.target.value } : null)} />
                    <Stack direction="row" gap="3">
                      <Input placeholder="Цена за час" type="number" min="0" step="0.01" value={editingService?.pricePerHour || ""} onChange={(e) => setEditingService((s) => s ? { ...s, pricePerHour: e.target.value } : null)} required />
                      <Input placeholder="Валюта" value={editingService?.currency || ""} onChange={(e) => setEditingService((s) => s ? { ...s, currency: e.target.value } : null)} required />
                    </Stack>
                    <Button type="submit" loading={updateService.isPending} colorPalette="blue">
                      Сохранить
                    </Button>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}

