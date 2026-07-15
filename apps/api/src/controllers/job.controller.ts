import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CreateJobInput,
  createJob,
  getJob as getJobById,
  type JobFilters,
  listJobs,
} from "../services/job.service";

export async function getJobs(ctx: { auth: AuthClaims; query: JobFilters }) {
  const { data, totalCount } = await listJobs(
    ctx.auth.agencyId,
    ctx.query ?? {},
  );
  return { data, meta: { totalCount } };
}

export async function getJob(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const job = await getJobById(ctx.params.id, ctx.auth.agencyId);
  if (!job) return status(404, "Job not found");
  return { data: job };
}

export async function postJob(ctx: { auth: AuthClaims; body: CreateJobInput }) {
  return createJob(ctx.body, ctx.auth.agencyId);
}
