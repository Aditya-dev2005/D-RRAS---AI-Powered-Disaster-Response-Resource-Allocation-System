"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AllocationResponse, ResourceType } from "@/lib/types";

export function useOptimizeAllocation() {
  return useMutation({
    mutationFn: async ({
      resource_type,
      capacity,
    }: {
      resource_type: ResourceType;
      capacity: number;
    }) =>
      (
        await apiClient.post<AllocationResponse>("/allocation/optimize", null, {
          params: { resource_type, capacity },
        })
      ).data,
  });
}
