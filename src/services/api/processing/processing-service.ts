import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type {
  BatchClassificationResponse,
  ExtractionResponse,
  NormalizationResponse,
  RankingResponse,
} from "@/services/api/types/processing";

export const extractCandidateSource = async (
  sourceId: string
): Promise<ExtractionResponse["data"]> => {
  const response = await apiClient<ExtractionResponse>(
    endpoints.extractCandidateSource(sourceId),
    {
      method: "POST",
    }
  );

  return response.data;
};

export const normalizeCandidateSource = async (
  sourceId: string
): Promise<NormalizationResponse["data"]> => {
  const response = await apiClient<NormalizationResponse>(
    endpoints.normalizeCandidateSource(sourceId),
    {
      method: "POST",
    }
  );

  return response.data;
};

export const classifyCandidateProfiles = async ({
  jobProfileId,
  candidateProfileIds,
  topK,
}: {
  jobProfileId: string;
  candidateProfileIds: string[];
  topK: number;
}): Promise<BatchClassificationResponse["data"]> => {
  const response = await apiClient<BatchClassificationResponse>(
    endpoints.classifyCandidateProfiles(jobProfileId),
    {
      method: "POST",
      body: {
        created_by: null,
        auto_retrain: false,
        persist_result: true,
        top_k: topK,
        candidate_profile_ids: candidateProfileIds,
      },
    }
  );

  return response.data;
};

export const getProcessingRanking = async (
  processingRunId: string,
  limit: number
): Promise<RankingResponse["data"]> => {
  const response = await apiClient<RankingResponse>(
    endpoints.processingRunRanking(processingRunId),
    {
      queryParams: {
        limit,
      },
    }
  );

  return response.data;
};
