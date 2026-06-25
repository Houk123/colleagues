"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, Stack, Heading, Text, HStack } from "@chakra-ui/react";
import { useRegister } from "@/features/auth/model/useAuth";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerMutation.mutateAsync(data);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box
        w="full"
        maxW="420px"
        mx="auto"
        p="8"
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <HStack gap="3" justify="center" mb="8">
          <Box
            w="40px"
            h="40px"
            borderRadius="lg"
            bgGradient="linear(to-br, blue.500, blue.700)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="800"
            fontSize="xl"
          >
            К
          </Box>
          <Text fontSize="2xl" fontWeight="800" letterSpacing="-0.03em" color="blue.700">Коллеги</Text>
        </HStack>
        <Heading size="md" mb="6" textAlign="center" color="gray.700">Регистрация</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="4">
            <Box>
              <Input placeholder="Имя" size="lg" bg="gray.50" borderColor="gray.200" {...register("name")} />
              {errors.name && <Text color="red.500" fontSize="sm">{errors.name.message}</Text>}
            </Box>
            <Box>
              <Input placeholder="Email" type="email" size="lg" bg="gray.50" borderColor="gray.200" {...register("email")} />
              {errors.email && <Text color="red.500" fontSize="sm">{errors.email.message}</Text>}
            </Box>
            <Box>
              <Input placeholder="Пароль" type="password" size="lg" bg="gray.50" borderColor="gray.200" {...register("password")} />
              {errors.password && <Text color="red.500" fontSize="sm">{errors.password.message}</Text>}
            </Box>
            <Button type="submit" loading={isSubmitting || registerMutation.isPending} colorPalette="blue" size="lg" w="full">
              Зарегистрироваться
            </Button>
            {registerMutation.isError && (
              <Text color="red.500" fontSize="sm" textAlign="center">{registerMutation.error?.message || "Ошибка регистрации"}</Text>
            )}
          </Stack>
        </form>
        <Text mt="6" textAlign="center" fontSize="sm" color="gray.500">
          Уже есть аккаунт?{" "}
          <NextLink href="/login" style={{ color: "#2563eb", fontWeight: 500 }}>
            Войти
          </NextLink>
        </Text>
      </Box>
    </Box>
  );
}
