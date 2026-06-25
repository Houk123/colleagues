"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/entities/user/model/authStore";
import { useMe } from "@/features/auth/model/useAuth";
import { Spinner, Center } from "@chakra-ui/react";

export function NextAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const { isLoading, isError } = useMe();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!token || isError) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [isLoading, token, isError, router]);

  if (isLoading || !ready) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.600" />
      </Center>
    );
  }

  return <>{children}</>;
}
