import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import { application } from "../models/application.model";
import { user } from "../models/auth.model";
import {
  type CandidateAddress,
  type CandidateAttachment,
  type CandidateStatus,
  candidate,
  type Education,
  type Experience,
} from "../models/candidate.model";
import { client } from "../models/client.model";
import { job } from "../models/job.model";
import { pipelineStage } from "../models/pipeline.model";
import { createApplication } from "./application.service";
import { workspaceSettings } from "./organization.service";

type CandidateRow = typeof candidate.$inferSelect;
type CandidateJoins = {
  jobTitle?: string | null;
  ownerName?: string | null;
  clientName?: string | null;
  stageName?: string | null;
};

function fullName(first: string, last?: string | null) {
  return [first, last].filter(Boolean).join(" ").trim();
}

function stageKey(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
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
    mergedIntoId: row.mergedIntoId ?? "",
    jobId: row.jobId ?? "",
    jobTitle: row.jobTitle ?? "",
    clientName: row.clientName ?? "",
    /** The live application's stage, falling back to the intake stage the
     * candidate was created with. Normalised to a lowercase key because the two
     * sources differ in case (pipeline stages are named "Screening", the intake
     * field stores "screening") and the list maps the key to a translated
     * label. */
    stage: stageKey(row.stageName ?? row.startingStage),
    matchScore: row.matchScore ?? null,
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
  role: job.title,
  stage: pipelineStage.position,
  match: candidate.matchScore,
  owner: user.name,
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
  client?: string;
  stage?: string;
  owner?: string;
  source?: string;
  /** One of QUICK_KEYS — the design's chip row. */
  quick?: string;
  /** The viewer, for the "My candidates" chip. */
  userId?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

/**
 * The list's row shape needs four joins: the requirement and its client for
 * ROLE & REQUISITION, the live application's stage for STAGE, and the owner.
 */
function withNames() {
  return (
    db
      .select({
        ...getTableColumns(candidate),
        jobTitle: job.title,
        clientName: client.name,
        ownerName: user.name,
        stageName: pipelineStage.name,
      })
      .from(candidate)
      .leftJoin(job, eq(candidate.jobId, job.id))
      .leftJoin(client, eq(job.clientId, client.id))
      .leftJoin(user, eq(candidate.ownerId, user.id))
      // Scoped to the associated requirement, not "any active application":
      // `application_candidate_job_unique` then guarantees at most one row, so a
      // candidate on several requirements cannot duplicate itself in the list.
      .leftJoin(
        application,
        and(eq(application.candidateId, candidate.id), eq(application.jobId, candidate.jobId)),
      )
      .leftJoin(pipelineStage, eq(application.stageId, pipelineStage.id))
  );
}

/** `withNames()`'s joins without the columns — the paged count runs against the
 * same shape so joined filters resolve. */
function countCandidates() {
  return db
    .select({ total: count() })
    .from(candidate)
    .leftJoin(job, eq(candidate.jobId, job.id))
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(user, eq(candidate.ownerId, user.id))
    .leftJoin(
      application,
      and(eq(application.candidateId, candidate.id), eq(application.jobId, candidate.jobId)),
    )
    .leftJoin(pipelineStage, eq(application.stageId, pipelineStage.id));
}

const NORMALISED_STAGE = sql`lower(replace(coalesce(${pipelineStage.name}, ${candidate.startingStage}), ' ', '_'))`;

/**
 * The design's quick-filter chips, as conditions. "mine" needs the viewer, so
 * it resolves to nothing when there is no session user rather than silently
 * matching every row.
 */
function quickCondition(quick?: string, userId?: string) {
  switch (quick) {
    case "mine":
      return userId ? eq(candidate.ownerId, userId) : sql`false`;
    // The talent pool is everyone not attached to a requirement.
    case "pool":
      return isNull(candidate.jobId);
    case "interviewing":
      return eq(NORMALISED_STAGE, "interview");
    case "offers":
      return eq(NORMALISED_STAGE, "offer");
    case "joined":
      return eq(candidate.status, "placed");
    case "rejected":
      return eq(candidate.status, "rejected");
    default:
      return undefined;
  }
}

const QUICK_KEYS = ["all", "mine", "pool", "interviewing", "offers", "joined", "rejected"] as const;

export async function listCandidates(organizationId: string, params: ListCandidatesParams = {}) {
  const filters = [eq(candidate.organizationId, organizationId), eq(candidate.archived, false)];
  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(candidate.firstName, term),
      ilike(candidate.lastName, term),
      ilike(candidate.email, term),
      ilike(candidate.currentJobTitle, term),
      ilike(candidate.currentEmployer, term),
      ilike(job.title, term),
      ilike(client.name, term),
    );
    if (match) filters.push(match);
  }
  const statuses = split(params.status);
  if (statuses.length) filters.push(inArray(candidate.status, statuses as CandidateStatus[]));
  const jobIds = split(params.jobId);
  if (jobIds.length) filters.push(inArray(candidate.jobId, jobIds));
  const clients = split(params.client);
  if (clients.length) filters.push(inArray(client.name, clients));
  // Matched against the same normalised key the row exposes, so filtering by
  // "Screening" also finds candidates whose stage is still the intake value.
  const stages = split(params.stage).map(stageKey);
  if (stages.length) filters.push(inArray(NORMALISED_STAGE, stages));
  const owners = split(params.owner);
  if (owners.length) filters.push(inArray(user.name, owners));
  const sources = split(params.source);
  if (sources.length) filters.push(inArray(candidate.source, sources));

  // The design's quick-filter chips. Kept separate from `where` so the chip
  // counts can be tallied against everything else the user has narrowed to.
  const base = and(...filters);
  const quick = quickCondition(params.quick, params.userId);
  const where = quick ? and(base, quick) : base;
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? candidate.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows, ...quickRows] = await Promise.all([
    withNames()
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    // Same joins as the row query — the filters and the search now reference
    // the requirement, client, owner and stage, so a bare count would not
    // resolve those columns.
    countCandidates().where(where),
    // Each chip counts against `base`, so the numbers describe what clicking it
    // would actually show given the filters already applied.
    ...QUICK_KEYS.map((key) => {
      const condition = quickCondition(key, params.userId);
      return countCandidates().where(condition ? and(base, condition) : base);
    }),
  ]);

  const quickCounts = Object.fromEntries(
    QUICK_KEYS.map((key, index) => [key, quickRows[index]?.[0]?.total ?? 0]),
  );
  return {
    data: rows.map(mapCandidate),
    totalCount: countRows[0]?.total ?? 0,
    quickCounts,
  };
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

