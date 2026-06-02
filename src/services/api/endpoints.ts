export const endpoints = {
  jobProfiles: "/job-profiles",
  jobProfileById: (id: string) => `/job-profiles/${id}`,
} as const;
