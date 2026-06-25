import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, type AuthUser } from "@/entities/user/model/authStore";
import { login, register, me } from "@/features/auth/api/authApi";

export type LoginInput = Parameters<typeof login>[0];
export type RegisterInput = Parameters<typeof register>[0];

export function useMe() {
  const { setUser, token } = useAuthStore();

  return useQuery<AuthUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      if (!token) return null;
      const user = await me();
      setUser(user);
      return user;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      queryClient.setQueryData(["me"], data.user);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
  };
}
