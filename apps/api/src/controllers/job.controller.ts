import type { AuthClaims } from "../plugins/auth-guard";
import { type JobFilters, listJobs } from "../services/job.service";

export async function getJobs(ctx: { auth: AuthClaims; query: JobFilters }) {
  const { data, totalCount } = await listJobs(ctx.query ?? {});
  return { data, meta: { totalCount } };
}
