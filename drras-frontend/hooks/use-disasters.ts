"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Disaster, DisasterCreateInput, DisasterUpdateInput } from "@/lib/types";

const KEY = ["disasters"];

export function useDisasters() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<Disaster[]>("/disasters/")).data,
  });
}

export function useDisaster(id: number | null) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: async () => (await apiClient.get<Disaster>(`/disasters/${id}`)).data,
    enabled: id !== null,
  });
}

export function useCreateDisaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DisasterCreateInput) =>
      (await apiClient.post<Disaster>("/disasters/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateDisaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: DisasterUpdateInput }) =>
      (await apiClient.put<Disaster>(`/disasters/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteDisaster() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/disasters/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
