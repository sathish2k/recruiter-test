import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";
import { type Account, PASSWORD } from "./helpers";

// The API runs on :3001 (the web app is :3001's consumer on :3000). These
// helpers drive it directly so tests can provision role accounts and seed
// state without clicking through the UI.
export const API = "http://localhost:3001";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

/** Register an agency admin straight through the API (skips the sign-up UI). */
export async function apiRegister(
  request: APIRequestContext,
  acct: Account,
): Promise<void> {
  const res = await request.post(`${API}/auth/register`, {
    data: {
      fullName: acct.name,
      agency: acct.agency,
      email: acct.email,
      password: acct.password,
    },
  });
  expect(res.ok(), `register ${acct.email}: ${res.status()}`).toBeTruthy();
}

/** Log in via the API and return the JWT + user record. */
export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
): Promise<{ token: string; user: ApiUser }> {
  const res = await request.post(`${API}/auth/login`, {
    data: { email, password },
  });
  expect(res.ok(), `login ${email}: ${res.status()}`).toBeTruthy();
  return res.json();
}

/** GET /users (admin-only). Returns the agency-wide user list. */
export async function apiGetUsers(
  request: APIRequestContext,
  token: string,
): Promise<ApiUser[]> {
  const res = await request.get(`${API}/users`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(res.ok(), `GET /users: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return body.data as ApiUser[];
}

/** Find a user id by email using an admin token. */
export async function apiFindUserId(
  request: APIRequestContext,
  token: string,
  email: string,
): Promise<string> {
  const users = await apiGetUsers(request, token);
  const match = users.find((u) => u.email === email);
  expect(match, `user ${email} not found in /users`).toBeTruthy();
  return (match as ApiUser).id;
}

/** PATCH a user's role (admin-only). */
export async function apiSetRole(
  request: APIRequestContext,
  token: string,
  id: string,
  role: string,
): Promise<void> {
  const res = await request.patch(`${API}/users/${id}/role`, {
    headers: { authorization: `Bearer ${token}` },
    data: { role },
  });
  expect(res.ok(), `PATCH role ${role}: ${res.status()}`).toBeTruthy();
}

/** Create a candidate via the API (defaults to the "Sourced" stage). */
export async function apiCreateCandidate(
  request: APIRequestContext,
  token: string,
  data: { firstName: string; lastName?: string; [k: string]: unknown },
): Promise<{ id: string }> {
  const res = await request.post(`${API}/candidates`, {
    headers: { authorization: `Bearer ${token}` },
    data,
  });
  expect(res.ok(), `POST /candidates: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return (body.data ?? body) as { id: string };
}

/** Create a job via the API. Returns the created job (with its id). */
export async function apiCreateJob(
  request: APIRequestContext,
  token: string,
  data: {
    title: string;
    client?: string;
    status?: string; // "Active" | "Draft" (anything else → Active)
    roleCat?: string;
    level?: string;
    location?: string;
    empType?: string;
    [k: string]: unknown;
  },
): Promise<{ id: string; title: string }> {
  const res = await request.post(`${API}/jobs`, {
    headers: { authorization: `Bearer ${token}` },
    data,
  });
  expect(res.ok(), `POST /jobs: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return (body.data ?? body) as { id: string; title: string };
}

/** Create a client via the API. Returns the created client (with its id). */
export async function apiCreateClient(
  request: APIRequestContext,
  token: string,
  data: { name: string; industry?: string; manager?: string },
): Promise<{ id: string; name: string }> {
  const res = await request.post(`${API}/clients`, {
    headers: { authorization: `Bearer ${token}` },
    data,
  });
  expect(res.ok(), `POST /clients: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return (body.data ?? body) as { id: string; name: string };
}

/** Move a candidate to a pipeline stage (PATCH /pipeline/:id/stage). */
export async function apiMoveStage(
  request: APIRequestContext,
  token: string,
  id: string,
  stage: string,
): Promise<void> {
  const res = await request.patch(`${API}/pipeline/${id}/stage`, {
    headers: { authorization: `Bearer ${token}` },
    data: { stage },
  });
  expect(res.ok(), `PATCH stage ${stage}: ${res.status()}`).toBeTruthy();
}

/**
 * Provision an account in a given role: register it (becomes admin), then have
 * an admin token PATCH it to the target role. Returns the account so the caller
 * can UI-log-in as it. A freshly-registered account is admin of its own agency,
 * so it can PATCH itself when no separate admin is supplied.
 */
export async function apiProvisionRole(
  request: APIRequestContext,
  acct: Account,
  role: string,
  adminToken?: string,
): Promise<void> {
  await apiRegister(request, acct);
  const token = adminToken ?? (await apiLogin(request, acct.email)).token;
  const id = await apiFindUserId(request, token, acct.email);
  await apiSetRole(request, token, id, role);
}