export interface DuplicateQuery {
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  mobile?: string;
  linkedin?: string;
  excludeId?: string;
}

/** Which workspace identifiers a match was found on — the warning names them. */
export type DuplicateReason = "email" | "phone" | "linkedin";

const onlyDigits = (value?: string | null) => (value ?? "").replace(/\D/g, "");
const lower = (value?: string | null) => (value ?? "").trim().toLowerCase();

/**
 * The one duplicate check every intake path runs — the form, the import and
 * (once it exists) inbound apply. Which identifiers count is the workspace's
 * own setting, so a workspace that turns detection off is never nagged.
 *
 * "Resume hash" is offered in Settings but not implemented here: no hash is
 * stored yet, so selecting it simply contributes no matcher.
 */
export async function findDuplicateCandidates(organizationId: string, query: DuplicateQuery) {
  const settings = await workspaceSettings(organizationId, [
    "duplicateDetection",
    "duplicateIdentifiers",
  ]);
  if (settings.duplicateDetection === false) return [];
  const identifiers = new Set(
    Array.isArray(settings.duplicateIdentifiers) ? settings.duplicateIdentifiers.map(String) : [],
  );

  const emails = [lower(query.email), lower(query.secondaryEmail)].filter(Boolean);
  const phones = [onlyDigits(query.mobile), onlyDigits(query.phone)].filter(
    (value) => value.length >= 7,
  );
  const linkedin = lower(query.linkedin);

  const matchers = [];
  if (identifiers.has("Email")) {
    for (const email of emails) {
      matchers.push(ilike(candidate.email, email), ilike(candidate.secondaryEmail, email));
    }
  }
  if (identifiers.has("Phone")) {
    for (const phone of phones) {
      // Stored numbers carry the dial code and spacing the phone widget writes,
      // so both sides are compared as bare digits.
      matchers.push(
        sql`regexp_replace(coalesce(${candidate.mobile}, ''), '[^0-9]', '', 'g') = ${phone}`,
        sql`regexp_replace(coalesce(${candidate.phone}, ''), '[^0-9]', '', 'g') = ${phone}`,
      );
    }
  }
  if (identifiers.has("LinkedIn URL") && linkedin) {
    matchers.push(ilike(candidate.linkedin, linkedin));
  }

  const anyMatch = or(...matchers);
  if (!anyMatch) return [];

  const filters = [
    eq(candidate.organizationId, organizationId),
    eq(candidate.archived, false),
    anyMatch,
  ];
  if (query.excludeId) filters.push(ne(candidate.id, query.excludeId));

  const rows = await withNames()
    .where(and(...filters))
    .limit(5);
  return rows.map((row) => {
    const reasons: DuplicateReason[] = [];
    if (emails.includes(lower(row.email)) || emails.includes(lower(row.secondaryEmail))) {
      reasons.push("email");
    }
    if (phones.includes(onlyDigits(row.mobile)) || phones.includes(onlyDigits(row.phone))) {
      reasons.push("phone");
    }
    if (linkedin && lower(row.linkedin) === linkedin) reasons.push("linkedin");
    return { ...mapCandidate(row), matchedOn: reasons };
  });
}

