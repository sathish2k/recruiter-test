import { CandidateModel } from "../models/candidate.model";
import { InterviewModel } from "../models/interview.model";
import { UserModel } from "../models/user.model";

const SUBMITTED_STAGES = ["Shortlisted", "Interviewing", "Offer"];
const APPROVED_STAGES = ["Offer", "Shortlisted"];

const DEFAULT_SWATCH = { bg: "#3A4A5B", fg: "#CFE3F5" };

const SOURCER_PALETTE = [
  DEFAULT_SWATCH,
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A5B4A", fg: "#CFF5E1" },
  { bg: "#5B4A3A", fg: "#F5E1CF" },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

function matchColor(match: number): string {
  if (match >= 90) return "#F26A1B";
  if (match >= 75) return "#FF9D57";
  return "#9A968E";
}

async function activeSourcers(agencyId: string) {
  const employees = await UserModel.find({
    agencyId,
    role: "employee",
    status: "active",
  })
    .select("name")
    .lean();
  return employees.map((employee, index) => {
    const swatch =
      SOURCER_PALETTE[index % SOURCER_PALETTE.length] ?? DEFAULT_SWATCH;
    return {
      name: employee.name,
      initials: initialsOf(employee.name),
      bg: swatch.bg,
      fg: swatch.fg,
    };
  });
}

export interface LeadGreeting {
  firstName: string;
  cvsWaiting: number;
  approvals: number;
}

export async function getGreeting(
  agencyId: string,
  userId: string,
): Promise<LeadGreeting> {
  const [user, cvsWaiting, approvals] = await Promise.all([
    UserModel.findById(userId).select("name").lean(),
    CandidateModel.countDocuments({ agencyId, match: { $gt: 0 } }),
    CandidateModel.countDocuments({
      agencyId,
      stage: { $in: APPROVED_STAGES },
    }),
  ]);
  const name = user?.name ?? "";
  return {
    firstName: name.split(" ")[0] ?? name,
    cvsWaiting,
    approvals,
  };
}

export interface LeadKpis {
  cvsToReview: number;
  withClients: number;
  approvedToSchedule: number;
  interviewsThisWeek: number;
  approvedNew: number;
}

export async function getKpis(agencyId: string): Promise<LeadKpis> {
  const [cvsToReview, withClients, approvedToSchedule, interviewsThisWeek] =
    await Promise.all([
      CandidateModel.countDocuments({ agencyId, match: { $gt: 0 } }),
      CandidateModel.countDocuments({ agencyId, stage: "Shortlisted" }),
      CandidateModel.countDocuments({ agencyId, stage: "Offer" }),
      InterviewModel.countDocuments({ agencyId, status: "upcoming" }),
    ]);
  return {
    cvsToReview,
    withClients,
    approvedToSchedule,
    interviewsThisWeek,
    approvedNew: approvedToSchedule,
  };
}

export interface CvQueueRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  when: string;
  score: number;
  scoreColor: string;
  sourcer: string;
  sourcerInitials: string;
  sourcerBg: string;
  sourcerFg: string;
}

export async function getCvQueue(
  agencyId: string,
): Promise<{ data: CvQueueRow[]; meta: { totalCount: number } }> {
  const [docs, sourcers] = await Promise.all([
    CandidateModel.find({ agencyId, match: { $gt: 0 } })
      .sort({ match: -1 })
      .limit(7)
      .lean(),
    activeSourcers(agencyId),
  ]);
  const data = docs.map((candidate, index) => {
    const sourcer = sourcers[index % Math.max(sourcers.length, 1)];
    return {
      id: String((candidate as { _id: unknown })._id),
      name: candidate.name,
      initials: candidate.initials,
      avatarBg: candidate.avatarBg,
      avatarFg: candidate.avatarFg,
      role: candidate.role,
      client: candidate.client,
      when: candidate.applied,
      score: candidate.match,
      scoreColor: matchColor(candidate.match),
      sourcer: sourcer?.name ?? "",
      sourcerInitials: sourcer?.initials ?? "",
      sourcerBg: sourcer?.bg ?? "#3A4A5B",
      sourcerFg: sourcer?.fg ?? "#CFE3F5",
    };
  });
  return { data, meta: { totalCount: data.length } };
}

export interface ClientDecisionRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
  client: string;
  when: string;
}

export interface ClientDecisions {
  approved: ClientDecisionRow[];
  awaiting: ClientDecisionRow | null;
}

