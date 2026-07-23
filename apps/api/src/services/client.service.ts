import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, getTableColumns, ilike, inArray, or, sum } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import {
  type ClientAddress,
  type ClientAttachment,
  type ClientStatus,
  client,
} from "../models/client.model";

type ClientRow = typeof client.$inferSelect;

function mapClient(row: ClientRow & { accountLeadName?: string | null }) {
  return {
    id: row.id,
    name: row.name,
    parentCompany: row.parentCompany ?? "",
    primaryContactId: row.primaryContactId ?? "",
    industry: row.industry ?? "",
    website: row.website ?? "",
    phone: row.phone ?? "",
    billingEmail: row.billingEmail ?? "",
    address: row.address ?? {},
    shippingAddress: row.shippingAddress ?? {},
    shippingSameAsBilling: row.shippingSameAsBilling ?? true,
    contract: row.contract ?? [],
    attachments: row.attachments ?? [],
    accountLeadId: row.accountLeadId ?? "",
    accountLeadName: row.accountLeadName ?? "",
    source: row.source ?? "",
    feeBasis: row.feeBasis ?? "percent",
    feeValue: row.feeValue ?? "",
    paymentTerms: row.paymentTerms ?? "",
    taxId: row.taxId ?? "",
    notes: row.notes ?? "",
    status: row.status,
    health: row.health,
    logo: row.logo ?? "",
    openRoles: row.openRoles,
    candidates: row.candidates,
    placements: row.placements,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const SORT_FIELDS = {
  name: client.name,
  status: client.status,
  createdAt: client.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListClientsParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

export async function listClients(organizationId: string, params: ListClientsParams = {}) {
  const filters = [eq(client.organizationId, organizationId)];

  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(ilike(client.name, term), ilike(client.industry, term));
    if (match) filters.push(match);
  }
  const statuses = split(params.status);
  if (statuses.length) filters.push(inArray(client.status, statuses as ClientStatus[]));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? client.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows] = await Promise.all([
    db
      .select({ ...getTableColumns(client), accountLeadName: user.name })
      .from(client)
      .leftJoin(user, eq(client.accountLeadId, user.id))
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(client).where(where),
  ]);

  return { data: rows.map(mapClient), totalCount: countRows[0]?.total ?? 0 };
}

export async function clientStats(organizationId: string) {
  const where = eq(client.organizationId, organizationId);
  const [byStatusRows, [totals]] = await Promise.all([
    db
      .select({ status: client.status, total: count() })
      .from(client)
      .where(where)
      .groupBy(client.status),
    db
      .select({ openRoles: sum(client.openRoles), placements: sum(client.placements) })
      .from(client)
      .where(where),
  ]);
  const byStatus = Object.fromEntries(byStatusRows.map((r) => [r.status, r.total]));
  const active = byStatusRows.reduce((acc, r) => acc + r.total, 0);
  return {
    active,
    hiring: byStatus.hiring ?? 0,
    paused: byStatus.paused ?? 0,
    openRoles: Number(totals?.openRoles ?? 0),
    placements: Number(totals?.placements ?? 0),
  };
}

export async function getClient(organizationId: string, id: string) {
  const [row] = await db
    .select({ ...getTableColumns(client), accountLeadName: user.name })
    .from(client)
    .leftJoin(user, eq(client.accountLeadId, user.id))
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .limit(1);
  return row ? mapClient(row) : null;
}

export interface ClientInput {
  name?: string;
  parentCompany?: string;
  primaryContactId?: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingEmail?: string;
  address?: ClientAddress;
  shippingAddress?: ClientAddress;
  shippingSameAsBilling?: boolean;
  contract?: ClientAttachment[];
  attachments?: ClientAttachment[];
  accountLeadId?: string;
  source?: string;
  feeBasis?: string;
  feeValue?: string;
  paymentTerms?: string;
  taxId?: string;
  notes?: string;
  status?: string;
  health?: string;
  logo?: string;
}

const EDITABLE = [
  "name",
  "parentCompany",
  "primaryContactId",
  "industry",
  "website",
  "phone",
  "billingEmail",
  "address",
  "shippingAddress",
  "shippingSameAsBilling",
  "contract",
  "attachments",
  "accountLeadId",
  "source",
  "feeBasis",
  "feeValue",
  "paymentTerms",
  "taxId",
  "notes",
  "status",
  "health",
  "logo",
] as const;

function pickEditable(input: ClientInput): Partial<ClientRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] !== undefined) patch[field] = input[field] === "" ? null : input[field];
  }
  return patch as Partial<ClientRow>;
}

const toE164 = (value: string) => value.replace(/[^\d+]/g, "");
function normalizeWebsite(value: string) {
  const v = value.trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

/** Canonicalise inputs so storage stays consistent. */
function normalizeInput(input: ClientInput): ClientInput {
  const out = { ...input };
  if (out.billingEmail !== undefined) out.billingEmail = out.billingEmail.trim().toLowerCase();
  if (out.phone) out.phone = toE164(out.phone);
  if (out.website) out.website = normalizeWebsite(out.website);
  return out;
}

export async function createClient(organizationId: string, rawInput: ClientInput) {
  const input = normalizeInput(rawInput);
  const [created] = await db
    .insert(client)
    .values({
      id: randomUUID(),
      organizationId,
      name: input.name?.trim() || "Untitled client",
      ...pickEditable({ ...input, name: undefined }),
    })
    .returning();
  return created ? mapClient(created) : null;
}

export async function updateClient(organizationId: string, id: string, rawInput: ClientInput) {
  const input = normalizeInput(rawInput);
  const [updated] = await db
    .update(client)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .returning();
  return updated ? mapClient(updated) : null;
}

export async function deleteClient(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(client)
    .where(and(eq(client.id, id), eq(client.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}
