/**
 * Development fixtures for one organization: clients, jobs, candidates spread
 * across the pipeline, and workspace invites spread across the last two weeks —
 * enough for the dashboard's KPIs, both graphs and the bottleneck alert.
 *
 *   bun run db:seed                       # seeds the only/first organization
 *   bun run db:seed -- "Troy Consultancy" # seeds a named organization
 *
 * Re-running replaces the rows it created before (matched on the seed marker),
 * so it never stacks duplicates.
 */
import { randomUUID } from "node:crypto";
import { and, eq, like } from "drizzle-orm";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { type CandidateStatus, candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { interview } from "../models/interview.model";
import { invitation } from "../models/invitation.model";
import { job } from "../models/job.model";
import { organization } from "../models/organization.model";
import { db } from ".";

/** Every seeded row's id carries this, so a re-run can clear its own data. */
const MARK = "seed-";
const id = () => `${MARK}${randomUUID()}`;
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

const CLIENTS = [
  { name: "Nortech Systems", industry: "Technology", status: "hiring", health: "healthy" },
  { name: "Bluewave Financial", industry: "Finance", status: "hiring", health: "healthy" },
  { name: "Corvus Health", industry: "Healthcare", status: "hiring", health: "attention" },
  { name: "Halden Logistics", industry: "Logistics", status: "hiring", health: "at_risk" },
  { name: "Verdant Energy", industry: "Energy", status: "paused", health: "dormant" },
] as const;

// `targetInDays` drives the SLA card: negative = overdue, 0 = due today.
const JOBS = [
  { title: "Senior Backend Engineer", openedDaysAgo: 2, status: "open", targetInDays: 21 },
  { title: "Platform SRE", openedDaysAgo: 4, status: "open", targetInDays: 14 },
  { title: "Product Designer", openedDaysAgo: 6, status: "open", targetInDays: 9 },
  { title: "Data Engineer", openedDaysAgo: 19, status: "open", targetInDays: 0 },
  { title: "Engineering Manager", openedDaysAgo: 24, status: "open", targetInDays: -3 },
  { title: "QA Automation Lead", openedDaysAgo: 33, status: "open", targetInDays: -8 },
  { title: "Mobile Engineer (iOS)", openedDaysAgo: 41, status: "filled", targetInDays: -12 },
  { title: "Solutions Architect", openedDaysAgo: 58, status: "closed", targetInDays: -20 },
] as const;

/** Stage → how many candidates sit there. Screening is the deliberate
 * bottleneck so the dashboard alert has something real to report. */
const PIPELINE: { stage: string; count: number }[] = [
  { stage: "sourced", count: 14 },
  { stage: "screening", count: 18 },
  { stage: "submitted", count: 9 },
  { stage: "interview", count: 5 },
  { stage: "offer", count: 2 },
];

/** Upcoming interviews, as minutes from now. The card shows the soonest. */
const INTERVIEWS_IN_MINUTES = [45, 190, 1500, 2900];
const INTERVIEW_KINDS = ["Client panel", "Screening", "Tech round", "Final round"];

/** Invites per day, most recent last — a believable two-week ramp. */
const INVITES_PER_DAY = [0, 2, 1, 0, 3, 4, 2, 0, 1, 5, 3, 2, 4, 1];

/** Pipeline movement per day, most recent last. These become audit rows with a
 * `details.stage`, which is what the activity chart counts per metric. */
const MOVES_PER_DAY: Record<string, number[]> = {
  submitted: [2, 0, 3, 1, 4, 2, 5, 1, 3, 0, 4, 6, 2, 3],
  interview: [1, 1, 0, 2, 1, 3, 0, 2, 1, 1, 2, 0, 3, 1],
  placed: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
};

const FIRST = [
  "Savannah",
  "Marcus",
  "Priya",
  "Elena",
  "Tobias",
  "Naledi",
  "Hiro",
  "Amara",
  "Lucas",
  "Ingrid",
  "Omar",
  "Wei",
  "Sofia",
  "Dmitri",
  "Chiara",
  "Kwame",
];
const LAST = [
  "Nguyen",
  "Okonkwo",
  "Vasquez",
  "Lindqvist",
  "Haddad",
  "Moreau",
  "Tanaka",
  "Fitzgerald",
  "Petrov",
  "Rossi",
  "Mensah",
  "Zhang",
  "Delgado",
  "Novak",
];

function personName(index: number) {
  return {
    firstName: FIRST[index % FIRST.length] ?? "Alex",
    lastName: LAST[Math.floor(index / FIRST.length) % LAST.length] ?? "Doe",
  };
}

async function resolveOrganization(nameArg?: string) {
  if (nameArg) {
    const [found] = await db
      .select()
      .from(organization)
      .where(eq(organization.name, nameArg))
      .limit(1);
    if (!found) throw new Error(`No organization named "${nameArg}"`);
    return found;
  }
  const [first] = await db.select().from(organization).limit(1);
  if (!first) throw new Error("No organizations exist — sign up in the app first.");
  return first;
}

async function clearPreviousSeed(organizationId: string) {
  const pattern = `${MARK}%`;
  await db
    .delete(candidate)
    .where(and(eq(candidate.organizationId, organizationId), like(candidate.id, pattern)));
  await db.delete(job).where(and(eq(job.organizationId, organizationId), like(job.id, pattern)));
  await db
    .delete(client)
    .where(and(eq(client.organizationId, organizationId), like(client.id, pattern)));
  await db
    .delete(invitation)
    .where(and(eq(invitation.organizationId, organizationId), like(invitation.id, pattern)));
  await db
    .delete(interview)
    .where(and(eq(interview.organizationId, organizationId), like(interview.id, pattern)));
  await db
    .delete(auditLog)
    .where(and(eq(auditLog.organizationId, organizationId), like(auditLog.id, pattern)));
}

async function seed() {
  const nameArg = process.argv[2];
  const org = await resolveOrganization(nameArg);
  const organizationId = org.id;
  const [owner] = await db.select().from(user).where(eq(user.agencyId, organizationId)).limit(1);

  await clearPreviousSeed(organizationId);

  const clientRows = CLIENTS.map((entry) => ({
    id: id(),
    organizationId,
    name: entry.name,
    industry: entry.industry,
    status: entry.status,
    health: entry.health,
    accountLeadId: owner?.id ?? null,
  }));
  await db.insert(client).values(clientRows);

  const jobRows = JOBS.map((entry, index) => ({
    id: id(),
    organizationId,
    title: entry.title,
    clientId: clientRows[index % clientRows.length]?.id ?? null,
    status: entry.status,
    dateOpened: daysAgo(entry.openedDaysAgo).toISOString().slice(0, 10),
    targetDate: daysAgo(-entry.targetInDays).toISOString().slice(0, 10),
    createdAt: daysAgo(entry.openedDaysAgo),
    updatedAt: daysAgo(entry.openedDaysAgo),
  }));
  await db.insert(job).values(jobRows);

  const openJobs = jobRows.filter((row) => row.status === "open");
  const candidateRows = PIPELINE.flatMap(({ stage, count }, stageIndex) =>
    Array.from({ length: count }, (_, i) => {
      const index = stageIndex * 20 + i;
      // Spread creation over ~70 days so the month-over-month delta is real.
      const age = 3 + ((index * 7) % 68);
      const status: CandidateStatus = stage === "offer" ? "placed" : i % 5 === 0 ? "new" : "active";
      return {
        id: id(),
        organizationId,
        ...personName(index),
        email: `candidate${index}@example.com`,
        jobId: openJobs[index % openJobs.length]?.id ?? null,
        startingStage: stage,
        status,
        ownerId: owner?.id ?? null,
        createdAt: daysAgo(age),
        updatedAt: daysAgo(age),
      };
    }),
  );
  await db.insert(candidate).values(candidateRows);

  const inviteRows = INVITES_PER_DAY.flatMap((sent, dayIndex) =>
    Array.from({ length: sent }, (_, i) => {
      const sentAt = daysAgo(INVITES_PER_DAY.length - 1 - dayIndex);
      return {
        id: id(),
        organizationId,
        email: `teammate${dayIndex}-${i}@example.com`,
        role: "employee",
        status: "pending" as const,
        invitedBy: owner?.id ?? null,
        createdAt: sentAt,
        updatedAt: sentAt,
      };
    }),
  );
  if (inviteRows.length) await db.insert(invitation).values(inviteRows);

  const moveRows = Object.entries(MOVES_PER_DAY).flatMap(([stage, perDay]) =>
    perDay.flatMap((moves, dayIndex) =>
      Array.from({ length: moves }, (_, i) => {
        const movedAt = daysAgo(perDay.length - 1 - dayIndex);
        const who = personName(dayIndex * 3 + i);
        const name = `${who.firstName} ${who.lastName}`;
        return {
          id: id(),
          organizationId,
          userId: owner?.id ?? null,
          actorName: owner?.name ?? "System",
          event: `${name} moved to ${stage}`,
          category: "candidates" as const,
          severity: "success" as const,
          objects: { Candidate: name },
          details: { stage },
          createdAt: movedAt,
        };
      }),
    ),
  );
  if (moveRows.length) await db.insert(auditLog).values(moveRows);

  const interviewCandidates = candidateRows.filter((row) => row.startingStage === "interview");
  const interviewRows = INTERVIEWS_IN_MINUTES.map((minutes, index) => {
    const person = interviewCandidates[index % Math.max(interviewCandidates.length, 1)];
    return {
      id: id(),
      organizationId,
      candidateId: person?.id ?? null,
      jobId: person?.jobId ?? null,
      clientId: clientRows[index % clientRows.length]?.id ?? null,
      scheduledAt: new Date(Date.now() + minutes * 60 * 1000),
      durationMinutes: 45,
      kind: INTERVIEW_KINDS[index % INTERVIEW_KINDS.length] ?? "Screening",
      meetingUrl: "https://meet.example.com/hpx-" + (index + 1),
      ownerId: owner?.id ?? null,
      status: "scheduled" as const,
    };
  });
  if (interviewRows.length) await db.insert(interview).values(interviewRows);

  console.log(`Seeded "${org.name}" (${organizationId})`);
  console.table({
    clients: clientRows.length,
    jobs: jobRows.length,
    openJobs: openJobs.length,
    candidates: candidateRows.length,
    invitations: inviteRows.length,
    stageMoves: moveRows.length,
    interviews: interviewRows.length,
  });
}

await seed();
process.exit(0);
