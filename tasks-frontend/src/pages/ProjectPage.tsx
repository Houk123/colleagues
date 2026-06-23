import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
} from "@chakra-ui/react";
import { useProjectBySlug, useProjectPhases, useCreatePhase, useProjectServices, useAddProjectService, useProjectTransactions, useCreateTransaction, useAddProjectMember } from "@/features/project/model/useProjects.js";
import { usePortalServices, useCreatePortalService } from "@/features/portal/model/useServices.js";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi.js";
import { usePortalUsers } from "@/features/user/model/useUserManagement.js";
import { useRoles } from "@/features/role/model/useRoles.js";

export default function ProjectPage() {
  const { portalSlug, orgSlug, projectSlug } = useParams<{
    portalSlug: string;
    orgSlug: string;
    projectSlug: string;
  }>();
  const navigate = useNavigate();

  const [phaseOpen, setPhaseOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [portalServiceOpen, setPortalServiceOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRoleId, setMemberRoleId] = useState("");

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

  if (!portalSlug || !orgSlug || !projectSlug) {
    return <Navigate to="/" replace />;
  }

  const balance = project?.wallet?.balance ? Number(project.wallet.balance) : 0;
  const isNegative = balance < 0;

  const backUrl = `/portals/${portalSlug}/organizations/${orgSlug}`;

  return (
    <Box p="6">
      <Button variant="ghost" onClick={() => navigate(backUrl)} mb="4">
        ← Назад к проектам
      </Button>

      <Stack direction="row" justify="space-between" align="flex-start" mb="6">
        <Box>
          <Heading mb="1">{project?.name ?? "Загрузка..."}</Heading>
          <Badge colorScheme={project?.status === "active" ? "green" : "gray"} mb="2">
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
            <Button size="sm" colorScheme="green" onClick={() => setMemberOpen(true)}>
              + Добавить участника
            </Button>
          </Stack>
          <Stack gap="2">
            {project?.userProjects.map((up) => (
              <Stack key={up.id} direction="row" justify="space-between" align="center">
                <Text>
                  {up.user.name || up.user.email} <Text as="span" color="gray.500">({up.user.email})</Text>
                </Text>
                <Badge colorScheme="blue">{up.role.name}</Badge>
              </Stack>
            ))}
          </Stack>
          {!project?.userProjects.length && <Text color="gray.500">Нет участников.</Text>}
        </Card.Body>
      </Card.Root>

      <Tabs.Root defaultValue="phases">
        <Tabs.List>
          <Tabs.Trigger value="phases">Фазы</Tabs.Trigger>
          <Tabs.Trigger value="services">Услуги</Tabs.Trigger>
          <Tabs.Trigger value="transactions">Транзакции</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="phases">
          <Stack gap="4" mt="4">
            <Button onClick={() => setPhaseOpen(true)} colorScheme="blue" w="fit-content">
              + Добавить фазу
            </Button>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap="4">
              {phases?.map((phase) => (
                <Card.Root key={phase.id} p="4" borderWidth={phase.isCurrent ? "2px" : "1px"} borderColor={phase.isCurrent ? "blue.400" : undefined}>
                  <Card.Body>
                    <Stack direction="row" justify="space-between" align="center" mb="2">
                      <Heading size="md">{phase.name}</Heading>
                      {phase.isCurrent && <Badge colorScheme="blue">Текущая</Badge>}
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
              <Button onClick={() => setServiceOpen(true)} colorScheme="blue" w="fit-content">
                + Подключить услугу
              </Button>
              <Button onClick={() => setPortalServiceOpen(true)} colorScheme="gray" variant="outline" w="fit-content">
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
                    {!ps.enabled && <Badge colorScheme="gray" mt="2">Отключена</Badge>}
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
            {!projectServices?.length && <Text color="gray.500">Услуги не подключены.</Text>}
          </Stack>
        </Tabs.Content>

        <Tabs.Content value="transactions">
          <Stack gap="4" mt="4">
            <Button onClick={() => setDepositOpen(true)} colorScheme="green" w="fit-content">
              + Пополнить кошелёк
            </Button>
            <Stack gap="2">
              {transactions?.map((t) => (
                <Card.Root key={t.id} p="3">
                  <Card.Body>
                    <Stack direction="row" justify="space-between">
                      <Text>
                        <Badge colorScheme={t.type === "deposit" ? "green" : t.type === "charge" ? "red" : "gray"}>
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
                    colorScheme="green"
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
        <Button type="submit" loading={createPhase.isPending} colorScheme="blue">Создать</Button>
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
        <Button type="submit" loading={addProjectService.isPending} colorScheme="blue">Подключить</Button>
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
        <Button type="submit" loading={createPortalService.isPending} colorScheme="blue">Создать</Button>
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
        <Button type="submit" loading={createTransaction.isPending} colorScheme="green">Пополнить</Button>
      </Stack>
    </form>
  );
}
