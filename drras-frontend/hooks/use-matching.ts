"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MatchResponse } from "@/lib/types";

export function useRunMatching() {
  return useMutation({
    mutationFn: async () => (await apiClient.post<MatchResponse>("/matching/run")).data,
  });
}
