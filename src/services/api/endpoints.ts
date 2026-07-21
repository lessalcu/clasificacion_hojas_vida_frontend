export const endpoints = {
  jobProfiles: "/job-profiles",
  jobProfileById: (id: string) => `/job-profiles/${encodeURIComponent(id)}`,
} as const;
