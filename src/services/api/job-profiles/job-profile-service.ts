import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  JobProfile,
  JobProfilePayload,
} from "@/services/api/types/job-profile";

type JobProfilesApiResponse = ApiListResponse<JobProfile> | JobProfile[];

type JobProfileApiResponse = ApiResponse<JobProfile> | JobProfile;

const unwrapJobProfile = (response: JobProfileApiResponse): JobProfile => {
  if ("data" in response) {
    return response.data;
  }

  return response;
};

export const getJobProfiles = async (): Promise<JobProfile[]> => {
  const response = await apiClient<JobProfilesApiResponse>(
    endpoints.jobProfiles
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
};

export const getJobProfileById = async (id: string): Promise<JobProfile> => {
  const response = await apiClient<JobProfileApiResponse>(
    endpoints.jobProfileById(id)
  );

  return unwrapJobProfile(response);
};

export const createJobProfile = async (
  payload: JobProfilePayload
): Promise<JobProfile> => {
  const response = await apiClient<JobProfileApiResponse>(
    endpoints.jobProfiles,
    {
      method: "POST",
      body: payload,
    }
  );

  return unwrapJobProfile(response);
};

export const updateJobProfile = async (
  id: string,
  payload: JobProfilePayload
): Promise<JobProfile> => {
  const response = await apiClient<JobProfileApiResponse>(
    endpoints.jobProfileById(id),
    {
      method: "PUT",
      body: payload,
    }
  );

  return unwrapJobProfile(response);
};

export const deleteJobProfile = async (id: string): Promise<void> => {
  await apiClient<void>(endpoints.jobProfileById(id), {
    method: "DELETE",
  });
};
