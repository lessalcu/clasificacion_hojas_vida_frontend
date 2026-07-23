import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type {
  ProcessingRunResultData,
  ProcessingRunResultResponse,
} from "@/services/api/types/results";
import { env } from "@/services/env";

export const LAST_PROCESSING_RUN_STORAGE_KEY =
  "last_processing_run_id";

const inFlightResultRequests = new Map<
  string,
  Promise<ProcessingRunResultData>
>();

export const getProcessingRunResults = (
  processingRunId: string,
  limit?: number
): Promise<ProcessingRunResultData> => {
  const normalizedProcessingRunId =
    processingRunId.trim();

  if (!normalizedProcessingRunId) {
    return Promise.reject(
      new Error(
        "El identificador de la ejecución es obligatorio."
      )
    );
  }

  const requestKey = `${normalizedProcessingRunId}:${
    limit ?? "all"
  }`;

  const currentRequest =
    inFlightResultRequests.get(requestKey);

  if (currentRequest) {
    return currentRequest;
  }

  const request =
    apiClient<ProcessingRunResultResponse>(
      endpoints.processingRunResults(
        normalizedProcessingRunId
      ),
      {
        queryParams: {
          limit,
        },
      }
    )
      .then((response) => response.data)
      .finally(() => {
        inFlightResultRequests.delete(
          requestKey
        );
      });

  inFlightResultRequests.set(
    requestKey,
    request
  );

  return request;
};

const buildAbsoluteUrl = (
  path: string
): string => {
  const baseUrl =
    env.apiBaseUrl.replace(/\/$/, "");

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export const getCandidatePdfUrl = (
  sourceId: string,
  download = false
): string => {
  const path =
    endpoints.candidateSourceFile(
      sourceId
    );

  const url = new URL(
    buildAbsoluteUrl(path)
  );

  url.searchParams.set(
    "download",
    String(download)
  );

  return url.toString();
};

export const rememberLastProcessingRun = (
  processingRunId: string
): void => {
  if (
    typeof window === "undefined" ||
    !processingRunId
  ) {
    return;
  }

  window.localStorage.setItem(
    LAST_PROCESSING_RUN_STORAGE_KEY,
    processingRunId
  );
};

export const getRememberedProcessingRun =
  (): string => {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      window.localStorage.getItem(
        LAST_PROCESSING_RUN_STORAGE_KEY
      ) ?? ""
    );
  };