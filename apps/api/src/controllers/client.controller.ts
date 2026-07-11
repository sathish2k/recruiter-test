import type { AuthClaims } from "../plugins/auth-guard";
import {
  type ClientFilters,
  createClient,
  listClients,
} from "../services/client.service";

export async function getClients(ctx: {
  auth: AuthClaims;
  query: ClientFilters;
}) {
  const { data, counts, summary, totalCount } = await listClients(
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
