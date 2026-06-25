import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/entities/user/model/authStore.js";
import { useMe, useLogout } from "@/features/auth/model/useAuth.js";
import { Box, Spinner } from "@chakra-ui/react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuthStore();
  const logout = useLogout();
  const { isLoading: isMeLoading, isError } = useMe();

  if (!token || isError) {
    if (isError && token) logout();
    return <Navigate to="/login" replace />;
  }

  if (isMeLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return <>{children}</>;
}
