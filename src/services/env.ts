const getRequiredEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Falta configurar la variable de entorno: ${key}`);
  }

  return value;
};

export const env = {
  apiBaseUrl: getRequiredEnv(
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "NEXT_PUBLIC_API_BASE_URL"
  ),
  appName:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Clasificador de Hojas de Vida",
};