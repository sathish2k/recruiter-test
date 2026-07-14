import { type CandidateDoc, CandidateModel } from "../models/candidate.model";

export interface CandidateFilters {
  search?: string;
  scope?: string; // "All" | "Name" | "Role" | "Client"
  stage?: string;
  client?: string;
  role?: string;
  source?: string;
  exp?: string; // comma-joined experience bands
  match?: string; // comma-joined AI-match bands
  sortKey?: string;
  sortDir?: string;
  page?: string;
  pageSize?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function list(value?: string): string[] {
  return value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
}

const EXP_RANGES: Record<string, Record<string, number>> = {
  "0–2 yrs": { $lte: 2 },
  "3–5 yrs": { $gte: 3, $lte: 5 },
  "6–8 yrs": { $gte: 6, $lte: 8 },
  "9+ yrs": { $gte: 9 },
};
const MATCH_RANGES: Record<string, Record<string, number>> = {
  "90%+": { $gte: 90 },
  "75–89%": { $gte: 75, $lte: 89 },
  "60–74%": { $gte: 60, $lte: 74 },
  "Below 60%": { $lt: 60 },
};

function mapCandidate(c: CandidateDoc & { _id: unknown }) {
  return {
    id: String(c._id),
    name: c.name,
    email: c.email,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    role: c.role,
    client: c.client,
    match: c.match,
    matchColor: c.match >= 75 ? "#FF9D57" : "#9A968E",
    exp: c.exp,
    expLabel: `${c.exp} yrs`,
    applied: c.applied,
    stage: c.stage,
  };
}

const SORT_FIELDS: Record<string, string> = {
  name: "name",
  role: "role",
  client: "client",
  match: "match",
  exp: "exp",
  applied: "appliedTs",
  stage: "stage",
  createdAt: "createdAt",
};

export async function listCandidates(filters: CandidateFilters = {}) {
  const { search, scope, sortKey, sortDir } = filters;
  // ponytail: scope by ctx.auth.agencyId when multi-tenancy lands.
  const query: Record<string, unknown> = {};
  const and: Record<string, unknown>[] = [];

  if (search?.trim()) {
    const rx = new RegExp(escapeRegExp(search.trim()), "i");
    if (scope === "Name") query.name = rx;
    else if (scope === "Role") query.role = rx;
    else if (scope === "Client") query.client = rx;
    else and.push({ $or: [{ name: rx }, { role: rx }, { client: rx }] });
  }

  const stage = list(filters.stage);
  const client = list(filters.client);
  const roleCat = list(filters.role);
  const source = list(filters.source);
  if (stage.length) query.stage = { $in: stage };
  if (client.length) query.client = { $in: client };
  if (roleCat.length) query.roleCat = { $in: roleCat };
  if (source.length) query.source = { $in: source };

  const expBands = list(filters.exp)
    .map((b) => EXP_RANGES[b])
    .filter(Boolean);
  const matchBands = list(filters.match)
    .map((b) => MATCH_RANGES[b])
    .filter(Boolean);
  if (expBands.length) and.push({ $or: expBands.map((r) => ({ exp: r })) });
  if (matchBands.length)
    and.push({ $or: matchBands.map((r) => ({ match: r })) });
  if (and.length) query.$and = and;

  const sortField = sortKey ? SORT_FIELDS[sortKey] : undefined;
  const sort: Record<string, 1 | -1> = sortField
    ? { [sortField]: sortDir === "desc" ? -1 : 1 }
    : { _id: 1 };

  // Server-side pagination — totalCount is the full match count, not the page.
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(0, Number(filters.pageSize) || 0);

  const totalCount = await CandidateModel.countDocuments(query);
  let cursor = CandidateModel.find(query).sort(sort);
  if (pageSize > 0) cursor = cursor.skip((page - 1) * pageSize).limit(pageSize);
  const docs = await cursor.lean();
  const data = docs.map((c) =>
    mapCandidate(c as CandidateDoc & { _id: unknown }),
  );
  return { data, totalCount };
}
