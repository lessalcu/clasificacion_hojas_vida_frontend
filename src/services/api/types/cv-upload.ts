export type Candidate = {
  id: string;
  source_label?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CandidateSource = {
  id: string;
  candidate_id: string;
  source_type: "pdf" | string;
  original_filename: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  extraction_status: "pending" | "processed" | "failed" | string;
  normalized_bucket?: string | null;
  normalized_path?: string | null;
  extracted_text_length?: number | null;
  extracted_at?: string | null;
  extraction_error?: string | null;
  created_at?: string;
  updated_at?: string;
};


export type CvDocumentValidationResult = {
  valid: boolean;
  filename?: string | null;
  file_size_bytes?: number;
  page_count?: number;
  text_length?: number;
  required_sections?: string[];
  sections_found?: string[];
  missing_sections?: string[];
  missing_fields?: Record<string, string[]>;
  multi_column_pages?: number[];
  complex_table_pages?: number[];
  image_dominant_pages?: number[];
  errors: string[];
  warnings: string[];
};

export type CvUploadResult = {
  candidate: Candidate;
  candidate_source: CandidateSource;
  storage: {
    path: string;
    full_path?: string | null;
  };
  validation?: CvDocumentValidationResult;
};

export type CvBatchUploadItem =
  | {
      success: true;
      result: CvUploadResult;
    }
  | {
      success: false;
      filename?: string | null;
      error: string;
    };

export type ApiResponse<TData> = {
  success: boolean;
  message?: string;
  data: TData;
};

export type UploadProgressCallback = (progress: number) => void;
