"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Text,
  HStack,
  Flex,
  IconButton,
  Field,
  Container,
} from "@chakra-ui/react";
import { useLogin } from "@/features/auth/model/useAuth";
import { useRouter } from "next/navigation";
import { toaster } from "@/shared/ui/toaster";
import NextLink from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login.mutateAsync(data);
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось войти";
      toaster.create({
        title: "Ошибка входа",
        description: message,
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Box bg="gray.50" py={{ base: "8", md: "16" }}>
      <Container maxW="1200px" mx="auto" px={{ base: "4", md: "6" }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap="12"
          align="center"
          justify={{ base: "center", lg: "space-between" }}
        >
          <Box flex="1" maxW="480px" display={{ base: "none", lg: "block" }}>
            <Stack gap="6">
              <Heading size="3xl" lineHeight="1.2" letterSpacing="-0.02em" color="gray.900">
                Вход в рабочее пространство
              </Heading>
              <Text fontSize="lg" color="gray.600" lineHeight="1.7">
                Управляйте порталами, проектами, задачами и клиентами в одном месте. Бесплатно для команд до 5 человек.
              </Text>
              <Stack gap="3">
                {[
                  "Порталы для разных клиентов и направлений",
                  "Канбан, задачи и дедлайны",
                  "Финансы, трудозатраты и отчёты",
                  "Коммуникации внутри задач",
                ].map((item) => (
                  <HStack key={item} gap="3">
                    <Box as={FiCheckCircle} color="blue.600" fontSize="20px" />
                    <Text color="gray.700">{item}</Text>
                  </HStack>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box
            w="full"
            maxW="440px"
            p={{ base: "6", md: "8" }}
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Stack gap="2" mb="6" textAlign="center">
              <Heading size="lg" color="gray.900">С возвращением</Heading>
              <Text fontSize="sm" color="gray.500">Войдите, чтобы продолжить работу</Text>
            </Stack>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="5">
                <Field.Root invalid={!!errors.email}>
                  <Field.Label fontSize="sm" color="gray.700">Email</Field.Label>
                  <Input
                    placeholder="you@company.ru"
                    type="email"
                    size="lg"
                    pl="10"
                    {...register("email")}
                  />
                  <Box position="absolute" left="3" top="38px" color="gray.400" fontSize="20px">
                    <FiMail />
                  </Box>
                  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label fontSize="sm" color="gray.700">Пароль</Field.Label>
                  <Input
                    placeholder="Введите пароль"
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    pl="10"
                    pr="10"
                    {...register("password")}
                  />
                  <Box position="absolute" left="3" top="38px" color="gray.400" fontSize="20px">
                    <FiLock />
                  </Box>
                  <IconButton
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    right="2"
                    top="34px"
                    color="gray.400"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Button
                  type="submit"
                  loading={isSubmitting || login.isPending}
                  colorPalette="blue"
                  size="lg"
                  w="full"
                  borderRadius="lg"
                >
                  Войти
                </Button>

                {login.isError && (
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    {login.error?.message || "Ошибка входа"}
                  </Text>
                )}
              </Stack>
            </form>

            <Text mt="6" textAlign="center" fontSize="sm" color="gray.500">
              Нет аккаунта?{" "}
              <NextLink href="/register" style={{ color: "#2563eb", fontWeight: 500 }}>
                Зарегистрироваться
              </NextLink>
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
