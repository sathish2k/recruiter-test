import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, getTableColumns, ilike, inArray, or } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import {
  type CandidateAddress,
  type CandidateAttachment,
  type CandidateStatus,
  candidate,
  type Education,
  type Experience,
} from "../models/candidate.model";
import { job } from "../models/job.model";

type CandidateRow = typeof candidate.$inferSelect;
type CandidateJoins = { jobTitle?: string | null; ownerName?: string | null };

function fullName(first: string, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim();
}

function mapCandidate(row: CandidateRow & CandidateJoins) {
  return {
    id: row.id,
    name: fullName(row.firstName, row.lastName),
    salutation: row.salutation ?? "",
    firstName: row.firstName,
    lastName: row.lastName ?? "",
    email: row.email ?? "",
    secondaryEmail: row.secondaryEmail ?? "",
    phone: row.phone ?? "",
    mobile: row.mobile ?? "",
    website: row.website ?? "",
    address: row.address ?? {},
    experienceYears: row.experienceYears ?? "",
    highestQualification: row.highestQualification ?? "",
    currentJobTitle: row.currentJobTitle ?? "",
    currentEmployer: row.currentEmployer ?? "",
    currentSalary: row.currentSalary ?? "",
    expectedSalary: row.expectedSalary ?? "",
    skillSet: row.skillSet ?? [],
    additionalInfo: row.additionalInfo ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    github: row.github ?? "",
    stackOverflow: row.stackOverflow ?? "",
    noticePeriod: row.noticePeriod ?? "",
    workAuthorization: row.workAuthorization ?? "",
    preferredLocation: row.preferredLocation ?? "",
    availability: row.availability ?? "open_to_offers",
    availableFrom: row.availableFrom?.toISOString() ?? "",
    offLimitsUntil: row.offLimitsUntil?.toISOString() ?? "",
    tags: row.tags ?? [],
    doNotContact: row.doNotContact,
    consentAt: row.consentAt?.toISOString() ?? "",
    salaryCurrency: row.salaryCurrency ?? "INR",
    openToRelocate: row.openToRelocate,
    openToRemote: row.openToRemote,
    education: row.education ?? [],
    experience: row.experience ?? [],
    resume: row.resume ?? [],
    formattedResume: row.formattedResume ?? [],
    coverLetter: row.coverLetter ?? [],
    offer: row.offer ?? [],
    contracts: row.contracts ?? [],
    attachments: row.attachments ?? [],
    jobId: row.jobId ?? "",
    jobTitle: row.jobTitle ?? "",
    startingStage: row.startingStage ?? "",
    status: row.status,
    ownerId: row.ownerId ?? "",
    ownerName: row.ownerName ?? "",
    source: row.source ?? "",
    emailOptOut: row.emailOptOut ?? false,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SORT_FIELDS = {
  name: candidate.firstName,
  status: candidate.status,
  createdAt: candidate.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListCandidatesParams {
  search?: string;
  status?: string;
  jobId?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

function withNames() {
  return db
    .select({ ...getTableColumns(candidate), jobTitle: job.title, ownerName: user.name })
    .from(candidate)
    .leftJoin(job, eq(candidate.jobId, job.id))
    .leftJoin(user, eq(candidate.ownerId, user.id));
}

export async function listCandidates(organizationId: string, params: ListCandidatesParams = {}) {
  const filters = [eq(candidate.organizationId, organizationId), eq(candidate.archived, false)];
  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(candidate.firstName, term),
      ilike(candidate.lastName, term),
      ilike(candidate.email, term),
    );
    if (match) filters.push(match);
  }
  const statuses = split(params.status);
  if (statuses.length) filters.push(inArray(candidate.status, statuses as CandidateStatus[]));
  const jobIds = split(params.jobId);
  if (jobIds.length) filters.push(inArray(candidate.jobId, jobIds));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? candidate.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows] = await Promise.all([
    withNames()
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(candidate).where(where),
  ]);
  return { data: rows.map(mapCandidate), totalCount: countRows[0]?.total ?? 0 };
}

export async function getCandidate(organizationId: string, id: string) {
  const [row] = await withNames()
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .limit(1);
  return row ? mapCandidate(row) : null;
}

export interface CandidateInput {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: CandidateAddress;
  experienceYears?: string;
  highestQualification?: string;
  currentJobTitle?: string;
  currentEmployer?: string;
  currentSalary?: string;
  expectedSalary?: string;
  skillSet?: string[];
  additionalInfo?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  stackOverflow?: string;
  noticePeriod?: string;
  workAuthorization?: string;
  preferredLocation?: string;
  availability?: string;
  tags?: string[];
  doNotContact?: boolean;
  salaryCurrency?: string;
  openToRelocate?: boolean;
  openToRemote?: boolean;
  education?: Education[];
  experience?: Experience[];
  resume?: CandidateAttachment[];
  formattedResume?: CandidateAttachment[];
  coverLetter?: CandidateAttachment[];
  offer?: CandidateAttachment[];
  contracts?: CandidateAttachment[];
  attachments?: CandidateAttachment[];
  jobId?: string;
  startingStage?: string;
  status?: string;
  ownerId?: string;
  source?: string;
  emailOptOut?: boolean;
}

const EDITABLE = [
  "salutation",
  "firstName",
  "lastName",
  "email",
  "secondaryEmail",
  "phone",
  "mobile",
  "website",
  "address",
  "experienceYears",
  "highestQualification",
  "currentJobTitle",
  "currentEmployer",
  "currentSalary",
  "expectedSalary",
  "skillSet",
  "additionalInfo",
  "linkedin",
  "twitter",
  "github",
  "stackOverflow",
  "noticePeriod",
  "workAuthorization",
  "preferredLocation",
  "availability",
  "tags",
  "doNotContact",
  "salaryCurrency",
  "openToRelocate",
  "openToRemote",
  "education",
  "experience",
  "resume",
  "formattedResume",
  "coverLetter",
  "offer",
  "contracts",
  "attachments",
  "jobId",
  "startingStage",
  "status",
  "ownerId",
  "source",
  "emailOptOut",
] as const;

function pickEditable(input: CandidateInput): Partial<CandidateRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] !== undefined) patch[field] = input[field] === "" ? null : input[field];
  }
  return patch as Partial<CandidateRow>;
}

export async function createCandidate(organizationId: string, input: CandidateInput) {
  const [created] = await db
    .insert(candidate)
    .values({
      id: randomUUID(),
      organizationId,
      firstName: input.firstName?.trim() || "Unnamed candidate",
      ...pickEditable({ ...input, firstName: undefined }),
    })
    .returning();
  return created ? mapCandidate(created) : null;
}

export async function updateCandidate(organizationId: string, id: string, input: CandidateInput) {
  const [updated] = await db
    .update(candidate)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .returning();
  return updated ? mapCandidate(updated) : null;
}

export async function deleteCandidate(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(candidate)
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}

/** §6.1 — archive, never delete. Distinct from erasure, which destroys data. */
export async function archiveCandidate(organizationId: string, id: string) {
  const [archived] = await db
    .update(candidate)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .returning();
  return archived ? { id: archived.id } : null;
}
