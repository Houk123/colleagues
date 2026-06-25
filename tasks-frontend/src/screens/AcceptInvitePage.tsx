"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { useAcceptInvite } from "@/features/invite/model/useInvites";

export default function AcceptInvitePage({ token }: { token: string }) {
  const router = useRouter();
  const acceptInvite = useAcceptInvite();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    acceptInvite.mutate(token, {
      onSuccess: () => setDone(true),
      onError: (err: any) => setError(err?.response?.data?.error || "Ошибка"),
    });
  }, [token]);

  return (
    <Box p="6" maxW="400px" mx="auto" mt="10">
      <Stack gap="4" align="center">
        <Heading size="md">Приглашение</Heading>
        {acceptInvite.isPending && <Text>Принимаем приглашение...</Text>}
        {done && (
          <>
            <Text color="green.600">Приглашение принято! Вы добавлены к порталу/проекту.</Text>
            <Button onClick={() => router.push("/")} colorPalette="blue">На главную</Button>
          </>
        )}
        {error && (
          <>
            <Text color="red.500">{error}</Text>
            <Button onClick={() => router.push("/")} colorPalette="blue">На главную</Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
