import {
  type AuditKind,
  AuditLogModel,
  type AuditLogDoc,
} from "../models/audit-log.model";

export interface AuditEvent {
  id: string;
  actorInitials: string;
  actorColorKey: string;
  kind: AuditKind;
  text: string;
  ip: string;
  whenLabel: string;
}

const DEMO_EVENTS: Omit<AuditLogDoc, "agencyId">[] = [
  {
    actor: "Riya Kapoor",
    actorInitials: "RK",
    actorColorKey: "orange",
    kind: "permissions",
    text: "Changed Dev Shah's role from Employee to Profile lead",
    ip: "10.4.22.19",
    ts: 900,
    whenLabel: "Today · 9:41 AM",
  },
  {
    actor: "Ana Novak",
    actorInitials: "AN",
    actorColorKey: "blue",
    kind: "candidates",
    text: "Submitted Savannah Nguyen's CV to Nortech for Senior Backend Engineer",
    ip: "10.4.22.41",
    ts: 890,
    whenLabel: "Today · 9:02 AM",
  },
  {
    actor: "Tom Weaver",
    actorInitials: "TW",
    actorColorKey: "green",
    kind: "client",
    text: "Approved candidate Alexis Kim via the Vantor client portal",
    ip: "72.14.201.8",
    ts: 880,
    whenLabel: "Yesterday · 6:18 PM",
  },
  {
    actor: "Dev Shah",
    actorInitials: "DS",
    actorColorKey: "slate",
    kind: "candidates",
    text: "Imported 48 candidates from a CSV upload",
    ip: "10.4.22.19",
    ts: 870,
    whenLabel: "Yesterday · 3:52 PM",
  },
  {
    actor: "System",
    actorInitials: "SY",
    actorColorKey: "amber",
    kind: "billing",
    text: "Started a Pro plan 14-day trial for the agency",
    ip: "—",
    ts: 860,
    whenLabel: "Yesterday · 11:07 AM",
  },
  {
    actor: "System",
    actorInitials: "SY",
    actorColorKey: "slate",
    kind: "system",
    text: "Ran automation 'New CV → notify profile lead' (12 matches)",
    ip: "—",
    ts: 850,
    whenLabel: "2 days ago · 8:00 AM",
  },
  {
    actor: "Riya Kapoor",
    actorInitials: "RK",
    actorColorKey: "orange",
    kind: "permissions",
    text: "Invited mira@demo.dev to join as Employee",
    ip: "10.4.22.19",
    ts: 840,
    whenLabel: "2 days ago · 4:33 PM",
  },
  {
    actor: "Mira Joshi",
    actorInitials: "MJ",
    actorColorKey: "green",
    kind: "jobs",
    text: "Published the ML Engineer role for Vantor",
    ip: "10.4.22.55",
    ts: 830,
    whenLabel: "3 days ago · 2:11 PM",
  },
  {
    actor: "System",
    actorInitials: "SY",
    actorColorKey: "slate",
    kind: "system",
    text: "Delivered the weekly team activity report to 3 leads",
    ip: "—",
    ts: 820,
    whenLabel: "3 days ago · 9:00 AM",
  },
  {
    actor: "Ana Novak",
    actorInitials: "AN",
    actorColorKey: "blue",
    kind: "candidates",
    text: "Rejected a CV — compensation expectations out of band",
    ip: "10.4.22.41",
    ts: 810,
    whenLabel: "4 days ago · 5:47 PM",
  },
];

export async function seedAuditLog(agencyId: string): Promise<void> {
  await AuditLogModel.deleteMany({ agencyId });
  await AuditLogModel.insertMany(
    DEMO_EVENTS.map((event) => ({ ...event, agencyId })),
  );
}

export async function listAuditLog(
  agencyId: string,
  kind?: string,
): Promise<AuditEvent[]> {
  const filter: Record<string, unknown> = { agencyId };
  if (kind && kind !== "all") filter.kind = kind;
  if ((await AuditLogModel.countDocuments({ agencyId })) === 0) {
    await seedAuditLog(agencyId);
  }
  const docs = await AuditLogModel.find(filter).sort({ ts: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    actorInitials: doc.actorInitials,
    actorColorKey: doc.actorColorKey,
    kind: doc.kind,
    text: doc.text,
    ip: doc.ip,
    whenLabel: doc.whenLabel,
  }));
}
