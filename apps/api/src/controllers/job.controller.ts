import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CreateJobInput,
  createJob,
  type JobFilters,
  listJobs,
} from "../services/job.service";

export async function getJobs(ctx: { auth: AuthClaims; query: JobFilters }) {
  const { data, totalCount } = await listJobs(ctx.query ?? {});
  return { data, meta: { totalCount } };
}

export async function postJob(ctx: { auth: AuthClaims; body: CreateJobInput }) {
  return createJob(ctx.body, ctx.auth.agencyId);
}
