import { env } from "@/services/env";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type ApiClientOptions = Omit<RequestInit, "body"> & {
  queryParams?: QueryParams;
  body?: unknown;
};

const buildUrl = (path: string, queryParams?: QueryParams) => {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}${normalizedPath}`);

  Object.entries(queryParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const getErrorMessage = async (response: Response) => {
  try {
    const errorBody = await response.json();

    if (typeof errorBody?.message === "string") {
      return errorBody.message;
    }

    if (typeof errorBody?.error === "string") {
      return errorBody.error;
    }

    return `Error ${response.status}: ${response.statusText}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
};

const buildBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
};

export const apiClient = async <TResponse>(
  path: string,
  options: ApiClientOptions = {}
): Promise<TResponse> => {
  const { queryParams, headers, body, ...restOptions } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path, queryParams), {
    ...restOptions,
    body: buildBody(body),
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
};
