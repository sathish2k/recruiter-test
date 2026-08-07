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
import { subscription, usageMetric } from "../models/billing.model";
import { type CandidateStatus, candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { clientInvoice } from "../models/client-invoice.model";
import { contact } from "../models/contact.model";
import { integration } from "../models/integration.model";
import { interview } from "../models/interview.model";
import { invitation } from "../models/invitation.model";
import { job } from "../models/job.model";
import { organization } from "../models/organization.model";
import { loginHistory, userSecurity } from "../models/security.model";
import { db } from ".";

/** Every seeded row's id carries this, so a re-run can clear its own data. */
const MARK = "seed-";
const id = () => `${MARK}${randomUUID()}`;
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

/** What a working agency has plugged in — six live, one needing attention,
 * which is the state the design's "6 · 1 warning" tile describes. */
const INTEGRATIONS = [
  {
    provider: "gmail",
    status: "connected" as const,
    account: "ops@troyconsulting.com",
    direction: "two-way",
    syncedDaysAgo: 0,
  },
  {
    provider: "google-calendar",
    status: "connected" as const,
    account: "ops@troyconsulting.com",
    direction: "two-way",
    syncedDaysAgo: 0,
  },
  {
    provider: "linkedin",
    status: "connected" as const,
    account: "Troy Consulting",
    direction: "pull",
    syncedDaysAgo: 1,
  },
  {
    provider: "slack",
    status: "connected" as const,
    account: "#hiring",
    direction: "push",
    syncedDaysAgo: 0,
  },
  {
    provider: "zoom",
    status: "connected" as const,
    account: "ops@troyconsulting.com",
    direction: "two-way",
    syncedDaysAgo: 2,
  },
  {
    provider: "greenhouse",
    status: "connected" as const,
    account: "troy-consulting",
    direction: "pull",
    syncedDaysAgo: 3,
  },
  {
    provider: "outlook",
    status: "warning" as const,
    account: "ana@troyconsulting.com",
    direction: "two-way",
    syncedDaysAgo: 6,
    warning: "Consent was revoked — interview sync has stopped for 6 members.",
  },
];

/** Recent sign-ins, including one blocked attempt so the security card has
 * something other than a wall of successes to show. */
const SIGN_INS = [
  {
    browser: "Chrome 141",
    os: "macOS 15",
    location: "Bengaluru, IN",
    ip: "49.205.12.8",
    result: "success" as const,
    daysAgo: 0,
  },
  {
    browser: "Safari 18",
    os: "iOS 18",
    location: "Bengaluru, IN",
    ip: "49.205.12.9",
    result: "success" as const,
    daysAgo: 0,
  },
  {
    browser: "Chrome 141",
    os: "Windows 11",
    location: "Pune, IN",
    ip: "103.21.58.44",
    result: "success" as const,
    daysAgo: 1,
  },
  {
    browser: "Firefox 133",
    os: "Ubuntu 24.04",
    location: "Lisbon, PT",
    ip: "185.93.2.17",
    result: "blocked" as const,
    daysAgo: 2,
  },
  {
    browser: "Chrome 140",
    os: "macOS 15",
    location: "Bengaluru, IN",
    ip: "49.205.12.8",
    result: "success" as const,
    daysAgo: 3,
  },
];

const CLIENTS = [
  {
    name: "Nortech Systems",
    industry: "Technology",
    status: "hiring",
    health: "healthy",
    fee: "20",
    terms: "net30",
    replacement: "90",
    sinceDaysAgo: 480,
  },
  {
    name: "Bluewave Financial",
    industry: "Finance",
    status: "hiring",
    health: "healthy",
    fee: "18.5",
    terms: "net45",
    replacement: "60",
    sinceDaysAgo: 300,
  },
  {
    name: "Corvus Health",
    industry: "Healthcare",
    status: "hiring",
    health: "attention",
    fee: "22",
    terms: "net30",
    replacement: "90",
    sinceDaysAgo: 210,
  },
  {
    name: "Halden Logistics",
    industry: "Logistics",
    status: "hiring",
    health: "at_risk",
    fee: "16",
    terms: "net60",
    replacement: "30",
    sinceDaysAgo: 150,
  },
  {
    name: "Verdant Energy",
    industry: "Energy",
    status: "paused",
    health: "dormant",
    fee: "15",
    terms: "net30",
    replacement: "none",
    sinceDaysAgo: 90,
  },
] as const;

/** Two contacts per client — a primary decision maker and an HR counterpart. */
const CONTACTS = [
  { first: "Tom", last: "Weaver", title: "VP Engineering", primary: true },
  { first: "Lena", last: "Cho", title: "HR Manager", primary: false },
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
const STAGE_SCORE: Record<string, number> = {
  sourced: 62,
  screening: 71,
  submitted: 84,
  interview: 89,
  offer: 93,
};

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
    .delete(clientInvoice)
    .where(and(eq(clientInvoice.organizationId, organizationId), like(clientInvoice.id, pattern)));
  await db
    .delete(contact)
    .where(and(eq(contact.organizationId, organizationId), like(contact.id, pattern)));
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
    feeBasis: "percent" as const,
    feeValue: String(entry.fee),
    paymentTerms: String(entry.terms),
    replacementPeriod: String(entry.replacement),
    billingEmail: `finance@${entry.name.split(" ")[0]?.toLowerCase()}.com`,
    taxId: "29ABCDE1234F1Z5",
    contractRenewsAt: new Date(Date.now() + (730 - entry.sinceDaysAgo) * DAY_MS)
      .toISOString()
      .slice(0, 10),
    contract: [
      {
        name: `${entry.name.split(" ")[0]}_MSA_2025.pdf`,
        url: "https://example.com/msa.pdf",
        size: 284_000,
        type: "application/pdf",
      },
    ],
    createdAt: daysAgo(entry.sinceDaysAgo),
    updatedAt: daysAgo(entry.sinceDaysAgo),
  }));
  await db.insert(client).values(clientRows);

  const contactRows = clientRows.flatMap((row, clientIndex) =>
    CONTACTS.map((entry, i) => ({
      id: id(),
      organizationId,
      clientId: row.id,
      firstName: entry.first,
      lastName: entry.last,
      title: entry.title,
      email: `${entry.first.toLowerCase()}.${entry.last.toLowerCase()}@${row.name.split(" ")[0]?.toLowerCase()}.com`,
      phone: `+91 98${String(40000000 + clientIndex * 137 + i)}`,
      isPrimary: entry.primary,
      // A spread of states, so the status chip is exercised.
      status: ((["active", "active", "inactive", "left"] as const)[(clientIndex + i) % 4] ??
        "active") as "active" | "inactive" | "left",
      ownerId: owner?.id ?? null,
      updatedAt: daysAgo(1 + clientIndex * 3 + i * 5),
    })),
  );
  await db.insert(contact).values(contactRows);

  const jobRows = JOBS.map((entry, index) => ({
    id: id(),
    organizationId,
    title: entry.title,
    clientId: clientRows[index % clientRows.length]?.id ?? null,
    status: entry.status,
    dateOpened: daysAgo(entry.openedDaysAgo).toISOString().slice(0, 10),
    targetDate: daysAgo(-entry.targetInDays).toISOString().slice(0, 10),
    employmentType: index % 4 === 3 ? "Contract" : "Full-time",
    openings: 1 + (index % 3),
    profileLeadId: owner?.id ?? null,
    clientContactId:
      contactRows.find((row) => row.clientId === clientRows[index % clientRows.length]?.id)?.id ??
      null,
    revenuePerPosition: String(180000 + index * 45000),
    actualRevenue: entry.status === "filled" ? String(240000 + index * 30000) : "0",
    missedRevenue: entry.status === "closed" ? String(120000 + index * 15000) : "0",
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
      // Placed candidates carry a realistic gap so "avg time to hire" is real.
      const closedAfter = status === "placed" ? 14 + (index % 21) : 0;
      return {
        id: id(),
        organizationId,
        ...personName(index),
        email: `candidate${index}@example.com`,
        jobId: openJobs[index % openJobs.length]?.id ?? null,
        startingStage: stage,
        status,
        matchScore: Math.min(99, (STAGE_SCORE[stage] ?? 70) + ((index * 13) % 11)),
        // Every other submitted CV has been chased; the rest show "no reminder yet".
        reminderSentAt:
          stage === "submitted" && index % 2 === 0
            ? new Date(Date.now() - (2 + (index % 6)) * 60 * 60 * 1000)
            : null,
        ownerId: owner?.id ?? null,
        createdAt: daysAgo(age),
        updatedAt:
          stage === "submitted"
            ? new Date(Date.now() - (5 + ((index * 7) % 38)) * 60 * 60 * 1000)
            : daysAgo(Math.max(0, age - closedAfter)),
      };
    }),
  );
  // Placements are what the fee is charged on, so give every client a couple —
  // round-robin over open jobs alone would leave most clients with none.
  for (const row of clientRows) {
    const jobIds = new Set(
      jobRows.filter((entry) => entry.clientId === row.id).map((entry) => entry.id),
    );
    const owned = candidateRows.filter((entry) => entry.jobId && jobIds.has(entry.jobId));
    for (const [index, entry] of owned.slice(0, 2).entries()) {
      entry.status = "placed";
      entry.startingStage = "offer";
      entry.updatedAt = daysAgo(9 + index * 13);
    }
  }
  await db.insert(candidate).values(candidateRows);

  const invoiceRows = clientRows.flatMap((row, clientIndex) => {
    const jobIds = new Set(
      jobRows.filter((entry) => entry.clientId === row.id).map((entry) => entry.id),
    );
    const placedHere = candidateRows.filter(
      (entry) => entry.status === "placed" && entry.jobId && jobIds.has(entry.jobId),
    );
    return placedHere.map((entry, i) => {
      const issuedDaysAgo = 12 + i * 21;
      const state = (clientIndex + i) % 3;
      return {
        id: id(),
        organizationId,
        clientId: row.id,
        number: `INV-2026-${String(100 + clientIndex * 7 + i)}`,
        description: `Placement — ${entry.firstName} ${entry.lastName}`,
        amount: 180_000 + i * 120_000,
        status: (state === 0 ? "paid" : state === 1 ? "due" : "overdue") as
          | "paid"
          | "due"
          | "overdue",
        issuedAt: daysAgo(issuedDaysAgo),
        dueAt: daysAgo(issuedDaysAgo - 30),
      };
    });
  });
  if (invoiceRows.length) await db.insert(clientInvoice).values(invoiceRows);

  // Roll the seeded jobs/candidates up onto their client, the way the app would.
  for (const row of clientRows) {
    const clientJobs = jobRows.filter((job) => job.clientId === row.id);
    const openRoles = clientJobs.filter((job) => job.status === "open").length;
    const jobIds = new Set(clientJobs.map((job) => job.id));
    const owned = candidateRows.filter((c) => c.jobId && jobIds.has(c.jobId));
    for (const entry of clientJobs) {
      const placed = owned.filter((c) => c.jobId === entry.id && c.status === "placed").length;
      await db
        .update(job)
        .set({ actualRevenue: String(placed * Number(entry.revenuePerPosition)) })
        .where(eq(job.id, entry.id));
    }

    await db
      .update(client)
      .set({
        openRoles,
        candidates: owned.length,
        placements: owned.filter((c) => c.status === "placed").length,
      })
      .where(eq(client.id, row.id));
  }

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
      clientId: jobRows.find((job) => job.id === person?.jobId)?.clientId ?? null,
      scheduledAt: new Date(Date.now() + minutes * 60 * 1000),
      durationMinutes: 45,
      kind: INTERVIEW_KINDS[index % INTERVIEW_KINDS.length] ?? "Screening",
      meetingUrl: "https://meet.example.com/hpx-" + (index + 1),
      ownerId: owner?.id ?? null,
      status: "scheduled" as const,
    };
  });
  if (interviewRows.length) await db.insert(interview).values(interviewRows);

  // ── The workspace itself ────────────────────────────────────────────────
  // The admin dashboard reads the plan, the security posture, what is
  // connected and this period's AI usage. Without these its four KPI tiles
  // render a label and nothing else.
  const members = await db.select().from(user).where(eq(user.agencyId, organizationId));

  await db
    .insert(subscription)
    .values({ organizationId, plan: "growth", seatTotal: 25, renewsAt: daysAgo(-45) })
    .onConflictDoUpdate({
      target: subscription.organizationId,
      set: { seatTotal: 25, plan: "growth", updatedAt: new Date() },
    });

  const period = new Date().toISOString().slice(0, 7);
  await db
    .delete(usageMetric)
    .where(and(eq(usageMetric.organizationId, organizationId), eq(usageMetric.period, period)));
  await db.insert(usageMetric).values({
    id: id(),
    organizationId,
    period,
    aiCreditsUsed: 1284,
    aiCreditsTotal: 3000,
    resumeParsing: 412,
    candidateMatches: 168,
    emailsSent: 903,
    storageUsed: 1_610_612_736,
  });

  const integrationRows = INTEGRATIONS.map((entry) => ({
    id: id(),
    organizationId,
    provider: entry.provider,
    status: entry.status,
    account: entry.account,
    connectedById: owner?.id ?? null,
    connectedByName: owner?.name ?? null,
    lastSyncAt: daysAgo(entry.syncedDaysAgo),
    direction: entry.direction,
    warning: entry.warning ?? null,
  }));
  await db
    .insert(integration)
    .values(
      integrationRows.map(({ connectedById, ...row }) => ({ ...row, connectedBy: connectedById })),
    );

  // Two-factor on every seat but one, so the score lands in the design's band
  // rather than at either extreme.
  for (const [index, member] of members.entries()) {
    await db
      .insert(userSecurity)
      .values({
        userId: member.id,
        twoFactorEnabled: index < members.length - 1 || members.length === 1,
        twoFactorEnabledAt: daysAgo(30),
        passwordChangedAt: daysAgo(45),
      })
      .onConflictDoUpdate({
        target: userSecurity.userId,
        set: { twoFactorEnabled: index < members.length - 1 || members.length === 1 },
      });
  }

  const loginRows = SIGN_INS.map((entry, index) => ({
    id: id(),
    organizationId,
    userId: members[index % Math.max(members.length, 1)]?.id ?? null,
    email: members[index % Math.max(members.length, 1)]?.email ?? "unknown@example.com",
    browser: entry.browser,
    os: entry.os,
    location: entry.location,
    ip: entry.ip,
    result: entry.result,
    createdAt: daysAgo(entry.daysAgo),
  }));
  await db.insert(loginHistory).values(loginRows);

  console.log(`Seeded "${org.name}" (${organizationId})`);
  console.table({
    clients: clientRows.length,
    jobs: jobRows.length,
    openJobs: openJobs.length,
    candidates: candidateRows.length,
    invitations: inviteRows.length,
    stageMoves: moveRows.length,
    interviews: interviewRows.length,
    integrations: integrationRows.length,
    signIns: loginRows.length,
    seats: `${members.length} / 25`,
  });
}

await seed();
process.exit(0);
