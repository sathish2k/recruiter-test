import type { AuthClaims } from "../plugins/auth-guard";
import {
  getTeamActivity as getTeamActivityService,
  type TeamActivityFilters,
} from "../services/team-activity.service";

export async function getTeamActivity(ctx: {
  auth: AuthClaims;
  query: TeamActivityFilters;
}) {
  return getTeamActivityService(ctx.auth.agencyId, ctx.query ?? {});
}
