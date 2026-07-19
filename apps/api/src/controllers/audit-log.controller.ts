import type { AuthClaims } from "../plugins/auth-guard";
import { listAuditLog } from "../services/audit-log.service";

export async function getAuditLog(ctx: {
  auth: AuthClaims;
  query: { kind?: string };
}) {
  return listAuditLog(ctx.auth.agencyId, ctx.query.kind);
}
