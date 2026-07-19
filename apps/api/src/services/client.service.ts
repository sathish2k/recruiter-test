import { isValidObjectId } from "mongoose";
import { type ClientDoc, ClientModel } from "../models/client.model";
import { type JobDoc, JobModel } from "../models/job.model";

export interface ClientFilters {
  search?: string;
  status?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapClient(c: ClientDoc & { _id: unknown }) {
  return {
    id: String(c._id),
    name: c.name,
    industry: c.industry,
    manager: c.manager,
    status: c.status,
    openRoles: c.openRoles,
    hires: c.hires,
    sourced: c.sourced,
    screened: c.screened,
    interviewing: c.interviewing,
    pipeline: c.sourced + c.screened + c.interviewing,
    activity: c.activity,
  };
}

export async function listClients(
  agencyId: string,
  filters: ClientFilters = {},
) {
  const { search, status } = filters;
  const searchMatch: Record<string, unknown> = { agencyId };
  if (search?.trim()) {
    const rx = new RegExp(escapeRegExp(search.trim()), "i");
    searchMatch.$or = [{ name: rx }, { industry: rx }];
  }

  // Counts + summary are computed at the DB level over the search-filtered set
  // (status NOT applied), so search narrows them but the status toggle doesn't.
  // The card list additionally applies the status filter in the same query.
  const listMatch =
    status && status !== "all" ? { ...searchMatch, status } : searchMatch;

  const [docs, statusGroups, summaryAgg] = await Promise.all([
    ClientModel.find(listMatch).sort({ name: 1 }).lean(),
    ClientModel.aggregate<{ _id: string; count: number }>([
      { $match: searchMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    ClientModel.aggregate<{
      openRoles: number;
      openRoleClients: number;
      placements: number;
    }>([
      { $match: searchMatch },
      {
        $group: {
          _id: null,
          openRoles: { $sum: "$openRoles" },
          openRoleClients: {
            $sum: { $cond: [{ $gt: ["$openRoles", 0] }, 1, 0] },
          },
          placements: { $sum: "$hires" },
        },
      },
    ]),
  ]);

  const byStatus = Object.fromEntries(
    statusGroups.map((g) => [g._id, g.count]),
  );
  const counts = {
    all: statusGroups.reduce((n, g) => n + g.count, 0),
    hiring: byStatus.hiring ?? 0,
    paused: byStatus.paused ?? 0,
  };

  const agg = summaryAgg[0];
  const summary = {
    active: counts.all,
    openRoles: agg?.openRoles ?? 0,
    openRoleClients: agg?.openRoleClients ?? 0,
    placements: agg?.placements ?? 0,
    // ponytail: no hire-timing data yet — static to match the design.
    avgTimeToHire: 21,
  };

  const data = docs.map((c) => mapClient(c as ClientDoc & { _id: unknown }));
  return { data, counts, summary, totalCount: data.length };
}

export interface CreateClientInput {
  name: string;
  industry?: string;
  manager?: string;
}

export async function createClient(agencyId: string, input: CreateClientInput) {
  const doc = await ClientModel.create({
    agencyId,
    name: input.name,
    industry: input.industry ?? "",
    manager: input.manager ?? "",
    status: "hiring",
    activity: "Created just now",
  });
  return mapClient(doc.toObject() as ClientDoc & { _id: unknown });
}

function mapJobRole(j: JobDoc & { _id: unknown }) {
  const sourcer = j.team.find((m) => /source|employee/i.test(m.roleLabel));
  const lead = j.team.find((m) => /lead|review|submit/i.test(m.roleLabel));
  return {
    id: String(j._id),
    title: j.title,
    meta: [j.level, j.roleCat, j.location].filter(Boolean).join(" · "),
    empName: sourcer?.name ?? j.team[0]?.name ?? "Unassigned",
    empInitials: sourcer?.initials ?? j.team[0]?.initials ?? "—",
    empBg: sourcer?.avatarBg ?? "#3A4A5B",
    empFg: sourcer?.avatarFg ?? "#CFE3F5",
    leadName: lead?.name ?? j.team[1]?.name ?? "—",
    pipeline: j.pipeline,
    submitted: j.matched,
    status: j.status,
  };
}

function mapSubmission(s: ClientSubmissionDoc) {
  return {
    id: String(s._id),
    name: s.name,
    initials: s.initials,
    avatarBg: s.avatarBg,
    avatarFg: s.avatarFg,
    score: s.score,
    role: s.role,
    submittedWhen: s.submittedWhen,
    sourcer: s.sourcer,
    decision: s.decision,
    reason: s.reason,
  };
}

interface ClientSubmissionDoc {
  _id: unknown;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  score: number;
  role: string;
  submittedWhen: string;
  sourcer: string;
  decision: "pending" | "approved" | "rejected";
  reason: string;
}

export async function getClientDetail(id: string, agencyId: string) {
  if (!isValidObjectId(id)) return null;
  const doc = await ClientModel.findOne({ _id: id, agencyId }).lean();
  if (!doc) return null;
  const c = doc as ClientDoc & { _id: unknown };

  const jobDocs = await JobModel.find({ agencyId, client: c.name })
    .sort({ postedTs: -1 })
    .lean();
  const roles = jobDocs.map((j) => mapJobRole(j as JobDoc & { _id: unknown }));

  const submissions = (
    (c.submissions ?? []) as unknown as ClientSubmissionDoc[]
  ).map(mapSubmission);
  const pending = submissions.filter((s) => s.decision === "pending");
  const pipeline = c.sourced + c.screened + c.interviewing;

  return {
    id: String(c._id),
    name: c.name,
    industry: c.industry,
    manager: c.manager,
    status: c.status,
    since: c.since,
    initial: c.name.charAt(0).toUpperCase(),
    primaryContact: c.primaryContact,
    placementFee: c.placementFee,
    kpis: {
      openRoles: c.openRoles,
      pipeline,
      awaiting: pending.length,
      hires: c.hires,
      avgTimeToHire: 19,
    },
    submissions,
    roles,
    contacts: c.contacts ?? [],
    agreement: c.agreement ?? {},
    activity: c.activityLog ?? [],
  };
}

export interface UpdateClientInput {
  name?: string;
  industry?: string;
  manager?: string;
  primaryContact?: string;
  placementFee?: string;
  status?: "hiring" | "paused";
}

export async function updateClient(
  id: string,
  agencyId: string,
  patch: UpdateClientInput,
) {
  if (!isValidObjectId(id)) return null;
  const set: UpdateClientInput = {};
  if (typeof patch.name === "string") set.name = patch.name;
  if (typeof patch.industry === "string") set.industry = patch.industry;
  if (typeof patch.manager === "string") set.manager = patch.manager;
  if (typeof patch.primaryContact === "string")
    set.primaryContact = patch.primaryContact;
  if (typeof patch.placementFee === "string")
    set.placementFee = patch.placementFee;
  if (patch.status === "hiring" || patch.status === "paused")
    set.status = patch.status;
  const doc = await ClientModel.findOneAndUpdate(
    { _id: id, agencyId },
    { $set: set },
    { new: true },
  ).lean();
  if (!doc) return null;
  return mapClient(doc as ClientDoc & { _id: unknown });
}

export async function deleteClient(id: string, agencyId: string) {
  if (!isValidObjectId(id)) return null;
  const doc = await ClientModel.findOneAndDelete({ _id: id, agencyId }).lean();
  return doc ? { id } : null;
}

export async function decideSubmission(
  clientId: string,
  submissionId: string,
  agencyId: string,
  decision: "approved" | "rejected",
  reason = "",
) {
  if (!isValidObjectId(clientId)) return null;
  const doc = await ClientModel.findOneAndUpdate(
    { _id: clientId, agencyId, "submissions._id": submissionId },
    {
      $set: {
        "submissions.$.decision": decision,
        "submissions.$.reason": reason,
      },
    },
    { new: true },
  ).lean();
  if (!doc) return null;
  const c = doc as ClientDoc & { _id: unknown };
  const submissions = (
    (c.submissions ?? []) as unknown as ClientSubmissionDoc[]
  ).map(mapSubmission);
  return { submissions };
}
