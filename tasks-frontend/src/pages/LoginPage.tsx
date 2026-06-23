import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, Stack, Heading, Text, Link } from "@chakra-ui/react";
import { useLogin } from "@/features/auth/model/useAuth.js";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useLogin();
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
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt="20" p="6" borderWidth="1px" borderRadius="lg">
      <Heading mb="6" textAlign="center">Вход</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="4">
          <Box>
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <Text color="red.500" fontSize="sm">{errors.email.message}</Text>}
          </Box>
          <Box>
            <Input placeholder="Пароль" type="password" {...register("password")} />
            {errors.password && <Text color="red.500" fontSize="sm">{errors.password.message}</Text>}
          </Box>
          <Button type="submit" loading={isSubmitting || login.isPending} colorScheme="blue">
            Войти
          </Button>
          {login.isError && (
            <Text color="red.500" fontSize="sm">{login.error?.message || "Ошибка входа"}</Text>
          )}
        </Stack>
      </form>
      <Text mt="4" textAlign="center">
        Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
      </Text>
    </Box>
  );
}
