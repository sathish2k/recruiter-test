import type { AuthClaims } from "../plugins/auth-guard";
import { getHomeDashboard as getHomeDashboardService } from "../services/dashboard.service";

export async function getHomeDashboard(ctx: { auth: AuthClaims }) {
  return getHomeDashboardService(ctx.auth.role, ctx.auth.sub);
}
