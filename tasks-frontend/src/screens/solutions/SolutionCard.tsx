import { Card, Heading, Text, HStack, Stack } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";

interface SolutionCardProps {
  question: string;
  description: string;
  onClick?: () => void;
}

export function SolutionCard({ question, description, onClick }: SolutionCardProps) {
  return (
    <Card.Root
      p="5"
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      h="full"
      display="flex"
      flexDirection="column"
      cursor={onClick ? "pointer" : undefined}
      _hover={onClick ? { borderColor: "blue.400", shadow: "md", transform: "translateY(-2px)" } : undefined}
      transition="transform 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease"
      onClick={onClick}
    >
      <Card.Body h="full" display="flex" flexDirection="column">
        <Stack gap="3" h="full" justifyContent="space-between">
          <Stack gap="3">
            <Heading size="md" color="gray.900" lineHeight="1.4">
              {question}
            </Heading>
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">
              {description}
            </Text>
          </Stack>
          <HStack gap="2" color="blue.600" fontSize="sm" fontWeight="semibold">
            <Text>Как решаем</Text>
            <FiArrowRight />
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
