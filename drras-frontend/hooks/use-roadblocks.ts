"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RoadBlock } from "@/lib/types";

const KEY = ["roadblocks"];

export function useRoadBlocks() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<RoadBlock[]>("/roadblocks/")).data,
    refetchInterval: 15_000,
  });
}

export function useCreateRoadSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      city_from: string;
      city_to: string;
      distance_km: number;
      traffic_level: number;
      is_blocked: boolean;
    }) => (await apiClient.post<RoadBlock>("/roadblocks/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useToggleRoadBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, block }: { id: number; block: boolean }) =>
      (
        await apiClient.patch<RoadBlock>(
          `/roadblocks/${id}/${block ? "block" : "unblock"}`
        )
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetTrafficLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, traffic_level }: { id: number; traffic_level: number }) =>
      (await apiClient.patch<RoadBlock>(`/roadblocks/${id}/traffic`, { traffic_level })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
