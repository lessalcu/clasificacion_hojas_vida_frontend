import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  CreateJobProfilePayload,
  JobProfile,
  JobProfileApiResponse,
  JobProfileRequestPayload,
  JobProfilesApiResponse,
  UpdateJobProfilePayload,
} from "@/services/api/types/job-profile";

const unwrapJobProfile = (response: JobProfileApiResponse): JobProfile => {
  if (typeof response === "object" && response !== null && "data" in response) {
    return response.data;
  }

  return response;
};

const cleanString = (value: string | null | undefined): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleanedValue = value.trim();

  return cleanedValue.length > 0 ? cleanedValue : undefined;
};

const cleanStringList = (
  values: string[] | null | undefined
): string[] | undefined => {
  if (!Array.isArray(values)) {
    return undefined;
  }

  const uniqueValues = Array.from(
    new Map(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => [value.toLowerCase(), value])
    ).values()
  );

  return uniqueValues;
};

const sanitizeCreatePayload = (
  payload: CreateJobProfilePayload
): JobProfileRequestPayload => {
  const title = cleanString(payload.title);
  const description = cleanString(payload.description);
  const requiredSkills = cleanStringList(payload.required_skills) ?? [];
  const technologies = cleanStringList(payload.technologies) ?? [];
  const experienceRequirement = cleanString(payload.experience_requirement);
  const educationRequirement = cleanString(payload.education_requirement);
  const languages = cleanStringList(payload.languages) ?? [];

  if (!title) {
    throw new Error("El título del perfil es obligatorio.");
  }

  if (requiredSkills.length === 0) {
    throw new Error("Debe ingresar al menos una habilidad requerida.");
  }

  if (technologies.length === 0) {
    throw new Error("Debe ingresar al menos una tecnología.");
  }

  const sanitizedPayload: JobProfileRequestPayload = {
    title,
    required_skills: requiredSkills,
    technologies,
    languages,
  };

  if (description) {
    sanitizedPayload.description = description;
  }

  if (experienceRequirement) {
    sanitizedPayload.experience_requirement = experienceRequirement;
  }

  if (educationRequirement) {
    sanitizedPayload.education_requirement = educationRequirement;
  }

  return sanitizedPayload;
};

const sanitizeUpdatePayload = (
  payload: UpdateJobProfilePayload
): JobProfileRequestPayload => {
  const sanitizedPayload: JobProfileRequestPayload = {};

  if ("title" in payload) {
    const title = cleanString(payload.title);

    if (!title) {
      throw new Error("El título no puede quedar vacío.");
    }

    sanitizedPayload.title = title;
  }

  if ("description" in payload) {
    const description = cleanString(payload.description);

    if (description) {
      sanitizedPayload.description = description;
    }
  }

  if ("required_skills" in payload) {
    const requiredSkills = cleanStringList(payload.required_skills);

    if (!requiredSkills || requiredSkills.length === 0) {
      throw new Error("Debe ingresar al menos una habilidad requerida.");
    }

    sanitizedPayload.required_skills = requiredSkills;
  }

  if ("technologies" in payload) {
    const technologies = cleanStringList(payload.technologies);

    if (!technologies || technologies.length === 0) {
      throw new Error("Debe ingresar al menos una tecnología.");
    }

    sanitizedPayload.technologies = technologies;
  }

  if ("experience_requirement" in payload) {
    const experienceRequirement = cleanString(payload.experience_requirement);

    if (experienceRequirement) {
      sanitizedPayload.experience_requirement = experienceRequirement;
    }
  }

  if ("education_requirement" in payload) {
    const educationRequirement = cleanString(payload.education_requirement);

    if (educationRequirement) {
      sanitizedPayload.education_requirement = educationRequirement;
    }
  }

  if ("languages" in payload) {
    sanitizedPayload.languages = cleanStringList(payload.languages) ?? [];
  }

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new Error("No existen campos válidos para actualizar.");
  }

  return sanitizedPayload;
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
  payload: CreateJobProfilePayload
): Promise<JobProfile> => {
  const sanitizedPayload = sanitizeCreatePayload(payload);

  const response = await apiClient<JobProfileApiResponse>(
    endpoints.jobProfiles,
    {
      method: "POST",
      body: sanitizedPayload,
    }
  );

  return unwrapJobProfile(response);
};

export const updateJobProfile = async (
  id: string,
  payload: UpdateJobProfilePayload
): Promise<JobProfile> => {
  if (!id.trim()) {
    throw new Error("No se encontró el identificador del perfil.");
  }

  const sanitizedPayload = sanitizeUpdatePayload(payload);

  const response = await apiClient<JobProfileApiResponse>(
    endpoints.jobProfileById(id),
    {
      method: "PUT",
      body: sanitizedPayload,
    }
  );

  return unwrapJobProfile(response);
};

export const deleteJobProfile = async (id: string): Promise<void> => {
  if (!id.trim()) {
    throw new Error("No se encontró el identificador del perfil.");
  }

  await apiClient<unknown>(endpoints.jobProfileById(id), {
    method: "DELETE",
  });
};