export async function getClientDecisions(
  agencyId: string,
): Promise<ClientDecisions> {
  const [approvedDocs, awaitingDoc] = await Promise.all([
    CandidateModel.find({ agencyId, stage: { $in: APPROVED_STAGES } })
      .sort({ match: -1 })
      .limit(3)
      .lean(),
    CandidateModel.findOne({ agencyId, stage: "Screened" })
      .sort({ match: -1 })
      .lean(),
  ]);
  const toRow = (
    candidate: (typeof approvedDocs)[number],
  ): ClientDecisionRow => ({
    id: String((candidate as { _id: unknown })._id),
    name: candidate.name,
    initials: candidate.initials,
    avatarBg: candidate.avatarBg,
    avatarFg: candidate.avatarFg,
    role: candidate.role,
    client: candidate.client,
    when: candidate.applied,
  });
  return {
    approved: approvedDocs.map(toRow),
    awaiting: awaitingDoc ? toRow(awaitingDoc) : null,
  };
}

export interface InterviewTodayRow {
  id: string;
  time: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  role: string;
}

export async function getInterviewsToday(
  agencyId: string,
): Promise<{ data: InterviewTodayRow[] }> {
  const upcoming = await InterviewModel.find({ agencyId, status: "upcoming" })
    .sort({ ts: 1 })
    .limit(4)
    .lean();
  return {
    data: upcoming.map((interview) => ({
      id: String((interview as { _id: unknown })._id),
      time: interview.time,
      name: interview.candidateName,
      initials: interview.initials,
      avatarBg: interview.avatarBg,
      avatarFg: interview.avatarFg,
      role: interview.meta,
    })),
  };
}

export interface FunnelStage {
  key: string;
  count: number;
  pct: number;
}

export interface LeadFunnel {
  stages: FunnelStage[];
  insightStage: string;
  insightDrop: number;
}

export async function getFunnel(agencyId: string): Promise<LeadFunnel> {
  const [received, reviewed, submitted, approved, interviewsSet] =
    await Promise.all([
      CandidateModel.countDocuments({ agencyId }),
      CandidateModel.countDocuments({ agencyId, match: { $gt: 0 } }),
      CandidateModel.countDocuments({
        agencyId,
        stage: { $in: SUBMITTED_STAGES },
      }),
      CandidateModel.countDocuments({ agencyId, stage: "Offer" }),
      InterviewModel.countDocuments({ agencyId, status: "upcoming" }),
    ]);
  const base = Math.max(received, 1);
  const counts: Array<[string, number]> = [
    ["received", received],
    ["reviewed", reviewed],
    ["submitted", submitted],
    ["approved", approved],
    ["interviewsSet", interviewsSet],
  ];
  const stages: FunnelStage[] = counts.map(([key, count]) => ({
    key,
    count,
    pct: Math.round((count / base) * 100),
  }));
  let insightStage = stages[0]?.key ?? "received";
  let insightDrop = 0;
  for (let i = 1; i < stages.length; i++) {
    const drop = (stages[i - 1]?.pct ?? 0) - (stages[i]?.pct ?? 0);
    if (drop > insightDrop) {
      insightDrop = drop;
      insightStage = stages[i]?.key ?? insightStage;
    }
  }
  return { stages, insightStage, insightDrop };
}

export interface SourcerRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  cvs: number;
  submitted: number;
  approval: string;
}

export async function getSourcers(
  agencyId: string,
): Promise<{ data: SourcerRow[]; meta: { totalCount: number } }> {
  const [sourcers, totalCvs, totalSubmitted, totalApproved] = await Promise.all(
    [
      activeSourcers(agencyId),
      CandidateModel.countDocuments({ agencyId, match: { $gt: 0 } }),
      CandidateModel.countDocuments({
        agencyId,
        stage: { $in: SUBMITTED_STAGES },
      }),
      CandidateModel.countDocuments({
        agencyId,
        stage: { $in: APPROVED_STAGES },
      }),
    ],
  );
  const count = Math.max(sourcers.length, 1);
  const share = (total: number, index: number) =>
    Math.floor(total / count) + (index < total % count ? 1 : 0);
  const data = sourcers.map((sourcer, index) => {
    const cvs = share(totalCvs, index);
    const submitted = share(totalSubmitted, index);
    const approved = share(totalApproved, index);
    return {
      id: sourcer.name,
      name: sourcer.name,
      initials: sourcer.initials,
      avatarBg: sourcer.bg,
      avatarFg: sourcer.fg,
      cvs,
      submitted,
      approval: `${submitted > 0 ? Math.round((approved / submitted) * 100) : 0}%`,
    };
  });
  return { data, meta: { totalCount: data.length } };
}
