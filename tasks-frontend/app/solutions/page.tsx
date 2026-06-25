"use client";

import { useRouter } from "next/navigation";
import { Box, Container, Heading, SimpleGrid, Text, Stack } from "@chakra-ui/react";
import { solutions } from "@/screens/solutions/data";
import { SolutionCard } from "@/screens/solutions/SolutionCard";

export default function SolutionsPage() {
  const router = useRouter();

  return (
    <Box>
      <Box bg="#0f172a" color="white" py={{ base: "20", md: "28" }}>
        <Container maxW="1200px">
          <Stack gap="4">
            <Heading as="h1" size="3xl" lineHeight="1.2" letterSpacing="-0.02em">
              Решения для агентств и студий
            </Heading>
            <Text fontSize="xl" color="slate.300" lineHeight="1.6" maxW="720px">
              Практические сценарии, как убрать рутину из работы с клиентами и проектами.
            </Text>
          </Stack>
        </Container>
      </Box>
      <Box py={{ base: "16", md: "24" }}>
        <Container maxW="1200px">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
            {solutions.map((solution) => (
              <SolutionCard
                key={solution.slug}
                question={solution.question}
                description={solution.description}
                onClick={() => router.push(`/solutions/${solution.slug}`)}
              />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}
