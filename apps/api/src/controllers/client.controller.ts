import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  type ClientFilters,
  createClient,
  decideSubmission,
  deleteClient,
  getClientDetail,
  listClients,
  type UpdateClientInput,
  updateClient,
} from "../services/client.service";

export async function getClients(ctx: {
  auth: AuthClaims;
  query: ClientFilters;
}) {
  const { data, counts, summary, totalCount } = await listClients(
    ctx.auth.agencyId,
    ctx.query ?? {},
  );
  return { data, meta: { totalCount, counts, summary } };
}

export async function postClient(ctx: {
  auth: AuthClaims;
  body: { name: string; industry?: string; manager?: string };
}) {
  return { data: await createClient(ctx.auth.agencyId, ctx.body) };
}

export async function getClient(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const client = await getClientDetail(ctx.params.id, ctx.auth.agencyId);
  if (!client) return status(404, "Client not found");
  return { data: client };
}

export async function patchClient(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: UpdateClientInput;
}) {
  const client = await updateClient(
    ctx.params.id,
    ctx.auth.agencyId,
    ctx.body ?? {},
  );
  if (!client) return status(404, "Client not found");
  return { data: client };
}

export async function removeClient(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const result = await deleteClient(ctx.params.id, ctx.auth.agencyId);
  if (!result) return status(404, "Client not found");
  return { data: result };
}

export async function patchSubmission(ctx: {
  auth: AuthClaims;
  params: { id: string; sid: string };
  body: { decision: "approved" | "rejected"; reason?: string };
}) {
  const result = await decideSubmission(
    ctx.params.id,
    ctx.params.sid,
    ctx.auth.agencyId,
    ctx.body.decision,
    ctx.body.reason ?? "",
  );
  if (!result) return status(404, "Submission not found");
  return { data: result };
}
