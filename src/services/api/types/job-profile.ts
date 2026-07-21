export type JobProfile = {
  id: string;
  created_by?: string | null;
  title: string;
  description?: string | null;
  required_skills: string[];
  technologies: string[];
  experience_requirement?: string | null;
  education_requirement?: string | null;
  languages: string[];
  created_at?: string;
  updated_at?: string;
};

export type CreateJobProfilePayload = {
  title: string;
  description?: string;
  required_skills: string[];
  technologies: string[];
  experience_requirement?: string;
  education_requirement?: string;
  languages?: string[];
};

export type UpdateJobProfilePayload = Partial<CreateJobProfilePayload>;

export type JobProfilePayload = CreateJobProfilePayload;

export type ApiListResponse<TData> = {
  success?: boolean;
  data: TData[];
  message?: string;
};

export type ApiResponse<TData> = {
  success?: boolean;
  data: TData;
  message?: string;
};

export type JobProfilesApiResponse = ApiListResponse<JobProfile> | JobProfile[];

export type JobProfileApiResponse = ApiResponse<JobProfile> | JobProfile;

export type JobProfileRequestPayload = {
  title?: string;
  description?: string;
  required_skills?: string[];
  technologies?: string[];
  experience_requirement?: string;
  education_requirement?: string;
  languages?: string[];
};
