import { CandidateModel } from "../models/candidate.model";
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

export interface CreateJobInput {
  title: string;
  client?: string;
  roleCat?: string;
  level?: string;
  location?: string;
  empType?: string;
  openings?: number;
  description?: string;
  salaryMin?: string;
  salaryMax?: string;
  skills?: string[];
  status?: string;
}

export async function createJob(input: CreateJobInput, agencyId: string) {
  const clientInitial = (input.client ?? "?").trim().charAt(0).toUpperCase();
  const doc = await JobModel.create({
    agencyId,
    title: input.title,
    roleCat: input.roleCat ?? "",
    level: input.level ?? "",
    openings: input.openings ?? 1,
    client: input.client ?? "",
    clientInitial,
    location: input.location ?? "Remote",
    empType: input.empType ?? "Full-time",
    description: input.description ?? "",
    salaryMin: input.salaryMin ?? "",
    salaryMax: input.salaryMax ?? "",
    skills: input.skills ?? [],
    pipeline: 0,
    matched: 0,
    posted: "Just now",
    postedTs: Date.now(),
    status: input.status === "Draft" ? "Draft" : "Active",
  });
  return mapJob(doc.toObject() as JobDoc & { _id: unknown });
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

const LEVEL_EXP: Record<string, string> = {
  Junior: "1+ Years",
  Mid: "3+ Years",
  Senior: "7+ Years",
  Staff: "9+ Years",
};

const QUOTA_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

function longDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatPeriod(start: Date, end: Date): string {
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  });
  return start.getFullYear() === end.getFullYear()
    ? `${monthDay.format(start)} – ${monthDay.format(end)}, ${end.getFullYear()}`
    : `${longDate(start)} – ${longDate(end)}`;
}

function formatSalary(min: string, max: string): string {
  const fmt = (v: string) => {
    const n = Number(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? `$${n.toLocaleString("en-US")}` : v;
  };
  const parts = [min, max].filter((v) => v?.trim()).map(fmt);
  return parts.join(" – ");
}

function keywordTitles(title: string): string[] {
  const base =
    title
      .replace(/^(Senior|Junior|Mid|Staff|Lead|Principal)[\s-]*/i, "")
      .trim() || title;
  const variants = [
    /engineer/i.test(base)
      ? base.replace(/engineer/i, "Developer")
      : `${base} Specialist`,
    /backend|frontend|full[\s-]?stack/i.test(base)
      ? base.replace(/backend|frontend|full[\s-]?stack/i, "Platform")
      : `Lead ${base}`,
  ];
  return [...new Set([title, ...variants])];
}

function linkedinBoolean(titles: string[], skills: string[]): string {
  const groups = [`(${titles.map((t) => `"${t}"`).join(" OR ")})`];
  if (skills.length) groups.push(`(${skills.slice(0, 2).join(" OR ")})`);
  if (skills.length > 2) groups.push(`(${skills.slice(2, 4).join(" OR ")})`);
  return `${groups.join(" AND ")} NOT (intern OR fresher OR "open to work")`;
}

function hasSection(description: string, name: string): boolean {
  return new RegExp(`^#{1,3}\\s*${name}`, "im").test(description);
}

const fromYmd = (ts: number) =>
  new Date(
    Math.floor(ts / 10000),
    Math.floor((ts % 10000) / 100) - 1,
    ts % 100,
  );

export async function getJob(id: string) {
  const doc = await JobModel.findById(id)
    .lean()
    .catch(() => null);
  if (!doc) return null;
  const j = doc as JobDoc & {
    _id: unknown;
    createdAt?: Date;
    updatedAt?: Date;
  };
  const created = j.createdAt ? new Date(j.createdAt) : new Date();
  const periodEnd = j.recruitEndTs
    ? fromYmd(j.recruitEndTs)
    : (() => {
        const d = new Date(created);
        d.setMonth(d.getMonth() + 3);
        return d;
      })();
  const description = j.description ?? "";
  const skills = j.skills ?? [];
  const openings = j.openings ?? 1;
  const workType = (j.location ?? "").includes("Remote") ? "Remote" : "On-site";
  const expYears = LEVEL_EXP[j.level] ?? "3+ Years";
  const pipeline = j.pipeline ?? 0;
  const threshold = j.screeningThreshold ?? 80;
  const titles = keywordTitles(j.title);
  const skipLists =
    hasSection(description, "Qualifications") ||
    hasSection(description, "Responsibilities");
  const [screenedCount, matchedCount] = await Promise.all([
    CandidateModel.countDocuments({ client: j.client, match: { $gt: 0 } }),
    CandidateModel.countDocuments({
      client: j.client,
      match: { $gte: threshold },
    }),
  ]);
  return {
    id: String(j._id),
    title: j.title,
    roleCat: j.roleCat,
    client: j.client,
    clientInitial: j.clientInitial,
    logoBg: j.logoBg,
    logoFg: j.logoFg,
    location: j.location ?? "",
    empType: j.empType ?? "",
    level: j.level ?? "",
    openings,
    status: j.status,
    salaryMin: j.salaryMin ?? "",
    salaryMax: j.salaryMax ?? "",
    salary: formatSalary(j.salaryMin ?? "", j.salaryMax ?? ""),
    description,
    skills,
    posted: j.posted,
    expYears,
    workType,
    qualifications: skipLists ? [] : (j.qualifications ?? []),
    responsibilities: skipLists ? [] : (j.responsibilities ?? []),
    posting: {
      creationDate: longDate(created),
      recruitmentPeriod: formatPeriod(created, periodEnd),
      totalApplicants: pipeline,
      quota: openings,
      quotaNote: `${QUOTA_WORDS[openings] ?? openings} position${
        openings === 1 ? "" : "s"
      } available`,
      views: j.views ?? 0,
      saves: j.saves ?? 0,
      lastUpdate: longDate(j.updatedAt ? new Date(j.updatedAt) : created),
    },
    team: (j.team ?? []).map((member) => ({
      name: member.name,
      initials: member.initials,
      avatarBg: member.avatarBg,
      avatarFg: member.avatarFg,
      role: member.roleLabel,
      badge: member.badge,
      badgeTone: member.badgeTone,
    })),
    screening: {
      on: j.screeningOn ?? false,
      screened: screenedCount,
      total: pipeline,
      matched80: matchedCount,
      threshold,
    },
    keywords: {
      titles,
      linkedin: linkedinBoolean(titles, j.skills ?? []),
      naukri: [
        titles[0],
        ...(j.skills ?? []),
        workType.toLowerCase(),
        expYears.toLowerCase(),
      ].join(", "),
    },
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

  // Server-side pagination — totalCount is the full match count, not the page.
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.max(0, Number(filters.pageSize) || 0);

  const totalCount = await JobModel.countDocuments(query);
  let cursor = JobModel.find(query).sort(sort);
  if (pageSize > 0) cursor = cursor.skip((page - 1) * pageSize).limit(pageSize);
  const docs = await cursor.lean();
  const data = docs.map((j) => mapJob(j as JobDoc & { _id: unknown }));
  return { data, totalCount };
}
