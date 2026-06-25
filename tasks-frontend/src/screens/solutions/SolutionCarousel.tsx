"use client";

import { useRouter } from "next/navigation";
import { Carousel, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { SolutionCard } from "./SolutionCard";

interface Solution {
  slug: string;
  question: string;
  description: string;
}

interface SolutionCarouselProps {
  solutions: Solution[];
  title?: string;
}

export function SolutionCarousel({ solutions, title }: SolutionCarouselProps) {
  const router = useRouter();

  return (
    <Carousel.Root
      autoplay
      loop={solutions.length > 1}
      slideCount={solutions.length}
      slidesPerPage={3}
      gap="3"
    >
      <HStack justify="space-between" mb="4">
        {title && <Text fontWeight="medium">{title}</Text>}
        <HStack>
          <Carousel.PrevTrigger asChild>
            <IconButton size="xs" variant="subtle" aria-label="Предыдущий">
              <LuChevronLeft />
            </IconButton>
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger asChild>
            <IconButton size="xs" variant="subtle" aria-label="Следующий">
              <LuChevronRight />
            </IconButton>
          </Carousel.NextTrigger>
        </HStack>
      </HStack>
      <Carousel.ItemGroup>
        {solutions.map((solution, index) => (
          <Carousel.Item key={solution.slug} index={index} p="2">
            <SolutionCard
              question={solution.question}
              description={solution.description}
              onClick={() => router.push(`/solutions/${solution.slug}`)}
            />
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
    </Carousel.Root>
  );
}
