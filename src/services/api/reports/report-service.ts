import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/api/endpoints";
import type {
  ExecutionTraceData,
  ExecutionTraceResponse,
} from "@/services/api/types/reports";

const inFlightRequests = new Map<
  string,
  Promise<ExecutionTraceData>
>();

export const getExecutionTrace = (
  processingRunId: string
): Promise<ExecutionTraceData> => {
  const normalizedProcessingRunId =
    processingRunId.trim();

  if (!normalizedProcessingRunId) {
    return Promise.reject(
      new Error(
        "El identificador de la ejecución es obligatorio."
      )
    );
  }

  const currentRequest = inFlightRequests.get(
    normalizedProcessingRunId
  );

  if (currentRequest) {
    return currentRequest;
  }

  const request =
    apiClient<ExecutionTraceResponse>(
      endpoints.processingRunTrace(
        normalizedProcessingRunId
      )
    )
      .then((response) => response.data)
      .finally(() => {
        inFlightRequests.delete(
          normalizedProcessingRunId
        );
      });

  inFlightRequests.set(
    normalizedProcessingRunId,
    request
  );

  return request;
};