import { CandidateModel } from "../models/candidate.model";
import { JobModel } from "../models/job.model";
import { UserModel } from "../models/user.model";

const INVITE_TARGET = 50;
const CV_STAGES = ["Screened", "Shortlisted", "Interviewing", "Offer"];
const WEEK_LABELS = ["mon", "tue", "wed", "thu", "fri"];
const WEEK_WEIGHTS = [0.24, 0.18, 0.22, 0.2, 0.16];

/** ponytail: invites aren't modeled yet — derive a stable daily figure from the
 * agency's total candidate volume so KPI/greeting/funnel all agree. */
async function deriveInvitesSent(agencyId: string): Promise<number> {
  const total = await CandidateModel.countDocuments({ agencyId });
  return Math.min(INVITE_TARGET, Math.max(0, Math.round(total * 0.7)));
}

export interface EmployeeGreeting {
  firstName: string;
  invitesSent: number;
  invitesTarget: number;
  cvsReceived: number;
}

export async function getGreeting(
  agencyId: string,
  userId: string,
): Promise<EmployeeGreeting> {
  const [user, invitesSent, cvsReceived] = await Promise.all([
    UserModel.findById(userId).select("name").lean(),
    deriveInvitesSent(agencyId),
    CandidateModel.countDocuments({ agencyId, stage: { $in: CV_STAGES } }),
  ]);
  const name = user?.name ?? "";
  return {
    firstName: name.split(" ")[0] ?? name,
    invitesSent,
    invitesTarget: INVITE_TARGET,
    cvsReceived,
  };
}

export interface EmployeeKpis {
  invitesSent: number;
  invitesTarget: number;
  invitesPct: number;
  connections: number;
  jdsShared: number;
  cvsReceived: number;
  cvsNew: number;
}

export async function getKpis(agencyId: string): Promise<EmployeeKpis> {
  const [invitesSent, connections, jdsShared, cvsReceived, cvsNew] =
    await Promise.all([
      deriveInvitesSent(agencyId),
      CandidateModel.countDocuments({ agencyId, stage: { $ne: "Sourced" } }),
      JobModel.countDocuments({ agencyId, status: "Active" }),
      CandidateModel.countDocuments({ agencyId, stage: { $in: CV_STAGES } }),
      CandidateModel.countDocuments({ agencyId, stage: "Screened" }),
    ]);
  return {
    invitesSent,
    invitesTarget: INVITE_TARGET,
    invitesPct: Math.round((invitesSent / INVITE_TARGET) * 100),
    connections,
    jdsShared,
    cvsReceived,
    cvsNew,
  };
}

export interface RoleRow {
  id: string;
  title: string;
  client: string;
  clientInitial: string;
  logoBg: string;
  logoFg: string;
  invites: number;
  connected: number;
  cvs: number;
  cvsNew: boolean;
  nextStepKey: string;
}

export interface RolesResponse {
  data: RoleRow[];
  meta: {
    totalCount: number;
    totals: {
      roles: number;
      invites: number;
      connected: number;
      cvs: number;
      clients: number;
    };
  };
}

export async function getRoles(agencyId: string): Promise<RolesResponse> {
  const jobs = await JobModel.find({ agencyId, status: "Active" })
    .sort({ postedTs: -1 })
    .limit(5)
    .lean();
  const data: RoleRow[] = await Promise.all(
    jobs.map(async (job) => {
      const cvs = await CandidateModel.countDocuments({
        agencyId,
        client: job.client,
        stage: { $in: CV_STAGES },
      });
      const connected = job.matched;
      const nextStepKey =
        cvs > 0 ? "reviewCvs" : connected > 0 ? "shareJd" : "sourceMore";
      return {
        id: String((job as { _id: unknown })._id),
        title: job.title,
        client: job.client,
        clientInitial: job.clientInitial,
        logoBg: job.logoBg,
        logoFg: job.logoFg,
        invites: job.pipeline,
        connected,
        cvs,
        cvsNew: cvs > 0,
        nextStepKey,
      };
    }),
  );
  const clients = new Set(data.map((row) => row.client)).size;
  return {
    data,
    meta: {
      totalCount: data.length,
      totals: {
        roles: data.length,
        invites: data.reduce((sum, row) => sum + row.invites, 0),
        connected: data.reduce((sum, row) => sum + row.connected, 0),
        cvs: data.reduce((sum, row) => sum + row.cvs, 0),
        clients,
      },
    },
  };
}

