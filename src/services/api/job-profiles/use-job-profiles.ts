"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJobProfile,
  deleteJobProfile,
  getJobProfileById,
  getJobProfiles,
  updateJobProfile,
} from "@/services/api/job-profiles/job-profile-service";
import type { JobProfilePayload } from "@/services/api/types/job-profile";

export const jobProfileQueryKeys = {
  all: ["job-profiles"] as const,
  detail: (id: string) => ["job-profiles", id] as const,
};

export const useJobProfiles = () => {
  return useQuery({
    queryKey: jobProfileQueryKeys.all,
    queryFn: getJobProfiles,
  });
};

export const useJobProfile = (id: string) => {
  return useQuery({
    queryKey: jobProfileQueryKeys.detail(id),
    queryFn: () => getJobProfileById(id),
    enabled: Boolean(id),
  });
};

export const useCreateJobProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJobProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });
    },
  });
};

export const useUpdateJobProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JobProfilePayload }) =>
      updateJobProfile(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteJobProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJobProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });
    },
  });
};
