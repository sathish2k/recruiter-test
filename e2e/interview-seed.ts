// Standalone Bun seed script inserting Interview docs into an existing agency.
// Interviews have NO HTTP create path (GET /interviews only), yet the Interviews
// screen's KPIs, Today / This-week / Past sections, and Feedback-pending rail all
// key off Interview records — so we insert a small fixed set directly, mirroring
// db-seed.ts (reuse the API's own model + Mongo config).
//
// NOTE on "today" bucketing: the service files an interview under Today only when
// its `when` string starts with "Today" (the numeric ts→today comparison in the
// service never matches — see interviews.service.ts), so the today row here sets
// `when: "Today · …"` explicitly.
//
// Run from apps/api, e.g.:
//   SEED_AGENCY=... bun run <path>/interview-seed.ts
import { closeDb, connectDb } from "../apps/api/src/db";
import { InterviewModel } from "../apps/api/src/models/interview.model";

// biome-ignore lint/suspicious/noUndeclaredEnvVars: E2E-only seed input, not a Turbo task.
const agencyId = process.env.SEED_AGENCY;

if (!agencyId) {
  throw new Error("SEED_AGENCY is required");
}

const now = new Date();
const ymd = (d: Date) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const inDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d;
};

await connectDb();
await InterviewModel.create([
  {
    agencyId,
    candidateName: "Nadia Bloom",
    initials: "NB",
    title: "Round 1 — System design",
    meta: "Senior Backend · Nortech",
    when: "Today · 2:00 PM",
    time: "2:00 PM",
    ts: ymd(now),
    status: "upcoming",
    note: "System design with Sarah Chen",
    inLabel: "today",
  },
  {
    agencyId,
    candidateName: "Owen Frost",
    initials: "OF",
    title: "Round 2 — Hiring manager",
    meta: "Frontend Lead · Fablio",
    when: "Thu · 11:00 AM",
    time: "11:00 AM",
    ts: ymd(inDays(2)),
    status: "upcoming",
    note: "Manager screen with Priya Rao",
    inLabel: "",
  },
  {
    agencyId,
    candidateName: "Grace Poll",
    initials: "GP",
    title: "Round 2 — Final round",
    meta: "Data Engineer · Loomis",
    when: "Mon · 4:00 PM",
    time: "4:00 PM",
    ts: ymd(inDays(-3)),
    status: "passed",
    note: "Final round with Alex Kim",
    inLabel: "",
    badge: "Passed",
  },
]);
console.log(`Seeded 3 interviews into agency ${agencyId}`);
await closeDb();
