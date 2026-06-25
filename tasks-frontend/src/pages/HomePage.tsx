import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
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
  Skeleton,
} from "@chakra-ui/react";
import { useAuthStore } from "@/entities/user/model/authStore";
import SEO from "@/shared/ui/SEO";
import {
  FiLayers,
  FiCheckSquare,
  FiDollarSign,
  FiMessageSquare,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const features = [
  {
    icon: FiLayers,
    title: "Порталы",
    description: "Отдельные пространства для клиентов и направлений бизнеса.",
  },
  {
    icon: FiCheckSquare,
    title: "Задачи и канбан",
    description: "Ведите статусы, приоритеты, сроки и исполнителей.",
  },
  {
    icon: FiDollarSign,
    title: "Финансы",
    description: "Кошельки проектов, бюджеты и прозрачная отчётность.",
  },
  {
    icon: FiMessageSquare,
    title: "Чат и уведомления",
    description: "Общение внутри задач и проектов в реальном времени.",
  },
  {
    icon: FiUsers,
    title: "Команда",
    description: "Роли, приглашения и совместная работа с клиентами.",
  },
  {
    icon: FiShield,
    title: "Контроль доступа",
    description: "JWT-аутентификация и журнал изменений.",
  },
];

function FeatureCard({ icon: Icon, title, description, cardRef }: { icon: React.ElementType; title: string; description: string; cardRef?: React.Ref<HTMLDivElement> }) {
  return (
    <Card.Root ref={cardRef} p="6" h="full" borderWidth="1px" borderColor="gray.200" bg="white" _hover={{ shadow: "lg", borderColor: "blue.300" }} transition="all 0.2s">
      <Card.Body>
        <Box w="12" h="12" borderRadius="lg" bg="blue.50" display="flex" alignItems="center" justifyContent="center" mb="4">
          <Icon size={24} color="#2563eb" />
        </Box>
        <Heading size="md" mb="2" color="gray.900">
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.600" lineHeight="1.6">
          {description}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

function DashboardMockup() {
  return (
    <Box
      w="full"
      maxW="560px"
      bg="white"
      borderRadius="2xl"
      shadow="2xl"
      overflow="hidden"
      borderWidth="1px"
      borderColor="whiteAlpha.300"
    >
      <Box h="12" bg="gray.50" borderBottomWidth="1px" borderColor="gray.100" display="flex" alignItems="center" px="4" gap="2">
        <Box w="3" h="3" borderRadius="full" bg="red.400" />
        <Box w="3" h="3" borderRadius="full" bg="yellow.400" />
        <Box w="3" h="3" borderRadius="full" bg="green.400" />
        <Box flex="1" />
        <Box h="5" w="32" bg="gray.200" borderRadius="full" />
      </Box>
      <Box p="5">
        <Stack gap="4">
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" mb="2">Активные проекты</Text>
            <HStack gap="3" flexWrap="wrap">
              {["Acme Corp", "DevStudio", "Pixel Agency"].map((name) => (
                <Box key={name} px="3" py="2" bg="blue.50" borderRadius="md" borderLeft="3px solid" borderColor="blue.500">
                  <Text fontSize="sm" fontWeight="medium" color="blue.900">{name}</Text>
                </Box>
              ))}
            </HStack>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" mb="2">Канбан</Text>
            <HStack gap="2" align="stretch">
              {["К выполнению", "В работе", "Готово"].map((col, i) => (
                <Box key={col} flex="1" bg="gray.50" borderRadius="md" p="2">
                  <Text fontSize="xs" fontWeight="medium" color="gray.600" mb="2">{col}</Text>
                  {i < 2 && (
                    <Box p="2" bg="white" borderRadius="md" shadow="sm" mb="2">
                      <Box w="full" h="2" bg="blue.100" borderRadius="full" mb="2" />
                      <Box w="2/3" h="2" bg="gray.100" borderRadius="full" />
                    </Box>
                  )}
                </Box>
              ))}
            </HStack>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" mb="2">Кошелёк</Text>
            <Box p="3" bg="green.50" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" color="gray.700">Баланс</Text>
              <Text fontSize="lg" fontWeight="bold" color="green.700">₽ 128 400</Text>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function LogoBar() {
  const names = ["Acme", "DevStudio", "Pixel", "North", "Quantum"];
  return (
    <Box bg="white" borderBottomWidth="1px" borderColor="gray.100" py="8">
      <Container maxW="1200px">
        <Text textAlign="center" fontSize="sm" color="gray.500" mb="5">
          Доверяют команды и агентства
        </Text>
        <HStack gap="8" justify="center" flexWrap="wrap" opacity="0.6">
          {names.map((name) => (
            <Text key={name} fontSize="xl" fontWeight="800" color="gray.400" letterSpacing="-0.02em">
              {name}
            </Text>
          ))}
        </HStack>
      </Container>
    </Box>
  );
}

function HomeSkeleton() {
  return (
    <Container maxW="1200px" py="10">
      <Stack gap="8">
        <Box>
          <Skeleton h="8" w="320px" mb="3" />
          <Skeleton h="5" w="480px" />
        </Box>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          {[1, 2, 3].map((i) => (
            <Card.Root key={i} p="5">
              <Card.Body>
                <Skeleton h="10" w="10" borderRadius="md" mb="3" />
                <Skeleton h="5" w="140px" mb="2" />
                <Skeleton h="4" w="full" />
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.dataset.revealChildren === "true" ? Array.from(element.children) : [element];
    const y = Number(element.dataset.revealY || "30");
    const delay = Number(element.dataset.revealDelay || "0");
    const staggerMs = Number(element.dataset.revealStagger || "0");

    children.forEach((child) => {
      (child as HTMLElement).style.opacity = "0";
      (child as HTMLElement).style.transform = `translateY(${y}px)`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            try {
              animate(children, {
                opacity: [0, 1],
                y: [y, 0],
                duration: 600,
                delay: staggerMs > 0 ? stagger(staggerMs, { start: delay }) : delay,
                ease: "outCubic",
              });
            } catch {
              children.forEach((child) => {
                (child as HTMLElement).style.opacity = "1";
                (child as HTMLElement).style.transform = "translateY(0)";
              });
            }
            observer.unobserve(element);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

export default function HomePage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const featuresHeaderRef = useScrollReveal<HTMLDivElement>();
  const featuresGridRef = useScrollReveal<HTMLDivElement>();
  const stepsHeaderRef = useScrollReveal<HTMLDivElement>();
  const stepsRef = useScrollReveal<HTMLDivElement>();
  const testimonialsRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !heroRef.current) return;
    const elements = Array.from(heroRef.current.querySelectorAll("[data-animate]"));
    elements.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(24px)";
    });
    try {
      animate(elements, {
        opacity: [0, 1],
        y: [24, 0],
        duration: 600,
        delay: stagger(100, { start: 100 }),
        ease: "outCubic",
      });
    } catch {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "translateY(0)";
      });
    }
  }, [ready]);

  useEffect(() => {
    if (!ready || !mockupRef.current) return;
    try {
      animate(mockupRef.current, {
        y: [0, -12, 0],
        duration: 5000,
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    } catch {
      // ignore
    }
  }, [ready]);

  if (!ready) {
    return <HomeSkeleton />;
  }

  if (token) {
    return (
      <Container maxW="1200px" py="10">
        <Stack gap="8">
          <Box>
            <Heading mb="2" size="xl">Добро пожаловать в Коллеги</Heading>
            <Text color="gray.600" fontSize="lg">Выберите раздел, чтобы продолжить работу.</Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portals")} _hover={{ shadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
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

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/join-portal")} _hover={{ shadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
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

            <Card.Root p="5" cursor="pointer" onClick={() => navigate("/portal-requests")} _hover={{ shadow: "md", borderColor: "blue.300" }} transition="all 0.2s">
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
      <SEO
        title="Коллеги — рабочее пространство для агентств и фрилансеров"
        description="Управляйте порталами, проектами, задачами, финансами и коммуникациями в одной платформе. Бесплатно для команд до 5 человек."
      />
      {/* Hero */}
      <Box bg="#0f172a" color="white" position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="-20%"
          right="-10%"
          w="700px"
          h="700px"
          borderRadius="full"
          bg="blue.600"
          opacity="0.15"
          filter="blur(100px)"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="-15%"
          w="600px"
          h="600px"
          borderRadius="full"
          bg="blue.500"
          opacity="0.1"
          filter="blur(100px)"
        />

        <Container maxW="1200px" position="relative" zIndex="1" py={{ base: "20", md: "28" }}>
          <Stack gap="12">
            <Flex direction={{ base: "column", lg: "row" }} gap="12" align="center" justify="space-between">
              <div ref={heroRef} style={{ maxWidth: "560px" }}>
                <Stack gap="6">
                  <div data-animate>
                    <Badge size="lg" colorPalette="blue" borderRadius="full" px="4" py="1" w="fit-content">
                      Бесплатно для команд до 5 человек
                    </Badge>
                  </div>
                  <div data-animate>
                    <Heading size="4xl" lineHeight="1.1" letterSpacing="-0.03em">
                      Порядок в проектах, без хаоса в таблицах
                    </Heading>
                  </div>
                  <div data-animate>
                    <Text fontSize="xl" color="slate.300" lineHeight="1.6">
                      Коллеги объединяют порталы, задачи, финансы и коммуникации агентств и продуктовых команд в одном рабочем пространстве.
                    </Text>
                  </div>
                  <div data-animate>
                    <HStack gap="4" flexWrap="wrap">
                      <Button
                        size="lg"
                        bg="white"
                        color="#0f172a"
                        _hover={{ bg: "slate.100" }}
                        px="8"
                        onClick={() => navigate("/register")}
                      >
                        Начать бесплатно
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        color="white"
                        borderColor="whiteAlpha.300"
                        _hover={{ bg: "whiteAlpha.100" }}
                        px="8"
                        onClick={() => navigate("/login")}
                      >
                        У меня есть аккаунт
                      </Button>
                    </HStack>
                  </div>
                  <div data-animate>
                    <HStack gap="6" mt="2" flexWrap="wrap">
                      <HStack gap="2">
                        <Box as={FiCheckCircle} color="blue.400" />
                        <Text fontSize="sm" color="slate.300">Без карты</Text>
                      </HStack>
                      <HStack gap="2">
                        <Box as={FiCheckCircle} color="blue.400" />
                        <Text fontSize="sm" color="slate.300">Настройка за минуту</Text>
                      </HStack>
                      <HStack gap="2">
                        <Box as={FiCheckCircle} color="blue.400" />
                        <Text fontSize="sm" color="slate.300">Российский продукт</Text>
                      </HStack>
                    </HStack>
                  </div>
                </Stack>
              </div>

              <Box position="relative" w="full" maxW="600px" display="flex" justifyContent="center">
                <div ref={mockupRef}>
                  <DashboardMockup />
                </div>
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  display={{ base: "none", lg: "block" }}
                  className="hero-badge"
                >
                  <Box
                    p="3"
                    bg="white"
                    borderRadius="lg"
                    shadow="xl"
                    borderLeft="4px solid"
                    borderColor="green.500"
                  >
                    <Text fontSize="xs" fontWeight="bold" color="gray.900">Счёт оплачен</Text>
                    <Text fontSize="xs" color="gray.500">Acme Corp · ₽ 48 000</Text>
                  </Box>
                </Box>
                <Box
                  position="absolute"
                  bottom="-10px"
                  left="-10px"
                  display={{ base: "none", lg: "block" }}
                  className="hero-badge"
                >
                  <Box
                    p="3"
                    bg="blue.600"
                    borderRadius="lg"
                    shadow="xl"
                  >
                    <Text fontSize="xs" fontWeight="bold" color="white">3 задачи на сегодня</Text>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Stack>
        </Container>
      </Box>

      <LogoBar />

      {/* Features */}
      <Box bg="slate.50" py={{ base: "20", md: "28" }}>
        <Container maxW="1200px">
          <Stack gap="16">
            <div ref={featuresHeaderRef} data-reveal-y="40">
              <Box textAlign="center" maxW="640px" mx="auto">
                <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="3" textTransform="uppercase" letterSpacing="wide">
                  Возможности
                </Text>
                <Heading size="3xl" mb="4" letterSpacing="-0.02em">
                  Всё, что нужно для работы с клиентами
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  Замените несколько инструментов одной платформой. Задачи, финансы, коммуникации и команда — в одном месте.
                </Text>
              </Box>
            </div>

            <div ref={featuresGridRef} data-reveal-children="true" data-reveal-stagger="100">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
                {features.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </SimpleGrid>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Workflow timeline */}
      <Box bg="white" py={{ base: "20", md: "28" }} overflow="hidden">
        <Container maxW="1200px">
          <Stack gap="16">
            <div ref={stepsHeaderRef} data-reveal-y="40">
              <Box textAlign="center" maxW="640px" mx="auto">
                <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb="3" textTransform="uppercase" letterSpacing="wide">
                  Как это работает
                </Text>
                <Heading size="3xl" mb="4" letterSpacing="-0.02em">
                  От регистрации до первого проекта
                </Heading>
                <Text fontSize="lg" color="gray.600">
                  Три простых шага без долгих настроек и обучения.
                </Text>
              </Box>
            </div>

            <div ref={stepsRef} data-reveal-children="true" data-reveal-stagger="150">
              <Flex direction={{ base: "column", lg: "row" }} gap={{ base: "8", lg: "4" }} position="relative" align="stretch">
                {/* Connector line — desktop */}
                <Box
                  display={{ base: "none", lg: "block" }}
                  position="absolute"
                  top="40px"
                  left="16%"
                  right="16%"
                  h="2px"
                  bg="linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)"
                  opacity="0.3"
                />

                {[
                  {
                    icon: FiLayers,
                    title: "Создайте портал",
                    desc: "Отдельное пространство для клиента или направления бизнеса. 30 секунд на старт.",
                  },
                  {
                    icon: FiUsers,
                    title: "Пригласите команду",
                    desc: "Назначьте роли: владелец, менеджер, исполнитель или клиент.",
                  },
                  {
                    icon: FiCheckSquare,
                    title: "Ведите работу",
                    desc: "Создавайте задачи, отслеживайте бюджет и общайтесь в чатах.",
                  },
                ].map((step, i) => (
                  <Stack key={step.title} align={{ base: "flex-start", lg: "center" }} textAlign={{ base: "left", lg: "center" }} gap="4" h="full" flex="1">
                    <Box
                      w="16"
                      h="16"
                      borderRadius="full"
                      bg="blue.600"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="lg"
                      shadowColor="blue.200"
                      position="relative"
                      zIndex="1"
                    >
                      <step.icon size={28} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="blue.600" mb="1">
                        Шаг {i + 1}
                      </Text>
                      <Heading size="md" mb="2" color="gray.900">
                        {step.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                        {step.desc}
                      </Text>
                    </Box>
                  </Stack>
                ))}
              </Flex>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* Social proof */}
      <Box bg="#0f172a" color="white" py={{ base: "20", md: "28" }}>
        <Container maxW="1200px">
          <Stack gap="16">
            <div ref={testimonialsRef} data-reveal-y="40">
              <Box textAlign="center" maxW="640px" mx="auto">
                <Text fontSize="sm" fontWeight="semibold" color="blue.400" mb="3" textTransform="uppercase" letterSpacing="wide">
                  Отзывы
                </Text>
                <Heading size="3xl" mb="4" letterSpacing="-0.02em">
                  Что говорят команды
                </Heading>
              </Box>
            </div>

            <div data-reveal-children="true" data-reveal-stagger="120">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
                {[
                  { text: "Коллеги заменили нам Trello, Excel и переписку в Telegram. Всё в одном месте.", author: "Анна К.", role: "Project Manager" },
                  { text: "Наконец-то видно, сколько времени уходит на каждый проект и сколько он приносит.", author: "Дмитрий В.", role: "CEO, DevStudio" },
                  { text: "Клиенты видят статус задач без доступа к внутренним процессам. Очень удобно.", author: "Марина С.", role: "Product Owner" },
                ].map((t) => (
                  <Card.Root key={t.author} p="6" bg="whiteAlpha.50" borderWidth="1px" borderColor="whiteAlpha.200" h="full">
                    <Card.Body>
                      <Text fontSize="md" color="slate.200" mb="8" lineHeight="1.7">
                        "{t.text}"
                      </Text>
                      <Box>
                        <Text fontWeight="semibold" color="white">{t.author}</Text>
                        <Text fontSize="sm" color="slate.400">{t.role}</Text>
                      </Box>
                    </Card.Body>
                  </Card.Root>
                ))}
              </SimpleGrid>
            </div>
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box bg="blue.600" color="white" py={{ base: "20", md: "24" }}>
        <Container maxW="1200px">
          <div ref={ctaRef} data-reveal-y="30">
            <Flex direction={{ base: "column", md: "row" }} gap="8" align="center" justify="space-between">
              <Stack gap="4" maxW="560px">
                <Heading size="3xl" letterSpacing="-0.02em">
                  Готовы навести порядок в проектах?
                </Heading>
                <Text fontSize="lg" color="blue.100">
                  Присоединяйтесь к командам, которые уже используют Коллеги.
                </Text>
              </Stack>
              <Button
                size="lg"
                bg="white"
                color="blue.700"
                _hover={{ bg: "blue.50" }}
                px="8"
                h="14"
                onClick={() => navigate("/register")}
              >
                <HStack gap="2">
                  <Text>Создать аккаунт бесплатно</Text>
                  <FiArrowRight />
                </HStack>
              </Button>
            </Flex>
          </div>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="#0f172a" color="slate.400" py="10" borderTopWidth="1px" borderColor="whiteAlpha.100">
        <Container maxW="1200px">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
            <HStack gap="2">
              <Box w="8" h="8" borderRadius="md" bg="blue.600" display="flex" alignItems="center" justifyContent="center" color="white" fontWeight="800">
                К
              </Box>
              <Text fontWeight="bold" color="white">Коллеги</Text>
            </HStack>
            <Text fontSize="sm">© 2026 Коллеги. Все права защищены.</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
