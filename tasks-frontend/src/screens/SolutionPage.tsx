"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Card,
  SimpleGrid,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { FiArrowLeft, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { solutions, solutionBySlug } from "./solutions/data";

export default function SolutionPage({ slug }: { slug: string }) {
  const router = useRouter();
  const solution = solutionBySlug(slug);

  if (!solution) {
    return (
      <Container maxW="1200px" py="20">
        <Stack gap="6" textAlign="center">
          <Heading size="2xl">Страница не найдена</Heading>
          <Text color="gray.600">Такого решения пока нет.</Text>
          <Button onClick={() => router.push("/")} w="fit-content" mx="auto">
            На главную
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Box>
      <Box bg="#0f172a" color="white" py={{ base: "16", md: "24" }}>
        <Container maxW="800px">
          <Stack gap="6">
            <Button
              variant="ghost"
              color="blue.300"
              w="fit-content"
              px="0"
              onClick={() => router.push("/")}
            >
              <HStack gap="2">
                <FiArrowLeft />
                <Text>На главную</Text>
              </HStack>
            </Button>
            <Badge colorPalette="blue" w="fit-content" borderRadius="full" px="4" py="1">
              Решение
            </Badge>
            <Heading size="3xl" lineHeight="1.2" letterSpacing="-0.02em">
              {solution.question}
            </Heading>
            <Text fontSize="xl" color="slate.300" lineHeight="1.6">
              {solution.description}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Box py={{ base: "16", md: "24" }}>
        <Container maxW="800px">
          <Stack gap="12">
            <Stack gap="6">
              {solution.content.map((paragraph, i) => (
                <Text key={i} fontSize="lg" color="gray.700" lineHeight="1.7">
                  {paragraph}
                </Text>
              ))}
            </Stack>

            <Box>
              <Heading size="xl" mb="6" color="gray.900">
                Что помогает в Коллегах
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {solution.features.map((feature) => (
                  <Card.Root key={feature} p="5" borderColor="blue.100" borderWidth="1px">
                    <Card.Body>
                      <HStack gap="3" align="flex-start">
                        <Box as={FiCheckCircle} color="blue.600" mt="1" />
                        <Text fontSize="md" color="gray.800">
                          {feature}
                        </Text>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </SimpleGrid>
            </Box>

            <Box bg="blue.600" color="white" p="8" borderRadius="xl">
              <Stack gap="4" textAlign="center">
                <Heading size="xl">{solution.cta}</Heading>
                <Text fontSize="lg" color="blue.100">
                  Бесплатно для команд до 5 человек. Настройка за минуту.
                </Text>
                <Button
                  size="lg"
                  bg="white"
                  color="blue.700"
                  _hover={{ bg: "blue.50" }}
                  px="8"
                  w="fit-content"
                  mx="auto"
                  onClick={() => router.push("/register")}
                >
                  <HStack gap="2">
                    <Text>Создать аккаунт</Text>
                    <FiArrowRight />
                  </HStack>
                </Button>
              </Stack>
            </Box>

            <Box>
              <Heading size="lg" mb="4" color="gray.900">
                Другие вопросы
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {solutions
                  .filter((s) => s.slug !== solution.slug)
                  .map((s) => (
                    <Card.Root
                      key={s.slug}
                      p="5"
                      cursor="pointer"
                      borderColor="gray.200"
                      borderWidth="1px"
                      _hover={{ borderColor: "blue.300", shadow: "md" }}
                      transition="all 0.2s"
                      onClick={() => router.push(`/solutions/${s.slug}`)}
                    >
                      <Card.Body>
                        <Text fontSize="md" color="gray.800" fontWeight="medium">
                          {s.question}
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  ))}
              </SimpleGrid>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
