export type ProcessingStepStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type CandidateSourceProcessingData = {
  id: string;
  candidate_id: string;
  source_type: string;
  original_filename: string;
  extraction_status: string;
  extraction_error?: string | null;
  normalized_bucket?: string | null;
  normalized_path?: string | null;
  extracted_text_length?: number | null;
  extracted_at?: string | null;
};

export type ExtractionArtifact = {
  bucket: string;
  path: string;
  page_count: number;
  text_length: number;
  extractor: string;
  quality_score: number;
  block_count: number;
};

export type ExtractionData = {
  status: "processed" | "failed";
  candidate_source: CandidateSourceProcessingData;
  artifact?: ExtractionArtifact;
  reason?: string;
};

export type ExtractionResponse = {
  success: boolean;
  message: string;
  data: ExtractionData;
};

export type CandidateProfile = {
  id: string;
  candidate_id: string;
  source_id: string;
  source_type: string;
  pseudonym_code?: string | null;
  skills?: unknown[];
  technologies?: unknown[];
  experience_summary?: string | null;
  education_summary?: string | null;
  languages?: unknown[];
  keywords?: string[];
  raw_text?: string | null;
  normalized_text?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NormalizationData = {
  status: "generated";
  candidate_profile: CandidateProfile;
  sections_found: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    languages: boolean;
    courses: boolean;
  };
};

export type NormalizationResponse = {
  success: boolean;
  message: string;
  data: NormalizationData;
};

export type ClassificationScoreDetail = {
  model_score_0_100?: number;
  text_similarity_score_0_100?: number;
  final_score_0_100?: number;
  score_formula?: string;
};

export type ClassificationResult = {
  classification_result_id?: string | null;
  candidate_profile_id: string;
  predicted_label: boolean | null;
  raw_score_0_100?: number;
  score_0_100: number;
  rank_position?: number;
  score_detail?: ClassificationScoreDetail;
  model_version_id?: string;
  algorithm?: string;
  version_tag?: string;
  inference_text_length?: number;
  error?: string | null;
};

export type ActiveModelSummary = {
  id: string;
  algorithm?: string | null;
  version_tag?: string | null;
  status?: string | null;
  artifact_bucket?: string | null;
  artifact_path?: string | null;
};

export type BatchClassificationData = {
  job_profile_id: string;
  job_profile_title?: string | null;
  active_model: ActiveModelSummary;
  processing_run_id: string | null;
  reused_existing_run?: boolean;
  total_candidates: number;
  total_ranked: number;
  top_k: number | null;
  returned_results: number;
  results: ClassificationResult[];
  persisted_results_count: number;
};

export type BatchClassificationResponse = {
  success: boolean;
  message?: string;
  data: BatchClassificationData;
};

export type RankingData = {
  processing_run_id: string;
  job_profile_id?: string | null;
  model_version_id?: string | null;
  status: string;
  total_candidates?: number | null;
  limit?: number | null;
  returned_results: number;
  results: ClassificationResult[];
};

export type RankingResponse = {
  success: boolean;
  message?: string;
  data: RankingData;
};

export type ProcessingQueueState = {
  extractionStatus: ProcessingStepStatus;
  normalizationStatus: ProcessingStepStatus;
  classificationStatus: ProcessingStepStatus;
  candidateProfileId?: string;
  rankPosition?: number;
  predictedLabel?: boolean | null;
  score?: number;
  processingError?: string;
};
