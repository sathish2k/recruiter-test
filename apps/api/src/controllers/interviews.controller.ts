import type { AuthClaims } from "../plugins/auth-guard";
import { getInterviews as getInterviewsService } from "../services/interviews.service";

export async function getInterviews(ctx: { auth: AuthClaims }) {
  return getInterviewsService(ctx.auth.agencyId);
}
