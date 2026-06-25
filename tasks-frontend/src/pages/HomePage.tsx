import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
  Flex,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useAuthStore } from "@/entities/user/model/authStore";
import {
  FiLayers,
  FiCheckSquare,
  FiDollarSign,
  FiMessageSquare,
  FiUsers,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

const features = [
  {
    icon: FiLayers,
    title: "Порталы",
    description: "Создавайте рабочие пространства для каждого клиента или направления бизнеса.",
  },
  {
    icon: FiCheckSquare,
    title: "Проекты и задачи",
    description: "Канбан-доска, приоритеты, дедлайны, исполнители и статусы в одном месте.",
  },
  {
    icon: FiDollarSign,
    title: "Финансы",
    description: "Кошельки проектов, почасовая оплата, фиксированные бюджеты и прозрачная отчётность.",
  },
  {
    icon: FiMessageSquare,
    title: "Коммуникации",
    description: "Встроенный чат, комментарии к задачам и уведомления в реальном времени.",
  },
  {
    icon: FiUsers,
    title: "Команда и клиенты",
    description: "Приглашайте участников, раздавайте роли и работайте вместе с заказчиками.",
  },
  {
    icon: FiShield,
    title: "Безопасность",
    description: "JWT-аутентификация, ролевая модель и журнал изменений для контроля доступа.",
  },
];

const steps = [
  {
    number: "01",
    title: "Создайте портал",
    description: "Зарегистрируйтесь и создайте первое рабочее пространство за 30 секунд.",
  },
  {
    number: "02",
    title: "Добавьте организации",
    description: "Разделите клиентов по организациям и отделам для удобной структуры.",
  },
  {
    number: "03",
    title: "Ведите проекты",
    description: "Создавайте задачи, назначайте исполнителей и отслеживайте прогресс.",
  },
];

const testimonials = [
  {
    text: "Коллеги заменили нам Trello, Excel и переписку в Telegram. Всё в одном месте.",
    author: "Анна К.",
    role: "Project Manager, Pixel Agency",
  },
  {
    text: "Наконец-то видно, сколько времени уходит на каждый проект и сколько он приносит.",
    author: "Дмитрий В.",
    role: "CEO, DevStudio",
  },
  {
    text: "Клиенты видят статус задач без доступа к внутренним процессам. Очень удобно.",
    author: "Марина С.",
    role: "Product Owner",
  },
];

const stats = [
  { value: "10+", label: "порталов создано" },
  { value: "500+", label: "задач выполнено" },
  { value: "50+", label: "команд на платформе" },
  { value: "24/7", label: "доступность" },
];

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card.Root p="6" h="full" borderWidth="1px" borderColor="gray.100" _hover={{ boxShadow: "md", borderColor: "blue.200" }} transition="all 0.2s">
      <Card.Body>
        <Box w="12" h="12" borderRadius="lg" bg="blue.50" display="flex" alignItems="center" justifyContent="center" mb="4">
          <Icon size={24} color="#2563eb" />
        </Box>
        <Heading size="md" mb="2" color="gray.800">
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.600" lineHeight="1.6">
          {description}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  if (token) {
    return (
      <Container maxW="1200px" py="10">
        <Stack gap="8">
          <Box>
            <Heading mb="2" size="xl">Добро пожаловать в Коллеги</Heading>
            <Text color="gray.600" fontSize="lg">Выберите раздел, чтобы продолжить работу.</Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portals")} _hover={{ boxShadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
              <Card.Body>
                <Box w="10" h="10" borderRadius="md" bg="blue.50" display="flex" alignItems="center" justifyContent="center" mb="3">
                  <FiLayers size={20} color="#2563eb" />
                </Box>
                <Heading size="md" mb="2" color="blue.700">
                  Мои порталы
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Перейти к списку порталов и проектов.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/join-portal")} _hover={{ boxShadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
              <Card.Body>
                <Box w="10" h="10" borderRadius="md" bg="blue.50" display="flex" alignItems="center" justifyContent="center" mb="3">
                  <FiUsers size={20} color="#2563eb" />
                </Box>
                <Heading size="md" mb="2" color="blue.700">
                  Вступить в портал
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Найти существующий портал по названию.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portal-requests")} _hover={{ boxShadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
              <Card.Body>
                <Box w="10" h="10" borderRadius="md" bg="blue.50" display="flex" alignItems="center" justifyContent="center" mb="3">
                  <FiCheckSquare size={20} color="#2563eb" />
                </Box>
                <Heading size="md" mb="2" color="blue.700">
                  Запросы на вступление
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Управление приглашениями и заявками.
                </Text>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero */}
      <Box
        bg="linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #2563eb 100%)"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="600px"
          h="600px"
          borderRadius="full"
          bg="whiteAlpha.100"
          filter="blur(80px)"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="-10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="whiteAlpha.100"
          filter="blur(80px)"
        />

        <Container maxW="1200px" position="relative" zIndex="1" py={{ base: "16", md: "24" }}>
          <Stack gap="8" align="center" textAlign="center" maxW="800px" mx="auto">
            <Badge size="lg" colorPalette="whiteAlpha" borderRadius="full" px="4" py="1">
              Бесплатно для маленьких команд
            </Badge>
            <Heading size="3xl" lineHeight="1.2">
              Управляйте проектами, клиентами и финансами в одной платформе
            </Heading>
            <Text fontSize="xl" color="blue.100" maxW="600px">
              Коллеги — это рабочее пространство для агентств, фрилансеров и продуктовых команд, которым нужен порядок.
            </Text>
            <HStack gap="4" flexWrap="wrap" justify="center">
              <Button
                size="lg"
                bg="white"
                color="blue.700"
                _hover={{ bg: "blue.50" }}
                px="8"
                onClick={() => navigate("/register")}
              >
                Начать бесплатно
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.400"
                _hover={{ bg: "whiteAlpha.200" }}
                px="8"
                onClick={() => navigate("/login")}
              >
                Войти
              </Button>
            </HStack>

            <HStack gap="6" mt="4" flexWrap="wrap" justify="center">
              <HStack gap="2">
                <Box as={FiCheckCircle} color="blue.200" />
                <Text fontSize="sm" color="blue.100">Бесплатный тариф</Text>
              </HStack>
              <HStack gap="2">
                <Box as={FiCheckCircle} color="blue.200" />
                <Text fontSize="sm" color="blue.100">Без карты</Text>
              </HStack>
              <HStack gap="2">
                <Box as={FiCheckCircle} color="blue.200" />
                <Text fontSize="sm" color="blue.100">Российский продукт</Text>
              </HStack>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* Stats */}
      <Box bg="white" borderBottomWidth="1px" borderColor="gray.100">
        <Container maxW="1200px" py="10">
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="8" textAlign="center">
            {stats.map((stat) => (
              <Box key={stat.label}>
                <Heading size="2xl" color="blue.700" mb="1">
                  {stat.value}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxW="1200px" py={{ base: "16", md: "24" }}>
        <Stack gap="12">
          <Box textAlign="center" maxW="600px" mx="auto">
            <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="2" textTransform="uppercase" letterSpacing="wide">
              Возможности
            </Text>
            <Heading size="xl" mb="4">
              Всё для работы с проектами
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Замените несколько инструментов одной платформой. Простой интерфейс, мощные возможности.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* How it works */}
      <Box bg="gray.50" py={{ base: "16", md: "24" }}>
        <Container maxW="1200px">
          <Stack gap="12">
            <Box textAlign="center" maxW="600px" mx="auto">
              <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="2" textTransform="uppercase" letterSpacing="wide">
                Как это работает
              </Text>
              <Heading size="xl" mb="4">
                Начните за три шага
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Не нужно долго настраивать. Создайте пространство и пригласите команду.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap="8">
              {steps.map((step) => (
                <Card.Root key={step.number} p="8" bg="white" borderWidth="1px" borderColor="gray.100">
                  <Card.Body>
                    <Text fontSize="5xl" fontWeight="800" color="blue.100" mb="4">
                      {step.number}
                    </Text>
                    <Heading size="md" mb="3" color="gray.800">
                      {step.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                      {step.description}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxW="1200px" py={{ base: "16", md: "24" }}>
        <Stack gap="12">
          <Box textAlign="center" maxW="600px" mx="auto">
            <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="2" textTransform="uppercase" letterSpacing="wide">
              Отзывы
            </Text>
            <Heading size="xl" mb="4">
              Что говорят команды
            </Heading>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            {testimonials.map((t) => (
              <Card.Root key={t.author} p="6" bg="white" borderWidth="1px" borderColor="gray.100" h="full">
                <Card.Body>
                  <Text fontSize="md" color="gray.700" mb="6" lineHeight="1.7" fontStyle="italic">
                    "{t.text}"
                  </Text>
                  <Box>
                    <Text fontWeight="semibold" color="gray.800">
                      {t.author}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {t.role}
                    </Text>
                  </Box>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* CTA */}
      <Box bg="blue.700" color="white" py={{ base: "16", md: "20" }}>
        <Container maxW="1200px" textAlign="center">
          <Stack gap="6" align="center" maxW="600px" mx="auto">
            <Heading size="xl">
              Готовы навести порядок в проектах?
            </Heading>
            <Text fontSize="lg" color="blue.100">
              Присоединяйтесь к командам, которые уже используют Коллеги.
            </Text>
            <Button
              size="lg"
              bg="white"
              color="blue.700"
              _hover={{ bg: "blue.50" }}
              px="8"
              onClick={() => navigate("/register")}
            >
              Создать аккаунт бесплатно
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="gray.400" py="10">
        <Container maxW="1200px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <HStack gap="2">
              <Box w="8" h="8" borderRadius="md" bg="blue.600" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="800">
                К
              </Box>
              <Text fontWeight="bold" color="white">
                Коллеги
              </Text>
            </HStack>
            <Text fontSize="sm">
              © 2026 Коллеги. Все права защищены.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
