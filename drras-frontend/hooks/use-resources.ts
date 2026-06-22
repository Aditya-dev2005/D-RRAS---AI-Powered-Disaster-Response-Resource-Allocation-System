"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Resource, ResourceType } from "@/lib/types";

const KEY = ["resources"];

export function useResources() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<Resource[]>("/resources/")).data,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { type: ResourceType; city: string; quantity_available: number; unit: string }) =>
      (await apiClient.post<Resource>("/resources/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateResourceQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity_available }: { id: number; quantity_available: number }) =>
      (await apiClient.put<Resource>(`/resources/${id}`, { quantity_available })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
