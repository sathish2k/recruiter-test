import type { UserRole } from "@recruit/types";
import { CandidateModel } from "../models/candidate.model";
import { InterviewModel } from "../models/interview.model";
import { JobModel } from "../models/job.model";

const ymd = (d: Date) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const daysAgoYmd = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
};

export interface HomeDashboard {
  role: UserRole;
  greeting: string;
  stats: { openRoles: number; activeCandidates: number };
}

export async function getHomeDashboard(
  role: UserRole,
  userId: string,
): Promise<HomeDashboard> {
  return {
    role,
    greeting: `Welcome back (${userId})`,
    stats: { openRoles: 0, activeCandidates: 0 },
  };
}

export interface DashboardStats {
  openRoles: number;
  openRolesDelta: string;
  activeCandidates: number;
  activeCandidatesDelta: string;
  hires: number;
  hiresDelta: string;
}

export async function getStats(agencyId: string): Promise<DashboardStats> {
  const monthAgo = daysAgoYmd(30);
  const [
    openRoles,
    newRoles,
    activeCandidates,
    newCandidates,
    hires,
    newHires,
  ] = await Promise.all([
    JobModel.countDocuments({ agencyId, status: "Active" }),
    JobModel.countDocuments({
      agencyId,
      status: "Active",
      postedTs: { $gte: monthAgo },
    }),
    CandidateModel.countDocuments({ agencyId, stage: { $ne: "Rejected" } }),
    CandidateModel.countDocuments({
      agencyId,
      stage: { $ne: "Rejected" },
      appliedTs: { $gte: monthAgo },
    }),
    CandidateModel.countDocuments({ agencyId, stage: "Offer" }),
    CandidateModel.countDocuments({
      agencyId,
      stage: "Offer",
      appliedTs: { $gte: monthAgo },
    }),
  ]);
  const pct = (part: number, whole: number) =>
    whole > 0 ? `+${Math.round((part / whole) * 100)}%` : "+0%";
  return {
    openRoles,
    openRolesDelta: `+${newRoles}`,
    activeCandidates,
    activeCandidatesDelta: pct(newCandidates, activeCandidates),
    hires,
    hiresDelta: pct(newHires, Math.max(hires, 1)),
  };
}

export interface HiringPoint {
  label: string;
  applications: number;
  interviews: number;
  hires: number;
}

export interface HiringResponse {
  total: number;
  points: HiringPoint[];
}

export async function getHiring(agencyId: string): Promise<HiringResponse> {
  const [candidates, interviews] = await Promise.all([
    CandidateModel.find({ agencyId }).select("appliedTs stage").lean(),
    InterviewModel.find({ agencyId }).select("ts").lean(),
  ]);
  const weekIndex = (ts: number) => {
    if (!ts) return -1;
    const date = new Date(
      Math.floor(ts / 10000),
      Math.floor((ts % 10000) / 100) - 1,
      ts % 100,
    );
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    return 11 - Math.floor(days / 7);
  };
  const points: HiringPoint[] = Array.from({ length: 12 }, (_, i) => ({
    label: `W${i + 1}`,
    applications: 0,
    interviews: 0,
    hires: 0,
  }));
  for (const c of candidates) {
    const w = weekIndex(c.appliedTs ?? 0);
    const point = points[w];
    if (!point) continue;
    point.applications++;
    if (c.stage === "Offer") point.hires++;
  }
  for (const iv of interviews) {
    const point = points[weekIndex(Math.floor((iv.ts ?? 0) / 10000))];
    if (point) point.interviews++;
  }
  const total = points.reduce((sum, p) => sum + p.applications, 0);
  return { total, points };
}

function matchColor(match: number): string {
  if (match >= 75) return "#FF9D57";
  return "#9A968E";
}

export interface RecentCandidate {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  match: number;
  matchColor: string;
  interview: string;
  stage: string;
}

export interface RecentCandidatesResponse {
  data: RecentCandidate[];
  meta: { addedThisWeek: number; interviewing: number };
}

export async function getRecentCandidates(
  agencyId: string,
): Promise<RecentCandidatesResponse> {
  const [docs, addedThisWeek, interviewing, upcoming] = await Promise.all([
    CandidateModel.find({ agencyId }).sort({ appliedTs: -1 }).limit(5).lean(),
    CandidateModel.countDocuments({
      agencyId,
      appliedTs: { $gte: daysAgoYmd(7) },
    }),
    CandidateModel.countDocuments({ agencyId, stage: "Interviewing" }),
    InterviewModel.find({ agencyId, status: "upcoming" })
      .select("candidateId when")
      .lean(),
  ]);
  const nextByCandidate = new Map(
    upcoming.map((iv) => [iv.candidateId, iv.when]),
  );

  const data = docs.map((c) => ({
    id: String((c as { _id: unknown })._id),
    name: c.name,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    role: c.role,
    client: c.client,
    match: c.match,
    matchColor: matchColor(c.match),
    interview: nextByCandidate.get(String((c as { _id: unknown })._id)) ?? "—",
    stage: c.stage,
  }));
  return { data, meta: { addedThisWeek, interviewing } };
}

export interface InterviewsResponse {
  next: {
    name: string;
    initials: string;
    avatarBg: string;
    avatarFg: string;
    role: string;
    when: string;
    inLabel: string;
  };
  upcoming: {
    id: string;
    name: string;
    initials: string;
    avatarBg: string;
    avatarFg: string;
    meta: string;
    time: string;
  }[];
}

export async function getInterviews(
  agencyId: string,
): Promise<InterviewsResponse | null> {
  const upcoming = await InterviewModel.find({ agencyId, status: "upcoming" })
    .sort({ ts: 1 })
    .limit(4)
    .lean();
  const next = upcoming[0];
  if (!next) return null;
  return {
    next: {
      name: next.candidateName,
      initials: next.initials,
      avatarBg: next.avatarBg,
      avatarFg: next.avatarFg,
      role: next.meta,
      when: next.when,
      inLabel: next.inLabel,
    },
    upcoming: upcoming.slice(1).map((iv) => ({
      id: String((iv as { _id: unknown })._id),
      name: iv.candidateName,
      initials: iv.initials,
      avatarBg: iv.avatarBg,
      avatarFg: iv.avatarFg,
      meta: iv.meta,
      time: iv.time,
    })),
  };
}

export interface ScreeningResponse {
  screened: number;
  quota: number;
  distribution: { label: string; pct: number; color: string }[];
}

const SCREENING_QUOTA = 200;

export async function getScreening(
  agencyId: string,
): Promise<ScreeningResponse> {
  const matches = await CandidateModel.find({ agencyId, match: { $gt: 0 } })
    .select("match")
    .lean();
  const total = matches.length;
  const band = (min: number, max: number) =>
    matches.filter((c) => c.match >= min && c.match <= max).length;
  const pct = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;
  return {
    screened: total,
    quota: SCREENING_QUOTA,
    distribution: [
      { label: "90%+ match", pct: pct(band(90, 100)), color: "#F26A1B" },
      { label: "75–89%", pct: pct(band(75, 89)), color: "#D98E5A" },
      { label: "60–74%", pct: pct(band(60, 74)), color: "#B9A18C" },
      { label: "Below 60%", pct: pct(band(1, 59)), color: "#F5F3F0" },
    ],
  };
}
