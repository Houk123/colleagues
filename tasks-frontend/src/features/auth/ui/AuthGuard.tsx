import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/entities/user/model/authStore.js";
import { useMe } from "@/features/auth/model/useAuth.js";
import { Box, Spinner } from "@chakra-ui/react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { token, isLoading } = useAuthStore();
  const { isLoading: isMeLoading } = useMe();

  if (isLoading || isMeLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