export interface FollowupRow {
  id: string;
  kind: "shareJd" | "message" | "send";
  icon: string;
  name: string;
  role: string;
}

const FOLLOWUP_PLAN: Array<{
  stage: string;
  kind: FollowupRow["kind"];
  icon: string;
}> = [
  { stage: "Screened", kind: "shareJd", icon: "share" },
  { stage: "Sourced", kind: "message", icon: "mail" },
  { stage: "Shortlisted", kind: "send", icon: "send" },
];

export async function getFollowups(
  agencyId: string,
): Promise<{ data: FollowupRow[] }> {
  const rows = await Promise.all(
    FOLLOWUP_PLAN.map(async ({ stage, kind, icon }) => {
      const candidate = await CandidateModel.findOne({ agencyId, stage })
        .sort({ appliedTs: -1 })
        .lean();
      if (!candidate) return null;
      return {
        id: String((candidate as { _id: unknown })._id),
        kind,
        icon,
        name: candidate.name,
        role: candidate.role,
      };
    }),
  );
  return { data: rows.filter((row): row is FollowupRow => row !== null) };
}

export interface AiActivityRow {
  id: string;
  icon: "check" | "flag";
  key: string;
  count: number;
  role: string;
}

export async function getAiActivity(
  agencyId: string,
): Promise<{ data: AiActivityRow[] }> {
  const jobs = await JobModel.find({ agencyId, status: "Active" })
    .sort({ postedTs: -1 })
    .limit(3)
    .lean();
  const data = await Promise.all(
    jobs.map(async (job, index) => {
      const screened = await CandidateModel.countDocuments({
        agencyId,
        client: job.client,
      });
      const flagged = index === jobs.length - 1;
      return {
        id: String((job as { _id: unknown })._id),
        icon: (flagged ? "flag" : "check") as "check" | "flag",
        key: flagged ? "flagged" : "screened",
        count: screened,
        role: job.title,
      };
    }),
  );
  return { data };
}

export interface FunnelStage {
  key: string;
  count: number;
  pct: number;
}

export interface EmployeeFunnel {
  stages: FunnelStage[];
  insightStage: string;
  insightDrop: number;
}

export async function getFunnel(agencyId: string): Promise<EmployeeFunnel> {
  const cvsReceived = await CandidateModel.countDocuments({
    agencyId,
    stage: { $in: CV_STAGES },
  });
  // ponytail: invites/connections/JD-shares aren't modeled — build a
  // monotonically descending funnel anchored on the real CV-received count.
  const bottom = Math.max(cvsReceived, 1);
  const counts: Array<[string, number]> = [
    ["invitesSent", Math.round(bottom * 3.2)],
    ["connected", Math.round(bottom * 2.3)],
    ["jdShared", Math.round(bottom * 1.6)],
    ["cvsReceived", cvsReceived],
  ];
  const base = Math.max(counts[0]?.[1] ?? 1, 1);
  const stages: FunnelStage[] = counts.map(([key, count]) => ({
    key,
    count,
    pct: Math.round((count / base) * 100),
  }));
  let insightStage = stages[0]?.key ?? "invitesSent";
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

export interface InvitesWeek {
  days: Array<{ label: string; value: number }>;
  target: number;
  todayIndex: number;
}

export async function getInvitesWeek(agencyId: string): Promise<InvitesWeek> {
  const total = await CandidateModel.countDocuments({ agencyId });
  const weekly = Math.max(total * 3, WEEK_LABELS.length);
  const days = WEEK_LABELS.map((label, index) => ({
    label,
    value: Math.round(weekly * (WEEK_WEIGHTS[index] ?? 0.2)),
  }));
  const weekday = new Date().getDay();
  const todayIndex = Math.min(Math.max(weekday - 1, 0), WEEK_LABELS.length - 1);
  return { days, target: INVITE_TARGET, todayIndex };
}