export interface MergeInput {
  /** The losing record, archived and pointed at the survivor. Omitted when the
   * loser is an unsaved form the user chose to merge instead of create. */
  sourceId?: string;
  /** The values the user kept, field by field. */
  values: CandidateInput;
}

/**
 * Field-level merge (TC-CAN-002): the chosen values are written onto the
 * surviving record and the loser is archived, never deleted, with
 * `mergedIntoId` recording where its history went.
 */
export async function mergeCandidate(organizationId: string, targetId: string, input: MergeInput) {
  if (input.sourceId === targetId) throw new Error("A candidate cannot be merged into itself");

  return db.transaction(async (tx) => {
    const [merged] = await tx
      .update(candidate)
      .set({ ...pickEditable(input.values), updatedAt: new Date() })
      .where(and(eq(candidate.id, targetId), eq(candidate.organizationId, organizationId)))
      .returning();
    if (!merged) return null;

    if (input.sourceId) {
      await tx
        .update(candidate)
        .set({ archived: true, mergedIntoId: targetId, updatedAt: new Date() })
        .where(and(eq(candidate.id, input.sourceId), eq(candidate.organizationId, organizationId)));
    }
    return mapCandidate(merged);
  });
}

/** How many records one import may carry — a CSV is user input, not a job. */
export const IMPORT_LIMIT = 200;

export interface ImportRow {
  values: CandidateInput;
  /** What to do with this row. `merge` needs `targetId`. */
  mode?: "create" | "skip" | "merge";
  targetId?: string;
  /** Create even though the check found a match — the reviewer said so. */
  force?: boolean;
}

export interface ImportOutcome {
  index: number;
  status: "created" | "merged" | "skipped" | "duplicate";
  candidateId?: string;
  duplicates?: { id: string; name: string; matchedOn: DuplicateReason[] }[];
}

/**
 * The bulk path behind CV and CSV import. Every `create` row runs the same
 * `findDuplicateCandidates` check the form runs, so no path can slip a
 * duplicate in; a row the reviewer has not forced comes back as `duplicate`
 * rather than being written.
 */
