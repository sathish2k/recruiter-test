import { CandidateModel } from "../models/candidate.model";
import { InterviewModel } from "../models/interview.model";

const APPROVED_STAGES = ["Offer", "Shortlisted"];

const todayYmd = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const dateOfTs = (ts: number) => Math.floor(ts / 10000);

const withOf = (note: string) => {
  const idx = note.indexOf("with ");
  return idx >= 0 ? note.slice(idx + 5) : "";
};

export interface InterviewKpis {
  today: number;
  thisWeek: number;
  upcoming: number;
  passed: number;
}

export interface TodayRow {
  id: string;
  time: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
  round: string;
  with: string;
  joinable: boolean;
}

export interface UpcomingRow {
  id: string;
  day: string;
  time: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
  round: string;
  with: string;
  status: string;
}

export interface PastRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  meta: string;
  note: string;
  badge: string;
}

export interface NeedsSchedulingRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
}

export interface FeedbackRow {
  id: string;
  title: string;
  sub: string;
  chip: string;
}

export interface InterviewsData {
  kpis: InterviewKpis;
  today: TodayRow[];
  upcoming: UpcomingRow[];
  past: PastRow[];
  needsScheduling: NeedsSchedulingRow[];
  feedbackPending: FeedbackRow[];
}

export async function getInterviews(agencyId: string): Promise<InterviewsData> {
  const [upcomingDocs, passedDocs, approvedCandidates] = await Promise.all([
    InterviewModel.find({ agencyId, status: "upcoming" })
      .sort({ ts: 1 })
      .lean(),
    InterviewModel.find({ agencyId, status: "passed" }).sort({ ts: -1 }).lean(),
    CandidateModel.find({ agencyId, stage: { $in: APPROVED_STAGES } })
      .sort({ match: -1 })
      .limit(3)
      .lean(),
  ]);

  const today = todayYmd();
  const idOf = (doc: { _id: unknown }) => String(doc._id);

  const todayRows: TodayRow[] = upcomingDocs
    .filter((doc) => dateOfTs(doc.ts) === today || doc.when.startsWith("Today"))
    .map((doc, index) => ({
      id: idOf(doc),
      time: doc.time,
      name: doc.candidateName,
      initials: doc.initials,
      avatarBg: doc.avatarBg,
      avatarFg: doc.avatarFg,
      roleClient: doc.meta,
      round: doc.title,
      with: withOf(doc.note),
      joinable: index === 0,
    }));

  const todayIds = new Set(todayRows.map((row) => row.id));

  const upcomingRows: UpcomingRow[] = upcomingDocs
    .filter((doc) => !todayIds.has(idOf(doc)))
    .map((doc) => ({
      id: doc.candidateId || idOf(doc),
      day: doc.when.split(" · ")[0] ?? doc.when,
      time: doc.time,
      name: doc.candidateName,
      initials: doc.initials,
      avatarBg: doc.avatarBg,
      avatarFg: doc.avatarFg,
      roleClient: doc.meta,
      round: doc.title,
      with: withOf(doc.note),
      status: doc.inLabel === "tomorrow" ? "Pending" : "Confirmed",
    }));

  const pastRows: PastRow[] = passedDocs.map((doc) => ({
    id: idOf(doc),
    name: doc.candidateName,
    initials: doc.initials,
    avatarBg: doc.avatarBg,
    avatarFg: doc.avatarFg,
    meta: doc.meta,
    note: doc.note,
    badge: doc.badge || "Passed",
  }));

  const needsScheduling: NeedsSchedulingRow[] = approvedCandidates.map(
    (candidate) => ({
      id: String((candidate as { _id: unknown })._id),
      name: candidate.name,
      initials: candidate.initials,
      avatarBg: candidate.avatarBg,
      avatarFg: candidate.avatarFg,
      roleClient: `${candidate.role} · ${candidate.client}`,
    }),
  );

  const feedbackPending: FeedbackRow[] = passedDocs.slice(0, 2).map((doc) => ({
    id: idOf(doc),
    title: `${doc.candidateName} — ${doc.title.replace(/^Round \d+ — /, "")}`,
    sub: doc.note,
    chip: "Due",
  }));

  return {
    kpis: {
      today: todayRows.length,
      thisWeek: upcomingDocs.length,
      upcoming: upcomingDocs.length,
      passed: passedDocs.length,
    },
    today: todayRows,
    upcoming: upcomingRows,
    past: pastRows,
    needsScheduling,
    feedbackPending,
  };
}
