import { type ClientDoc, ClientModel } from "../models/client.model";

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
