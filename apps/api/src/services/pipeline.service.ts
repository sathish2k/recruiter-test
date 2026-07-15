import { isValidObjectId } from "mongoose";
import { type CandidateDoc, CandidateModel } from "../models/candidate.model";
import { UserModel } from "../models/user.model";

export interface PipelineFilters {
  client?: string;
  owner?: string;
  search?: string;
}

// The five non-terminal stages that form the board columns, in order, with the
// SLA (days-in-stage) after which a candidate is flagged. "Rejected" is
// terminal and never appears on the board.
export const PIPELINE_STAGES = [
  { stage: "Sourced", slaDays: 5 },
  { stage: "Screened", slaDays: 4 },
  { stage: "Shortlisted", slaDays: 4 },
  { stage: "Interviewing", slaDays: 7 },
  { stage: "Offer", slaDays: 6 },
] as const;

export const PIPELINE_STAGE_SET = new Set<string>(
  PIPELINE_STAGES.map((s) => s.stage),
);

const OWNER_AVATARS = [
  { bg: "#3A5B4A", fg: "#CFF5DE" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#5B4A3A", fg: "#F5DECF" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function daysInStage(updatedAt?: Date): number {
  if (!updatedAt) return 0;
  const ms = Date.now() - new Date(updatedAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function badgeFor(match: number): { badge: string; badgeKind: string } {
  if (match >= 90) return { badge: `AI ${match}`, badgeKind: "strong" };
  if (match >= 80) return { badge: `AI ${match}`, badgeKind: "good" };
  if (match > 0) return { badge: `AI ${match}`, badgeKind: "review" };
  return { badge: "New", badgeKind: "new" };
}

interface Owner {
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
}

// ponytail: candidates have no owner field yet, so ownership is derived by
// rotating the seeded active employees over a stable id-sorted order — keeps
// each candidate's owner consistent across board cards and the recruiter strip.
async function loadOwners(agencyId: string): Promise<Owner[]> {
  const users = await UserModel.find({
    agencyId,
    role: "employee",
    status: "active",
  })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
  return users.map((u, i) => {
    const avatar = OWNER_AVATARS[i % OWNER_AVATARS.length] ?? OWNER_AVATARS[0];
    return {
      name: u.name,
      initials: initialsOf(u.name),
      avatarBg: avatar?.bg ?? "#3A5B4A",
      avatarFg: avatar?.fg ?? "#CFF5DE",
    };
  });
}

type CandidateEntity = CandidateDoc & { _id: unknown; updatedAt?: Date };

function slaDaysFor(stage: string): number {
  return PIPELINE_STAGES.find((s) => s.stage === stage)?.slaDays ?? 5;
}

function mapCard(c: CandidateEntity, owner: Owner) {
  const match = c.match ?? 0;
  const days = daysInStage(c.updatedAt);
  return {
    id: String(c._id),
    name: c.name,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    role: c.role,
    client: c.client,
    ...badgeFor(match),
    attachments: c.attachments?.length ?? 0,
    comments: c.teamNotes?.length ?? 0,
    daysInStage: days,
    overSla: days > slaDaysFor(c.stage),
    owner,
    stage: c.stage,
  };
}

export async function getPipeline(filters: PipelineFilters, agencyId: string) {
  const owners = await loadOwners(agencyId);
  const fallbackOwner: Owner = {
    name: "Unassigned",
    initials: "–",
    avatarBg: "#3A3A38",
    avatarFg: "#C9C5BD",
  };

  // The full non-terminal board (agency-scoped) drives stable owner assignment
  // and the recruiter strip counts, independent of the active filters.
  const boardDocs = (await CandidateModel.find({
    agencyId,
    stage: { $in: [...PIPELINE_STAGE_SET] },
  })
    .sort({ _id: 1 })
    .lean()) as CandidateEntity[];

  const ownerById = new Map<string, Owner>();
  boardDocs.forEach((c, i) => {
    const owner = owners.length
      ? (owners[i % owners.length] ?? fallbackOwner)
      : fallbackOwner;
    ownerById.set(String(c._id), owner);
  });

  const query: Record<string, unknown> = {
    agencyId,
    stage: { $in: [...PIPELINE_STAGE_SET] },
  };
  if (filters.client?.trim()) query.client = filters.client.trim();
  if (filters.search?.trim()) {
    const rx = new RegExp(escapeRegExp(filters.search.trim()), "i");
    query.$or = [{ name: rx }, { role: rx }, { client: rx }];
  }

  let docs = (await CandidateModel.find(query)
    .sort({ match: -1, _id: 1 })
    .lean()) as CandidateEntity[];

  const owner = filters.owner?.trim();
  if (owner) {
    docs = docs.filter((c) => ownerById.get(String(c._id))?.name === owner);
  }

  const columns = PIPELINE_STAGES.map(({ stage }) => {
    const cards = docs
      .filter((c) => c.stage === stage)
      .map((c) => mapCard(c, ownerById.get(String(c._id)) ?? fallbackOwner));
    return { stage, count: cards.length, cards };
  });

  const recruiters = owners.map((o) => {
    const own = boardDocs.filter(
      (c) => ownerById.get(String(c._id))?.name === o.name,
    );
    const roles = new Set(own.map((c) => c.role).filter(Boolean));
    return {
      name: o.name,
      initials: o.initials,
      avatarBg: o.avatarBg,
      avatarFg: o.avatarFg,
      roles: roles.size,
      candidates: own.length,
    };
  });

  const overSla = boardDocs
    .map((c) => ({ card: c, days: daysInStage(c.updatedAt) }))
    .filter(({ card, days }) => days > slaDaysFor(card.stage));
  const sla = {
    count: overSla.length,
    names: overSla.map(({ card }) => card.name),
  };

  return { columns, recruiters, sla };
}

export async function moveCandidateStage(id: string, stage: string) {
  if (!PIPELINE_STAGE_SET.has(stage))
    return { error: "invalid-stage" as const };
  if (!isValidObjectId(id)) return { error: "not-found" as const };
  const doc = (await CandidateModel.findByIdAndUpdate(
    id,
    { stage },
    { new: true },
  ).lean()) as CandidateEntity | null;
  if (!doc) return { error: "not-found" as const };
  const owner: Owner = {
    name: "Unassigned",
    initials: "–",
    avatarBg: "#3A3A38",
    avatarFg: "#C9C5BD",
  };
  return { data: mapCard(doc, owner) };
}
