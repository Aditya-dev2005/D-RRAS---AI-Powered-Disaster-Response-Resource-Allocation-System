"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AISummaryResponse, AIAssistantResponse } from "@/lib/types";

export function useGenerateSummary() {
  return useMutation({
    mutationFn: async (disasterId: number) =>
      (await apiClient.get<AISummaryResponse>(`/ai/summary/${disasterId}`)).data,
  });
}

export function useAskAssistant() {
  return useMutation({
    mutationFn: async (question: string) =>
      (await apiClient.post<AIAssistantResponse>("/ai/assistant", { question })).data,
  });
}
