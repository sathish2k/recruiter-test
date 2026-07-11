import axios, { type AxiosInstance } from "axios";

let apiToken: string | undefined;

export function setApiToken(token?: string) {
  apiToken = token;
}

export function createApiClient(
  getToken?: () => string | undefined,
): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = getToken?.() ?? apiToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return client;
}
