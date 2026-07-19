import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CommissionPeriod,
  listCommissions,
  markCommissionPaid,
} from "../services/commission.service";

export async function getCommissions(ctx: {
  auth: AuthClaims;
  query: { period?: string };
}) {
  const period: CommissionPeriod =
    ctx.query.period === "year" ? "year" : "quarter";
  return listCommissions(ctx.auth.agencyId, period);
}

export async function patchCommissionPaid(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  return { data: await markCommissionPaid(ctx.auth.agencyId, ctx.params.id) };
}
