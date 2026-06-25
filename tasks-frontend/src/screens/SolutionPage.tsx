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
  Link,
} from "@chakra-ui/react";
import { FiArrowLeft, FiCheckCircle, FiArrowRight, FiInfo } from "react-icons/fi";
import { solutions, solutionBySlug, type SolutionFeature } from "./solutions/data";
import { SolutionCarousel } from "./solutions/SolutionCarousel";

const BASE_URL = "https://kollegi.ru";

function FeatureCard({ feature }: { feature: SolutionFeature }) {
  return (
    <Card.Root p="5" bg="white" borderColor="blue.100" borderWidth="1px">
      <Card.Body>
        <Stack gap="3" align="flex-start">
          <HStack gap="3">
            <Box as={FiCheckCircle} color="blue.600" mt="1" />
            <Text fontSize="md" color="gray.800" fontWeight="semibold">
              {feature.title}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" lineHeight="1.6">
            {feature.description}
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: `${BASE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Решения",
        item: `${BASE_URL}/solutions/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: solution.title,
        item: `${BASE_URL}/solutions/${solution.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: solution.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: solution.description,
        },
      },
      ...solution.features.map((feature) => ({
        "@type": "Question",
        name: feature.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: feature.description,
        },
      })),
    ],
  };

  return (
    <Box>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]),
        }}
      />
      <Box bg="#0f172a" color="white" py={{ base: "20", md: "28" }}>
        <Container maxW="1200px">
          <Stack gap="6">
            <HStack
              gap="2"
              fontSize="sm"
              color="slate.400"
              flexWrap="wrap"
              as="nav"
              aria-label="Breadcrumb"
            >
              <Link href="/" color="blue.300" _hover={{ color: "blue.200" }}>
                Главная
              </Link>
              <Text>/</Text>
              <Link href="/solutions" color="blue.300" _hover={{ color: "blue.200" }}>
                Решения
              </Link>
              <Text>/</Text>
              <Text color="slate.300">{solution.title}</Text>
            </HStack>
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
            <Heading as="h1" size="3xl" lineHeight="1.2" letterSpacing="-0.02em">
              {solution.question}
            </Heading>
            <Text fontSize="xl" color="slate.300" lineHeight="1.6">
              {solution.description}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Box py={{ base: "16", md: "24" }}>
        <Container maxW="1200px">
          <Stack gap="12" as="article">
            <Stack gap="8">
              {solution.content.map((block, i) => {
                const isHighlight = block.variant === "highlight";
                const isList = block.variant === "list";
                return (
                  <Box
                    key={i}
                    as="section"
                    bg={isHighlight ? "blue.50" : undefined}
                    borderTopWidth={isHighlight ? "4px" : undefined}
                    borderColor={isHighlight ? "blue.500" : undefined}
                    p={isHighlight ? "6" : undefined}
                    borderRadius={isHighlight ? "lg" : undefined}
                  >
                    <HStack gap="3" mb={isList ? "2" : "3"} align="flex-start">
                      {isHighlight && (
                        <Box as={FiInfo} color="blue.600" fontSize="22px" mt="0.5" flexShrink={0} />
                      )}
                      <Box
                        as={block.level === 3 ? "h3" : "h2"}
                        fontSize={block.level === 3 ? "1.25rem" : "1.5rem"}
                        fontWeight="bold"
                        color={isHighlight ? "blue.800" : "gray.900"}
                        lineHeight="1.3"
                      >
                        {block.heading}
                      </Box>
                    </HStack>
                    <Text fontSize="lg" color={isHighlight ? "blue.700" : "gray.700"} lineHeight="1.7" mb={isList ? "3" : undefined}>
                      {block.text}
                    </Text>
                    {isList && block.items && (
                      <Stack gap="2" as="ul" pl="4">
                        {block.items.map((item, idx) => (
                          <HStack key={idx} gap="3" align="flex-start" as="li">
                            <Box as={FiCheckCircle} color="blue.600" mt="1" flexShrink={0} />
                            <Text color="gray.700" lineHeight="1.6">
                              {item}
                            </Text>
                          </HStack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>

            <Box as="section">
              <Heading size="xl" mb="6" color="gray.900">
                Что помогает в Коллегах
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                {solution.features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </SimpleGrid>
            </Box>

            <Box as="section" bg="blue.600" color="white" p="8" borderRadius="xl">
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

            <Box as="section">
              <SolutionCarousel
                solutions={solutions.filter((s) => s.slug !== solution.slug)}
                title="Другие вопросы"
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
