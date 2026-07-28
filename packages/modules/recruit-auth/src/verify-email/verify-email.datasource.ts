import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface VerifyPayload {
  action: "send" | "confirm" | "confirmLink";
  email?: string;
  code?: string;
  token?: string;
}

/** The API's shape when it refuses — surfaced to the component as-is. */
interface VerifyFailure {
  code?: string;
  retryAfter?: number;
}

function reject(cause: unknown): never {
  const body = (cause as { response?: { data?: VerifyFailure } }).response?.data;
  throw { code: body?.code ?? "invalid", retryAfter: body?.retryAfter };
}

/**
 * One datasource for the three verify calls — `create` is the only mutation the
 * engine exposes, so the action rides in the payload.
 */
export const verifyEmailDatasource = (): DatasourceInstance => ({
  create: async (values: unknown) => {
    const { action, email, code, token } = values as VerifyPayload;
    try {
      const body =
        action === "confirmLink"
          ? (await httpClient.get("/auth/verify/link", { params: { token } })).data
          : action === "confirm"
            ? (await httpClient.post("/auth/verify/confirm", { email, code })).data
            : (await httpClient.post("/auth/verify/send", { email })).data;
      // The controllers answer in a `{ data }` envelope; the screen wants what
      // is inside it.
      return (body as { data?: unknown }).data ?? body;
    } catch (cause) {
      reject(cause);
    }
  },
});
