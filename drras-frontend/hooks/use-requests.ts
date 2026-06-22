"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { EmergencyRequest, EmergencyRequestCreateInput, RequestStatus } from "@/lib/types";

const KEY = ["requests"];

export function useRequests() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<EmergencyRequest[]>("/requests/")).data,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EmergencyRequestCreateInput) =>
      (await apiClient.post<EmergencyRequest>("/requests/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: RequestStatus }) =>
      (await apiClient.patch<EmergencyRequest>(`/requests/${id}/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/requests/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
