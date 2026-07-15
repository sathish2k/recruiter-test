import { isValidObjectId } from "mongoose";
import { type CandidateDoc, CandidateModel } from "../models/candidate.model";
import { InterviewModel } from "../models/interview.model";
import { UserModel } from "../models/user.model";

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

export interface CreateCandidateInput {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  job?: string;
  source?: string;
  currentTitle?: string;
  years?: number;
  skills?: string[];
  notes?: string;
}

const AVATARS = [
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#3A5B4A", fg: "#CFF5DE" },
  { bg: "#5B4A3A", fg: "#F5DECF" },
];

export async function createCandidate(
  input: CreateCandidateInput,
  agencyId: string,
) {
  const name = [input.firstName, input.lastName].filter(Boolean).join(" ");
  const initials = [input.firstName, input.lastName]
    .filter(Boolean)
    .map((part) => (part ?? "").charAt(0).toUpperCase())
    .join("");
  const avatar = AVATARS[name.length % AVATARS.length] ?? AVATARS[0];
  const [role, client] = (input.job ?? "").split("·").map((s) => s.trim());
  const now = new Date();
  const appliedTs =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  const doc = await CandidateModel.create({
    agencyId,
    name,
    email: input.email ?? "",
    initials,
    avatarBg: avatar?.bg,
    avatarFg: avatar?.fg,
    role: input.currentTitle || role || "",
    roleCat: "",
    client: client ?? "",
    match: 0,
    exp: input.years ?? 0,
    applied: "Just now",
    appliedTs,
    stage: "Sourced",
    source: input.source ?? "",
    phone: input.phone ?? "",
    location: input.location ?? "",
    linkedin: input.linkedin ?? "",
    skills: input.skills ?? [],
    notes: input.notes ?? "",
  });
  return mapCandidate(doc.toObject() as CandidateDoc & { _id: unknown });
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

const REQUIRED_SKILLS = [
  "Go",
  "PostgreSQL",
  "Kubernetes",
  "AWS",
  "System design",
];

const STAGE_NAMES = [
  "Invited",
  "Connected",
  "CV Received",
  "Lead Review",
  "Submitted",
  "Interview",
];

// Which timeline step a pipeline stage sits at (current step index).
const STAGE_STEP: Record<string, number> = {
  Sourced: 1,
  Screened: 2,
  Shortlisted: 3,
  Interviewing: 5,
  Offer: 5,
  Rejected: 2,
};

const clampScore = (value: number) => Math.max(0, Math.min(99, value));

export async function getCandidate(
  id: string,
  agencyId: string,
  userId?: string,
) {
  const doc = isValidObjectId(id)
    ? await CandidateModel.findOne({ _id: id, agencyId }).lean()
    : null;
  if (!doc) return null;
  const c = doc as CandidateDoc & { _id: unknown };

  const user =
    userId && isValidObjectId(userId)
      ? await UserModel.findById(userId).lean()
      : null;
  const userName = user?.name || "You";
  const userInitials = userName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const userAvatar = AVATARS[userName.length % AVATARS.length] ?? AVATARS[0];

  const match = c.match ?? 0;
  const skills = c.skills ?? [];
  const verdict =
    match >= 90 ? "Strong match" : match >= 75 ? "Good match" : "Needs review";
  const verdictTone =
    match >= 90 ? "success" : match >= 75 ? "warning" : "default";

  const currentStep = STAGE_STEP[c.stage] ?? 4;
  const milestoneNotes = c.milestoneNotes ?? [];
  const timeline = STAGE_NAMES.map((name, i) => ({
    name,
    sub: i > currentStep ? "—" : (milestoneNotes[i] ?? "—"),
    state: i < currentStep ? "done" : i === currentStep ? "current" : "future",
  }));

  const interviewDocs = await InterviewModel.find({
    agencyId,
    candidateId: String(c._id),
  })
    .sort({ ts: -1 })
    .lean();
  const interviews = interviewDocs
    .sort((a, b) =>
      a.status === b.status ? b.ts - a.ts : a.status === "upcoming" ? -1 : 1,
    )
    .map((iv) => ({
      title: iv.title,
      when: iv.note,
      state: iv.status,
      badge: iv.badge || undefined,
    }));

  return {
    id: String(c._id),
    name: c.name,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    email: c.email,
    phone: c.phone,
    location: c.location,
    linkedin: c.linkedin,
    role: c.role,
    client: c.client,
    match,
    stage: c.stage,
    source: c.source,
    applied: c.applied,
    exp: c.exp,
    skills,
    notes: c.notes ?? "",
    currentTitle: c.role,
    headline: [c.role, `${c.exp} yrs`, c.location].filter(Boolean).join(" · "),
    heroMeta: [
      { icon: "mail", text: c.email },
      { icon: "work", text: [c.role, c.client].filter(Boolean).join(" · ") },
      {
        icon: "schedule",
        text: `Invited ${c.applied || "recently"} · via ${c.source || "sourcing"}`,
      },
    ].filter((row) => row.text),
    report: {
      score: match,
      verdict,
      verdictTone,
      subtitle: [
        c.role,
        c.client,
        milestoneNotes[2]
          ? `screened ${milestoneNotes[2].split(" · ")[0]}`
          : "",
      ]
        .filter(Boolean)
        .join(" · "),
      bars: [
        { label: "Skills match", score: clampScore(match + 2) },
        { label: "Experience", score: clampScore(match - 2) },
        { label: "Domain fit", score: clampScore(match - 4) },
        { label: "Compensation fit", score: clampScore(match - 6) },
      ],
      strengths: c.strengths ?? [],
      gaps: c.gaps ?? [],
    },
    timeline,
    experience: c.experience ?? [],
    education: c.education ?? [],
    requiredSkills: REQUIRED_SKILLS,
    details: [
      { icon: "mail", text: c.email },
      { icon: "call", text: c.phone },
      { icon: "location", text: c.location },
      { icon: "link", text: c.linkedin },
      {
        icon: "source",
        text: c.source ? `Sourced via ${c.source} · ${c.applied}` : "",
      },
    ].filter((row) => row.text),
    attachments: c.attachments ?? [],
    appliedJob: {
      title: c.role || "Open role",
      client: c.client,
      meta: [c.client, "Remote", "Full-time"].filter(Boolean).join(" · "),
      initial: (c.client || c.role || "N").charAt(0).toUpperCase(),
      bg: "#3A4A5B",
      fg: "#CFE3F5",
    },
    interviews,
    teamNotes: c.teamNotes ?? [],
    noteAuthor: {
      initials: userInitials,
      avatarBg: userAvatar?.bg ?? "#5B4A3A",
      avatarFg: userAvatar?.fg ?? "#FFD9BC",
      name: userName,
    },
  };
}

export async function listCandidates(
  agencyId: string,
  filters: CandidateFilters = {},
) {
  const { search, scope, sortKey, sortDir } = filters;
  const query: Record<string, unknown> = { agencyId };
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
