"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createJobProfile,
  deleteJobProfile,
  getJobProfileById,
  getJobProfiles,
  updateJobProfile,
} from "@/services/api/job-profiles/job-profile-service";
import type {
  CreateJobProfilePayload,
  UpdateJobProfilePayload,
} from "@/services/api/types/job-profile";

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
    mutationFn: (payload: CreateJobProfilePayload) => createJobProfile(payload),
    onSuccess: (createdProfile) => {
      queryClient.setQueryData(
        jobProfileQueryKeys.detail(createdProfile.id),
        createdProfile
      );

      void queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });
    },
  });
};

export const useUpdateJobProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateJobProfilePayload;
    }) => updateJobProfile(id, payload),
    onSuccess: (updatedProfile, variables) => {
      queryClient.setQueryData(
        jobProfileQueryKeys.detail(variables.id),
        updatedProfile
      );

      void queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteJobProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteJobProfile(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({
        queryKey: jobProfileQueryKeys.detail(id),
      });

      void queryClient.invalidateQueries({
        queryKey: jobProfileQueryKeys.all,
      });
    },
  });
};
