export type CandidateAttributeItem = {
  name?: string;
  display?: string;
  canonical?: string;
  level?: string | null;
  sources?: string[];
};

export type CandidateResultProfile = {
  id: string;
  candidate_id: string;
  source_id: string;
  source_type: string;
  pseudonym_code?: string | null;
  skills: CandidateAttributeItem[];
  technologies: CandidateAttributeItem[];
  experience_summary: string;
  education_summary: string;
  languages: CandidateAttributeItem[];
  keywords: string[];
  created_at?: string;
  updated_at?: string;
};

export type CandidateResultSource = {
  id: string;
  candidate_id: string;
  source_type: string;
  original_filename: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  extraction_status?: string | null;
  created_at?: string;
};

export type RelevantMatches = {
  skills: string[];
  technologies: string[];
  languages: string[];
};

export type EnrichedCandidateResult = {
  classification_result_id?: string | null;
  processing_run_id: string;
  candidate_profile_id: string;
  predicted_label: boolean | null;
  score_0_100: number;
  rank_position?: number | null;
  match_summary: Record<string, unknown>;
  relevant_matches: RelevantMatches;
  candidate_profile:
    | CandidateResultProfile
    | null;
  candidate_source:
    | CandidateResultSource
    | null;
};

export type ProcessingRunResultSummary = {
  max_score_0_100: number;
  min_score_0_100: number;
  average_score_0_100: number;
  recommended_count: number;
  not_recommended_count: number;
};

export type ProcessingRunResultData = {
  processing_run: {
    id: string;
    job_profile_id?: string | null;
    model_version_id?: string | null;
    input_type?: string | null;
    status?: string | null;
    total_candidates?: number | null;
    started_at?: string | null;
    finished_at?: string | null;
    created_at?: string | null;
    error_message?: string | null;
  };

  job_profile: {
    id: string;
    title: string;
    description?: string | null;
  } | null;

  total_results: number;
  returned_results: number;
  summary: ProcessingRunResultSummary;
  results: EnrichedCandidateResult[];
};

export type ProcessingRunResultResponse = {
  success: boolean;
  message: string;
  data: ProcessingRunResultData;
};