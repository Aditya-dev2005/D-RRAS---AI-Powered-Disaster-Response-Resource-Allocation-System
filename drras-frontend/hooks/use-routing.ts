"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { RouteResponse } from "@/lib/types";

export type RoutingAlgorithm = "shortest" | "safest" | "astar";

export function useComputeRoute() {
  return useMutation({
    mutationFn: async ({
      algorithm,
      source,
      destination,
    }: {
      algorithm: RoutingAlgorithm;
      source: string;
      destination: string;
    }) =>
      (
        await apiClient.get<RouteResponse>(`/routing/${algorithm}`, {
          params: { source, destination },
        })
      ).data,
  });
}
