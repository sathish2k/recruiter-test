import axios from "axios";

let authToken: string | undefined;
let onSessionLost: (() => void) | undefined;

export function setAuthToken(token?: string) {
  authToken = token;
}

/** Registered by AuthProvider. Called once when the API rejects a request the
 * session was supposed to authorise. */
export function setSessionLostHandler(handler?: () => void) {
  onSessionLost = handler;
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

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only a 401 against a request we *did* authorise means the session died
    // under the user. A 401 with no token is an ordinary unauthenticated call
    // (a public screen, or a race before the session resolves) and must not
    // throw the user out.
    if (error?.response?.status === 401 && authToken) onSessionLost?.();
    return Promise.reject(error);
  },
);
