import axios from "axios";

let authToken: string | undefined;

export function setAuthToken(token?: string) {
  authToken = token;
}

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

httpClient.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  // Don't force a Content-Type: a hardcoded `application/json` default makes
  // axios JSON-stringify FormData bodies (dropping the File), which breaks
  // multipart uploads. Axios sets application/json for object payloads and a
  // boundaried multipart/form-data for FormData on its own.
  return config;
});
