"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import type { AuthToken, User, UserRole } from "@/lib/types";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (input: { username: string; password: string }) =>
      (await apiClient.post<AuthToken>("/auth/login", input)).data,
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      toast.success(`Welcome back, ${data.user.username}`);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRegister() {
  const login = useLogin();

  return useMutation({
    mutationFn: async (input: {
      username: string;
      email: string;
      password: string;
      role: UserRole;
    }) => (await apiClient.post<User>("/auth/register", input)).data,
    onSuccess: (_data, variables) => {
      toast.success("Account created. Signing you in...");
      login.mutate({ username: variables.username, password: variables.password });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return () => {
    clearAuth();
    router.push("/login");
  };
}
