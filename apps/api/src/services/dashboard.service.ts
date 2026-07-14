import type { UserRole } from "@recruit/types";
import { CandidateModel } from "../models/candidate.model";
import { JobModel } from "../models/job.model";

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

// Top stat tiles — real counts from Mongo; deltas are period-over-period and
// seeded (no historical snapshots stored yet).
export interface DashboardStats {
  openRoles: number;
  openRolesDelta: string;
  activeCandidates: number;
  activeCandidatesDelta: string;
  hires: number;
  hiresDelta: string;
}

export async function getStats(): Promise<DashboardStats> {
  const [openRoles, activeCandidates, hires] = await Promise.all([
    JobModel.countDocuments({ status: "Active" }),
    CandidateModel.countDocuments({ stage: { $ne: "Rejected" } }),
    CandidateModel.countDocuments({ stage: "Offer" }),
  ]);
  return {
    openRoles,
    openRolesDelta: "+3",
    activeCandidates,
    activeCandidatesDelta: "+12%",
    hires,
    hiresDelta: "+8%",
  };
}

// Hiring activity chart — 12 weekly buckets per metric. Seeded; a real build
// would bucket applications/interviews/hires by week from event history.
export interface HiringPoint {
  label: string;
  applications: number;
  interviews: number;
  hires: number;
}

const HIRING: HiringPoint[] = [
  { label: "W1", applications: 120, interviews: 42, hires: 6 },
  { label: "W2", applications: 155, interviews: 51, hires: 8 },
  { label: "W3", applications: 138, interviews: 47, hires: 5 },
  { label: "W4", applications: 190, interviews: 63, hires: 11 },
  { label: "W5", applications: 176, interviews: 58, hires: 9 },
  { label: "W6", applications: 205, interviews: 71, hires: 12 },
  { label: "W7", applications: 168, interviews: 55, hires: 7 },
  { label: "W8", applications: 232, interviews: 78, hires: 14 },
  { label: "W9", applications: 198, interviews: 66, hires: 10 },
  { label: "W10", applications: 245, interviews: 83, hires: 15 },
  { label: "W11", applications: 221, interviews: 74, hires: 13 },
  { label: "W12", applications: 268, interviews: 90, hires: 18 },
];

export interface HiringResponse {
  total: number;
  points: HiringPoint[];
}

export async function getHiring(): Promise<HiringResponse> {
  const total = HIRING.reduce((sum, p) => sum + p.applications, 0);
  return { total, points: HIRING };
}

// Recent candidates for the dashboard table — real docs, newest first. The
// interview slot isn't modelled yet, so it's seeded per row.
const INTERVIEW_SLOTS = [
  "Tomorrow 2:00 PM",
  "Thu 11:00 AM",
  "—",
  "Today 4:30 PM",
  "Fri 9:00 AM",
];

function matchColor(match: number): string {
  if (match >= 90) return "#8FD6AC";
  if (match >= 75) return "#F0C27C";
  return "#C9C5BD";
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

export async function getRecentCandidates(): Promise<RecentCandidatesResponse> {
  const [docs, all, interviewing] = await Promise.all([
    CandidateModel.find().sort({ appliedTs: -1 }).limit(5).lean(),
    CandidateModel.find().select("appliedTs").lean(),
    CandidateModel.countDocuments({ stage: "Interviewing" }),
  ]);
  // appliedTs is a YYYYMMDD int; "this week" ≈ within 7 of the latest date.
  const maxTs = all.reduce((m, c) => Math.max(m, c.appliedTs ?? 0), 0);
  const addedThisWeek = all.filter(
    (c) => (c.appliedTs ?? 0) >= maxTs - 7,
  ).length;

  const data = docs.map((c, i) => ({
    id: String((c as { _id: unknown })._id),
    name: c.name,
    initials: c.initials,
    avatarBg: c.avatarBg,
    avatarFg: c.avatarFg,
    role: c.role,
    client: c.client,
    match: c.match,
    matchColor: matchColor(c.match),
    interview: INTERVIEW_SLOTS[i % INTERVIEW_SLOTS.length] ?? "—",
    stage: c.stage,
  }));
  return { data, meta: { addedThisWeek, interviewing } };
}

// Interviews rail — next + upcoming. Seeded (no interview collection yet).
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

export async function getInterviews(): Promise<InterviewsResponse> {
  return {
    next: {
      name: "Savannah Nguyen",
      initials: "SN",
      avatarBg: "#4A3A5B",
      avatarFg: "#E3CFF5",
      role: "Senior Backend Eng · Nortech",
      when: "Today · 2:00 – 2:45 PM",
      inLabel: "in 45 min",
    },
    upcoming: [
      {
        id: "1",
        name: "Marcus Lee",
        initials: "ML",
        avatarBg: "#3A4A5B",
        avatarFg: "#CFE3F5",
        meta: "Frontend Eng · Fablio",
        time: "3:30 PM",
      },
      {
        id: "2",
        name: "Priya Shah",
        initials: "PS",
        avatarBg: "#3A5B4A",
        avatarFg: "#CFF5DE",
        meta: "Product Designer · Vantor",
        time: "Tomorrow",
      },
      {
        id: "3",
        name: "Diego Torres",
        initials: "DT",
        avatarBg: "#5B4A3A",
        avatarFg: "#F5DECF",
        meta: "Data Scientist · Corely",
        time: "Thu 10 AM",
      },
    ],
  };
}

// AI screening quota + match-score distribution. Seeded.
export interface ScreeningResponse {
  screened: number;
  quota: number;
  distribution: { label: string; pct: number; color: string }[];
}

export async function getScreening(): Promise<ScreeningResponse> {
  return {
    screened: 146,
    quota: 200,
    distribution: [
      { label: "90%+ match", pct: 32, color: "#F26A1B" },
      { label: "75–89%", pct: 26, color: "#D98E5A" },
      { label: "60–74%", pct: 24, color: "#B9A18C" },
      { label: "Below 60%", pct: 18, color: "#F5F3F0" },
    ],
  };
}
