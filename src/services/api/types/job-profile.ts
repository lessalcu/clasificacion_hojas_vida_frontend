export type JobProfile = {
  id: string;
  created_by?: string | null;
  title: string;
  description?: string | null;
  required_skills?: string[];
  technologies?: string[];
  experience_requirement?: string | null;
  education_requirement?: string | null;
  languages?: string[];
  created_at?: string;
  updated_at?: string;
};

export type JobProfilePayload = {
  created_by?: string | null;
  title: string;
  description?: string | null;
  required_skills: string[];
  technologies: string[];
  experience_requirement?: string | null;
  education_requirement?: string | null;
  languages: string[];
};

export type ApiListResponse<TData> = {
  data: TData[];
};

export type ApiResponse<TData> = {
  data: TData;
};
