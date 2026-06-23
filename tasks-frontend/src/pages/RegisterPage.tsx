import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, Stack, Heading, Text, Link } from "@chakra-ui/react";
import { useRegister } from "@/features/auth/model/useAuth.js";
import { useNavigate } from "react-router-dom";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
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
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt="20" p="6" borderWidth="1px" borderRadius="lg">
      <Heading mb="6" textAlign="center">Регистрация</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="4">
          <Box>
            <Input placeholder="Имя" {...register("name")} />
            {errors.name && <Text color="red.500" fontSize="sm">{errors.name.message}</Text>}
          </Box>
          <Box>
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <Text color="red.500" fontSize="sm">{errors.email.message}</Text>}
          </Box>
          <Box>
            <Input placeholder="Пароль" type="password" {...register("password")} />
            {errors.password && <Text color="red.500" fontSize="sm">{errors.password.message}</Text>}
          </Box>
          <Button type="submit" loading={isSubmitting || registerMutation.isPending} colorScheme="blue">
            Зарегистрироваться
          </Button>
          {registerMutation.isError && (
            <Text color="red.500" fontSize="sm">{registerMutation.error?.message || "Ошибка регистрации"}</Text>
          )}
        </Stack>
      </form>
      <Text mt="4" textAlign="center">
        Уже есть аккаунт? <Link href="/login">Войти</Link>
      </Text>
    </Box>
  );
}