export async function importCandidates(
  organizationId: string,
  rows: ImportRow[],
  defaults: CandidateInput = {},
  actor: { id?: string; name?: string | null } = {},
): Promise<ImportOutcome[]> {
  const outcomes: ImportOutcome[] = [];

  for (const [index, row] of rows.slice(0, IMPORT_LIMIT).entries()) {
    const values = { ...defaults, ...row.values };

    if (row.mode === "skip") {
      outcomes.push({ index, status: "skipped" });
      continue;
    }
    if (row.mode === "merge" && row.targetId) {
      const merged = await mergeCandidate(organizationId, row.targetId, { values });
      outcomes.push(
        merged ? { index, status: "merged", candidateId: merged.id } : { index, status: "skipped" },
      );
      continue;
    }

    if (!row.force) {
      const matches = await findDuplicateCandidates(organizationId, {
        email: values.email,
        secondaryEmail: values.secondaryEmail,
        phone: values.phone,
        mobile: values.mobile,
        linkedin: values.linkedin,
      });
      if (matches.length) {
        outcomes.push({
          index,
          status: "duplicate",
          duplicates: matches.map((match) => ({
            id: match.id,
            name: match.name,
            matchedOn: match.matchedOn,
          })),
        });
        continue;
      }
    }

    const created = await createCandidate(organizationId, values);
    // An imported candidate that names a requirement joins the board with the
    // rest — one intake path, one application record.
    if (created?.jobId) {
      await createApplication(organizationId, actor, {
        candidateId: created.id,
        jobId: created.jobId,
        ownerId: created.ownerId || undefined,
        source: "import",
      });
    }
    outcomes.push(
      created
        ? { index, status: "created", candidateId: created.id }
        : { index, status: "skipped" },
    );
  }
  return outcomes;
}

/** §6.1 — archive, never delete. Distinct from erasure, which destroys data. */
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
/** The match band the design's third tile counts. */
const STRONG_MATCH = 80;

/**
 * The four tiles above the Candidates list. Archived candidates are excluded
 * everywhere, the same way the list excludes them — a tile must never count a
 * row the table cannot show.
 */
export async function candidateStats(organizationId: string) {
  const where = and(eq(candidate.organizationId, organizationId), eq(candidate.archived, false));
  const monthAgo = new Date(Date.now() - MONTH_MS);
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [[pool], [addedThisMonth], [submitted], [strong], [unviewed], [joined], [joinedYtd]] =
    await Promise.all([
      db.select({ total: count() }).from(candidate).where(where),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, gte(candidate.createdAt, monthAgo))),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, eq(candidate.status, "active"))),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, gte(candidate.matchScore, STRONG_MATCH))),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, gte(candidate.matchScore, STRONG_MATCH), eq(candidate.status, "new"))),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, eq(candidate.status, "placed"))),
      db
        .select({ total: count() })
        .from(candidate)
        .where(and(where, eq(candidate.status, "placed"), gte(candidate.updatedAt, yearStart))),
    ]);

  // "Across N clients" — distinct clients the submitted candidates sit under.
  const clientRows = await db
    .selectDistinct({ name: client.name })
    .from(candidate)
    .leftJoin(job, eq(candidate.jobId, job.id))
    .leftJoin(client, eq(job.clientId, client.id))
    .where(and(where, eq(candidate.status, "active"), isNotNull(client.name)));

  // "N waiting" — sitting in a stage the client can see, i.e. the ball is in
  // their court rather than ours.
  const [waiting] = await db
    .select({ total: count() })
    .from(candidate)
    .innerJoin(
      application,
      and(eq(application.candidateId, candidate.id), eq(application.jobId, candidate.jobId)),
    )
    .innerJoin(pipelineStage, eq(application.stageId, pipelineStage.id))
    .where(and(where, eq(pipelineStage.clientVisible, true), eq(application.status, "active")));

  return {
    inPool: pool?.total ?? 0,
    addedThisMonth: addedThisMonth?.total ?? 0,
    submitted: submitted?.total ?? 0,
    submittedWaiting: waiting?.total ?? 0,
    submittedClients: clientRows.length,
    strongMatch: strong?.total ?? 0,
    strongMatchUnviewed: unviewed?.total ?? 0,
    joined: joined?.total ?? 0,
    joinedThisYear: joinedYtd?.total ?? 0,
  };
}

export async function archiveCandidate(organizationId: string, id: string) {
  const [archived] = await db
    .update(candidate)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(candidate.id, id), eq(candidate.organizationId, organizationId)))
    .returning();
  return archived ? { id: archived.id } : null;
}
