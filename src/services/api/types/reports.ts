export type ExecutionTraceSummary = {
  processing_run_id: string;
  execution_status?: string | null;
  input_type?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;

  job_profile_id?: string | null;
  job_profile_title?: string | null;

  model_version_id?: string | null;
  model_algorithm?: string | null;
  model_version_tag?: string | null;
  model_status?: string | null;

  total_candidates: number;
  successful_candidates: number;
  failed_candidates: number;

  error_message?: string | null;

  max_score_0_100: number;
  min_score_0_100: number;
  average_score_0_100: number;

  model_selection?: {
    selected_algorithm?: string | null;
    selected_model_version_id?: string | null;
    selection_reason?: string | null;
    selection_criteria?: string | null;
  };

  benchmark_summary?: string | null;
};

export type ProcessingRunTrace = {
  id: string;
  job_profile_id?: string | null;
  model_version_id?: string | null;
  input_type?: string | null;
  status?: string | null;
  total_candidates?: number | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  error_message?: string | null;
  trace_summary?: Record<string, unknown> | null;
};

export type TraceJobProfile = {
  id: string;
  title: string;
  description?: string | null;
  required_skills?: unknown[];
  technologies?: unknown[];
  languages?: unknown[];
};

export type TraceModelVersion = {
  id: string;
  model_name?: string | null;
  algorithm?: string | null;
  version_tag?: string | null;
  status?: string | null;
  dataset_version?: string | null;
  selection_reason?: string | null;
  metrics?: Record<string, unknown> | null;
  created_at?: string | null;
  activated_at?: string | null;
};

export type ModelBenchmarkItem = {
  model_version_id?: string | null;
  algorithm?: string | null;
  model_name?: string | null;
  version_tag?: string | null;
  status?: string | null;
  dataset_version?: string | null;

  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  duration_ms?: number | null;

  train_size?: number | null;
  test_size?: number | null;

  is_selected?: boolean;
  selection_comment?: string | null;
};

export type ModelBenchmark = {
  selection_criteria?: string | null;
  selected_algorithm?: string | null;
  selected_model_version_id?: string | null;
  selection_reason?: string | null;
  dataset_version?: string | null;
  models: ModelBenchmarkItem[];
};

export type TraceClassificationResult = {
  classification_result_id?: string | null;
  candidate_profile_id?: string | null;
  candidate_pseudonym_code?: string | null;
  predicted_label?: boolean | null;
  score_0_100?: number | null;
  rank_position?: number | null;
  match_summary?: Record<string, unknown>;
  created_at?: string | null;
};

export type ExecutionTraceData = {
  summary: ExecutionTraceSummary;
  processing_run: ProcessingRunTrace;
  job_profile: TraceJobProfile | null;
  active_model: TraceModelVersion | null;
  model_version: TraceModelVersion | null;
  model_benchmark: ModelBenchmark;
  results: TraceClassificationResult[];
  generated_at: string;
};

export type ExecutionTraceResponse = {
  success: boolean;
  message: string;
  data: ExecutionTraceData;
};