import { type JobDoc, JobModel } from "../models/job.model";

export interface JobFilters {
  search?: string;
  scope?: string; // "All" | "Role" | "Client"
  role?: string; // comma-joined roleCat values
  client?: string;
  status?: string;
  location?: string;
  empType?: string;
  level?: string;
  sortKey?: string;
  sortDir?: string; // "asc" | "desc"
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

function mapJob(j: JobDoc & { _id: unknown }) {
  return {
    id: String(j._id),
    title: j.title,
    roleCat: j.roleCat,
    level: j.level,
    openings: j.openings === 1 ? "1 opening" : `${j.openings} openings`,
    client: j.client,
    clientInitial: j.clientInitial,
    logoBg: j.logoBg,
    logoFg: j.logoFg,
    location: j.location,
    empType: j.empType,
    loc: `${j.location} · ${j.empType}`,
    pipeline: j.pipeline,
    matched: j.matched,
    posted: j.posted,
    status: j.status,
  };
}

const SORT_FIELDS: Record<string, string> = {
  title: "title",
  client: "client",
  location: "location",
  status: "status",
  pipeline: "pipeline",
  matched: "matched",
  posted: "postedTs",
};

export async function listJobs(filters: JobFilters = {}) {
  const { search, scope, sortKey, sortDir } = filters;
  // ponytail: scope by ctx.auth.agencyId when multi-tenancy lands.
  const query: Record<string, unknown> = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegExp(search.trim()), "i");
    if (scope === "Role") query.title = rx;
    else if (scope === "Client") query.client = rx;
    else query.$or = [{ title: rx }, { client: rx }];
  }

  const roleCat = list(filters.role);
  const client = list(filters.client);
  const status = list(filters.status);
  const location = list(filters.location);
  const empType = list(filters.empType);
  const level = list(filters.level);
  if (roleCat.length) query.roleCat = { $in: roleCat };
  if (client.length) query.client = { $in: client };
  if (status.length) query.status = { $in: status };
  if (location.length) query.location = { $in: location };
  if (empType.length) query.empType = { $in: empType };
  if (level.length) query.level = { $in: level };

  const sortField = sortKey ? SORT_FIELDS[sortKey] : undefined;
  const sort: Record<string, 1 | -1> = sortField
    ? { [sortField]: sortDir === "desc" ? -1 : 1 }
    : { _id: 1 };

  const docs = await JobModel.find(query).sort(sort).lean();
  const data = docs.map((j) => mapJob(j as JobDoc & { _id: unknown }));
  return { data, totalCount: data.length };
}
