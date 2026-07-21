import { endpoints } from "@/services/api/endpoints";
import type {
  ApiResponse,
  CvBatchUploadItem,
  CvUploadResult,
  UploadProgressCallback,
} from "@/services/api/types/cv-upload";
import { env } from "@/services/env";

const buildUrl = (path: string) => {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const parseErrorMessage = (responseText: string, status: number) => {
  try {
    const parsed = JSON.parse(responseText) as {
      message?: string;
      error?: string;
    };

    return (
      parsed.message ??
      parsed.error ??
      `La solicitud falló con el código ${status}.`
    );
  } catch {
    return `La solicitud falló con el código ${status}.`;
  }
};

const sendMultipartRequest = <TResponse>(
  path: string,
  formData: FormData,
  onProgress?: UploadProgressCallback
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", buildUrl(path));
    request.responseType = "text";

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.min(
        100,
        Math.round((event.loaded / event.total) * 100)
      );

      onProgress?.(progress);
    };

    request.onerror = () => {
      reject(
        new Error(
          "No se pudo conectar con el servidor para cargar las hojas de vida."
        )
      );
    };

    request.onabort = () => {
      reject(new Error("La carga de hojas de vida fue cancelada."));
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(parseErrorMessage(request.responseText, request.status))
        );
        return;
      }

      try {
        resolve(JSON.parse(request.responseText) as TResponse);
      } catch {
        reject(new Error("El servidor devolvió una respuesta inválida."));
      }
    };

    request.send(formData);
  });
};

export const uploadSingleCv = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<CvUploadResult> => {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await sendMultipartRequest<ApiResponse<CvUploadResult>>(
    endpoints.uploadSingleCv,
    formData,
    onProgress
  );

  return response.data;
};

export const uploadBatchCvs = async (
  files: File[],
  onProgress?: UploadProgressCallback
): Promise<CvBatchUploadItem[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  const response = await sendMultipartRequest<ApiResponse<CvBatchUploadItem[]>>(
    endpoints.uploadBatchCvs,
    formData,
    onProgress
  );

  return response.data;
};
