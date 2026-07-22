export const endpoints = {
  jobProfiles: "/job-profiles",

  jobProfileById: (id: string) =>
    `/job-profiles/${encodeURIComponent(id)}`,

  /*
   * Endpoints de carga.
   *
   * Se conservan varios alias para no dañar el servicio de carga
   * que ya estaba funcionando antes de CHV-27.
   */
  uploadCandidate: "/candidates/upload",
  uploadCandidatesBatch: "/candidates/upload-batch",

  uploadSingleCv: "/candidates/upload",
  uploadBatchCvs: "/candidates/upload-batch",

  candidateUpload: "/candidates/upload",
  candidateBatchUpload: "/candidates/upload-batch",

  /*
   * Procesamiento CHV-27.
   */
  extractCandidateSource: (sourceId: string) =>
    `/candidate-sources/${encodeURIComponent(sourceId)}/extract-text`,

  normalizeCandidateSource: (sourceId: string) =>
    `/candidate-sources/${encodeURIComponent(sourceId)}/normalize-profile`,

  candidateProfileBySource: (sourceId: string) =>
    `/candidate-sources/${encodeURIComponent(sourceId)}/profile`,

  classifyCandidateProfiles: (jobProfileId: string) =>
    `/inference/job-profiles/${encodeURIComponent(jobProfileId)}/batch`,

  processingRunRanking: (processingRunId: string) =>
    `/inference/processing-runs/${encodeURIComponent(
      processingRunId
    )}/ranking`,
} as const;