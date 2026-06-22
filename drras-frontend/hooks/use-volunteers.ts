"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Volunteer, SkillType } from "@/lib/types";

const KEY = ["volunteers"];

export function useVolunteers() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<Volunteer[]>("/volunteers/")).data,
  });
}

export function useRegisterVolunteer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      phone: string;
      email: string;
      skill_type: SkillType;
      city: string;
    }) => (await apiClient.post<Volunteer>("/volunteers/", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateVolunteerAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_available }: { id: number; is_available: boolean }) =>
      (await apiClient.patch<Volunteer>(`/volunteers/${id}/availability`, { is_available })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
