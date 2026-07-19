import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CreateJobInput,
  createJob,
  deleteJob,
  getJob as getJobById,
  type JobFilters,
  listJobs,
  type UpdateJobInput,
  updateJob,
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

export async function patchJob(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: UpdateJobInput;
}) {
  const job = await updateJob(ctx.params.id, ctx.auth.agencyId, ctx.body ?? {});
  if (!job) return status(404, "Job not found");
  return { data: job };
}

export async function removeJob(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const result = await deleteJob(ctx.params.id, ctx.auth.agencyId);
  if (!result) return status(404, "Job not found");
  return { data: result };
}
