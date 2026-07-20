import { listAuditActors, listAuditEvents } from "../services/audit-log.service";

type Auth = { id: string; agencyId?: string | null };

export async function getAuditEvents(ctx: {
  user: Auth;
  query: {
    search?: string;
    user?: string;
    category?: string;
    result?: string;
    range?: string;
    page?: string;
    pageSize?: string;
  };
}) {
  const { data, totalCount } = await listAuditEvents(ctx.user.agencyId ?? "", {
    search: ctx.query.search,
    user: ctx.query.user,
    category: ctx.query.category,
    result: ctx.query.result,
    range: ctx.query.range,
    page: ctx.query.page ? Number(ctx.query.page) : undefined,
    pageSize: ctx.query.pageSize ? Number(ctx.query.pageSize) : undefined,
  });
  return { data, meta: { totalCount } };
}

export async function getAuditActors(ctx: { user: Auth }) {
  const actors = await listAuditActors(ctx.user.agencyId ?? "");
  return { data: actors };
}
