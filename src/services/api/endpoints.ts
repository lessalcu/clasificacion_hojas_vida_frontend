export const endpoints = {
  jobProfiles: "/job-profiles",

  jobProfileById: (id: string) =>
    `/job-profiles/${encodeURIComponent(id)}`,

  uploadCandidate: "/candidates/upload",

  uploadCandidatesBatch:
    "/candidates/upload-batch",

  uploadSingleCv: "/candidates/upload",

  uploadBatchCvs:
    "/candidates/upload-batch",

  candidateUpload: "/candidates/upload",

  candidateBatchUpload:
    "/candidates/upload-batch",

  extractCandidateSource: (
    sourceId: string
  ) =>
    `/candidate-sources/${encodeURIComponent(
      sourceId
    )}/extract-text`,

  normalizeCandidateSource: (
    sourceId: string
  ) =>
    `/candidate-sources/${encodeURIComponent(
      sourceId
    )}/normalize-profile`,

  candidateProfileBySource: (
    sourceId: string
  ) =>
    `/candidate-sources/${encodeURIComponent(
      sourceId
    )}/profile`,

  candidateSourceFile: (
    sourceId: string
  ) =>
    `/candidate-sources/${encodeURIComponent(
      sourceId
    )}/file`,

  classifyCandidateProfiles: (
    jobProfileId: string
  ) =>
    `/inference/job-profiles/${encodeURIComponent(
      jobProfileId
    )}/batch`,

  processingRunRanking: (
    processingRunId: string
  ) =>
    `/inference/processing-runs/${encodeURIComponent(
      processingRunId
    )}/ranking`,

  processingRunResults: (
    processingRunId: string
  ) =>
    `/inference/processing-runs/${encodeURIComponent(
      processingRunId
    )}/results`,

  processingRunTrace: (
    processingRunId: string
  ) =>
    `/reports/processing-runs/${encodeURIComponent(
      processingRunId
    )}/trace`,
} as const;