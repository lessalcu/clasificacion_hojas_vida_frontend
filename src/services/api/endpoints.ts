export const endpoints = {
  jobProfiles: "/job-profiles",
  jobProfileById: (id: string) => `/job-profiles/${encodeURIComponent(id)}`,
  uploadSingleCv: "/candidates/upload",
  uploadBatchCvs: "/candidates/upload-batch",
  extractCandidateSourceText: (sourceId: string) =>
    `/candidate-sources/${encodeURIComponent(sourceId)}/extract-text`,
  normalizeCandidateSourceProfile: (sourceId: string) =>
    `/candidate-sources/${encodeURIComponent(sourceId)}/normalize-profile`,
} as const;
