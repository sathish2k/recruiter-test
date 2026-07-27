import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, getTableColumns, ilike, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db";
import { user } from "../models/auth.model";
import { client } from "../models/client.model";
import { type JobAddress, type JobAttachment, type JobStatus, job } from "../models/job.model";

/** `user` is joined twice — once as the sourcer, once as the profile lead —
 * so the second join needs its own alias. */
const profileLead = alias(user, "profile_lead");

type JobRow = typeof job.$inferSelect;
type JobJoins = {
  clientName?: string | null;
  sourcerName?: string | null;
  profileLeadName?: string | null;
};

function toNumber(value?: string | null) {
  const n = Number(value ?? "");
  return Number.isFinite(n) ? n : 0;
}

function mapJob(row: JobRow & JobJoins) {
  return {
    id: row.id,
    title: row.title,
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    clientContactId: row.clientContactId ?? "",
    dateOpened: row.dateOpened ?? "",
    targetDate: row.targetDate ?? "",
    employmentType: row.employmentType ?? "",
    workExperience: row.workExperience ?? "",
    industry: row.industry ?? "",
    description: row.description ?? "",
    requirements: row.requirements ?? "",
    benefits: row.benefits ?? "",
    skills: row.skills ?? [],
    openings: row.openings,
    salaryMin: row.salaryMin ?? "",
    salaryMax: row.salaryMax ?? "",
    status: row.status,
    address: row.address ?? {},
    revenuePerPosition: row.revenuePerPosition ?? "",
    // Derived — revenue per position × openings.
    expectedRevenue: String(toNumber(row.revenuePerPosition) * row.openings),
    actualRevenue: row.actualRevenue ?? "",
    missedRevenue: row.missedRevenue ?? "",
    jobSummary: row.jobSummary ?? [],
    attachments: row.attachments ?? [],
    aiScreening: row.aiScreening,
    screeningCriteria: row.screeningCriteria ?? "",
    matchThreshold: row.matchThreshold,
    autoAdvance: row.autoAdvance,
    knockoutCount: row.knockoutCount,
    dailyDigest: row.dailyDigest,
    sourcerId: row.sourcerId ?? "",
    sourcerName: row.sourcerName ?? "",
    profileLeadId: row.profileLeadId ?? "",
    profileLeadName: row.profileLeadName ?? "",
    dailyInviteTarget: row.dailyInviteTarget,
    publishChannels: row.publishChannels ?? [],
    candidates: row.candidates,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SORT_FIELDS = {
  title: job.title,
  status: job.status,
  createdAt: job.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListJobsParams {
  search?: string;
  status?: string;
  clientId?: string;
  contactId?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

function withNames() {
  return db
    .select({
      ...getTableColumns(job),
      clientName: client.name,
      sourcerName: user.name,
      profileLeadName: profileLead.name,
    })
    .from(job)
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(user, eq(job.sourcerId, user.id))
    .leftJoin(profileLead, eq(job.profileLeadId, profileLead.id));
}

export async function listJobs(organizationId: string, params: ListJobsParams = {}) {
  const filters = [eq(job.organizationId, organizationId)];
  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(ilike(job.title, term), ilike(job.industry, term));
    if (match) filters.push(match);
  }
  const statuses = split(params.status);
  if (statuses.length) filters.push(inArray(job.status, statuses as JobStatus[]));
  const clientIds = split(params.clientId);
  if (clientIds.length) filters.push(inArray(job.clientId, clientIds));
  // Roles a given contact is attached to (their detail screen).
  if (params.contactId) filters.push(eq(job.clientContactId, params.contactId));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? job.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows] = await Promise.all([
    withNames()
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(job).where(where),
  ]);
  return { data: rows.map(mapJob), totalCount: countRows[0]?.total ?? 0 };
}

export async function getJob(organizationId: string, id: string) {
  const [row] = await withNames()
    .where(and(eq(job.id, id), eq(job.organizationId, organizationId)))
    .limit(1);
  return row ? mapJob(row) : null;
}

export interface JobInput {
  title?: string;
  clientId?: string;
  clientContactId?: string;
  dateOpened?: string;
  targetDate?: string;
  employmentType?: string;
  workExperience?: string;
  industry?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  skills?: string[];
  openings?: number;
  salaryMin?: string;
  salaryMax?: string;
  status?: string;
  address?: JobAddress;
  revenuePerPosition?: string;
  actualRevenue?: string;
  missedRevenue?: string;
  jobSummary?: JobAttachment[];
  attachments?: JobAttachment[];
  aiScreening?: boolean;
  screeningCriteria?: string;
  matchThreshold?: number;
  autoAdvance?: boolean;
  knockoutCount?: number;
  dailyDigest?: boolean;
  sourcerId?: string;
  profileLeadId?: string;
  dailyInviteTarget?: number;
  publishChannels?: string[];
}

const EDITABLE = [
  "title",
  "clientId",
  "clientContactId",
  "dateOpened",
  "targetDate",
  "employmentType",
  "workExperience",
  "industry",
  "description",
  "requirements",
  "benefits",
  "skills",
  "openings",
  "salaryMin",
  "salaryMax",
  "status",
  "address",
  "revenuePerPosition",
  "actualRevenue",
  "missedRevenue",
  "jobSummary",
  "attachments",
  "aiScreening",
  "screeningCriteria",
  "matchThreshold",
  "autoAdvance",
  "knockoutCount",
  "dailyDigest",
  "sourcerId",
  "profileLeadId",
  "dailyInviteTarget",
  "publishChannels",
] as const;

function pickEditable(input: JobInput): Partial<JobRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] !== undefined) patch[field] = input[field] === "" ? null : input[field];
  }
  return patch as Partial<JobRow>;
}

export async function createJob(organizationId: string, input: JobInput) {
  const [created] = await db
    .insert(job)
    .values({
      id: randomUUID(),
      organizationId,
      title: input.title?.trim() || "Untitled job",
      ...pickEditable({ ...input, title: undefined }),
    })
    .returning();
  return created ? mapJob(created) : null;
}

export async function updateJob(organizationId: string, id: string, input: JobInput) {
  const [updated] = await db
    .update(job)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(job.id, id), eq(job.organizationId, organizationId)))
    .returning();
  return updated ? mapJob(updated) : null;
}

export async function deleteJob(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(job)
    .where(and(eq(job.id, id), eq(job.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}
