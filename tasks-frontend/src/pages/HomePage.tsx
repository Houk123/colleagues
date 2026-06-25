import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAuthStore } from "@/entities/user/model/authStore";

const features = [
  {
    title: "Порталы",
    description: "Объединяйте клиентов, проекты и команды в одном рабочем пространстве.",
  },
  {
    title: "Проекты и задачи",
    description: "Ведите канбан-доску, назначайте исполнителей и отслеживайте сроки.",
  },
  {
    title: "Финансы",
    description: "Кошельки проектов, почасовая оплата, фиксированные бюджеты и отчёты.",
  },
  {
    title: "Коммуникации",
    description: "Встроенный чат, комментарии к задачам и уведомления в реальном времени.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  if (token) {
    return (
      <Container maxW="1200px" py="10">
        <Stack gap="8">
          <Box>
            <Heading mb="2">Добро пожаловать в Коллеги</Heading>
            <Text color="gray.600">Выберите раздел, чтобы продолжить работу.</Text>
          </Box>

          <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap="4">
            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portals")}>
              <Card.Body>
                <Heading size="md" mb="2" color="blue.700">
                  Мои порталы
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Перейти к списку порталов и проектов.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/join-portal")}>
              <Card.Body>
                <Heading size="md" mb="2" color="blue.700">
                  Вступить в портал
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Найти существующий портал по названию.
                </Text>
              </Card.Body>
            </Card.Root>

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portal-requests")}>
              <Card.Body>
                <Heading size="md" mb="2" color="blue.700">
                  Запросы на вступление
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Управление приглашениями и заявками.
                </Text>
              </Card.Body>
            </Card.Root>
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <Box>
      <Box bg="blue.700" color="white" py="20">
        <Container maxW="1200px" textAlign="center">
          <Heading size="2xl" mb="4">
            Коллеги
          </Heading>
          <Text fontSize="xl" mb="8" color="blue.100">
            Рабочее пространство для агентств, фрилансеров и их клиентов.
          </Text>
          <HStack gap="4" justify="center">
            <Button size="lg" colorPalette="blue" onClick={() => navigate("/register")}>
              Зарегистрироваться
            </Button>
            <Button
              size="lg"
              variant="outline"
              color="white"
              borderColor="white"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => navigate("/login")}
            >
              Войти
            </Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="1200px" py="16">
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap="6">
          {features.map((feature) => (
            <Card.Root key={feature.title} p="5">
              <Card.Body>
                <Heading size="md" mb="3" color="blue.700">
                  {feature.title}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {feature.description}
                </Text>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </Container>

      <Box bg="gray.50" py="12">
        <Container maxW="1200px" textAlign="center">
          <Heading size="md" mb="4">
            Готовы начать?
          </Heading>
          <Button colorPalette="blue" size="lg" onClick={() => navigate("/register")}>
            Создать аккаунт
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
