import { status } from "elysia";
import {
  type ClientInput,
  clientStats,
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient,
} from "../services/client.service";

type Auth = { agencyId?: string | null };

export async function getClients(ctx: { user: Auth; query: Record<string, string | undefined> }) {
  const { data, totalCount } = await listClients(ctx.user.agencyId ?? "", {
    search: ctx.query.search,
    status: ctx.query.status,
    page: ctx.query.page ? Number(ctx.query.page) : undefined,
    pageSize: ctx.query.pageSize ? Number(ctx.query.pageSize) : undefined,
    sortKey: ctx.query.sortKey,
    sortDir: ctx.query.sortDir,
  });
  return { data, meta: { totalCount } };
}

export async function getClientStats(ctx: { user: Auth }) {
  return { data: await clientStats(ctx.user.agencyId ?? "") };
}

export async function getClientById(ctx: { user: Auth; params: { id: string } }) {
  const found = await getClient(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Client not found");
  return found;
}

export async function postClient(ctx: { user: Auth; body?: ClientInput | null }) {
  const created = await createClient(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!created) return status(422, "Could not create client");
  return status(201, { data: created });
}

export async function putClient(ctx: {
  user: Auth;
  params: { id: string };
  body?: ClientInput | null;
}) {
  const updated = await updateClient(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Client not found");
  return { data: updated };
}

export async function removeClient(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteClient(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Client not found");
  return { data: deleted };
}
