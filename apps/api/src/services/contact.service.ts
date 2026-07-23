import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, getTableColumns, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { client } from "../models/client.model";
import { type ContactAttachment, type ContactType, contact } from "../models/contact.model";

type ContactRow = typeof contact.$inferSelect;

function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

function mapContact(row: ContactRow & { clientName?: string | null; ownerName?: string | null }) {
  return {
    id: row.id,
    salutation: row.salutation ?? "",
    firstName: row.firstName,
    lastName: row.lastName,
    name: fullName(row.firstName, row.lastName),
    email: row.email ?? "",
    secondaryEmail: row.secondaryEmail ?? "",
    phone: row.phone ?? "",
    mobile: row.mobile ?? "",
    title: row.title ?? "",
    department: row.department ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    source: row.source ?? "",
    notes: row.notes ?? "",
    attachments: row.attachments ?? [],
    clientId: row.clientId ?? "",
    clientName: row.clientName ?? "",
    ownerId: row.ownerId ?? "",
    ownerName: row.ownerName ?? "",
    status: row.status,
    isPrimary: row.isPrimary,
    emailOptOut: row.emailOptOut,
    type: row.type,
  };
}

const SORT_FIELDS = {
  name: contact.firstName,
  createdAt: contact.createdAt,
} as const;

function split(value?: string) {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface ListContactsParams {
  search?: string;
  client?: string;
  owner?: string;
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDir?: string;
}

export async function listContacts(organizationId: string, params: ListContactsParams = {}) {
  const filters = [eq(contact.organizationId, organizationId), eq(contact.archived, false)];

  if (params.search) {
    const term = `%${params.search}%`;
    const match = or(
      ilike(contact.firstName, term),
      ilike(contact.lastName, term),
      ilike(contact.email, term),
      ilike(contact.phone, term),
      ilike(contact.title, term),
    );
    if (match) filters.push(match);
  }
  const clients = split(params.client);
  if (clients.length) filters.push(inArray(contact.clientId, clients));
  const owners = split(params.owner);
  if (owners.length) filters.push(inArray(contact.ownerId, owners));

  const where = and(...filters);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const column = SORT_FIELDS[params.sortKey as keyof typeof SORT_FIELDS] ?? contact.createdAt;
  const order = params.sortDir === "asc" ? asc(column) : desc(column);

  const [rows, countRows] = await Promise.all([
    db
      .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
      .from(contact)
      .leftJoin(client, eq(contact.clientId, client.id))
      .leftJoin(user, eq(contact.ownerId, user.id))
      .where(where)
      .orderBy(order)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(contact).where(where),
  ]);

  return { data: rows.map(mapContact), totalCount: countRows[0]?.total ?? 0 };
}

export async function getContact(organizationId: string, id: string) {
  const [row] = await db
    .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
    .from(contact)
    .leftJoin(client, eq(contact.clientId, client.id))
    .leftJoin(user, eq(contact.ownerId, user.id))
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .limit(1);
  return row ? mapContact(row) : null;
}

export interface ContactInput {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  linkedin?: string;
  twitter?: string;
  source?: string;
  notes?: string;
  attachments?: ContactAttachment[];
  clientId?: string;
  ownerId?: string;
  status?: string;
  isPrimary?: boolean;
  emailOptOut?: boolean;
  type?: string;
}

const EDITABLE = [
  "salutation",
  "firstName",
  "lastName",
  "email",
  "secondaryEmail",
  "phone",
  "mobile",
  "title",
  "department",
  "linkedin",
  "twitter",
  "source",
  "notes",
  "attachments",
  "clientId",
  "ownerId",
  "status",
  "isPrimary",
  "emailOptOut",
] as const;

function pickEditable(input: ContactInput): Partial<ContactRow> {
  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (input[field] === undefined) continue;
    patch[field] =
      input[field] === "" && field !== "firstName" && field !== "lastName" ? null : input[field];
  }
  return patch as Partial<ContactRow>;
}

const toE164 = (value: string) => value.replace(/[^\d+]/g, "");
function normalizeLinkedin(value: string) {
  const v = value.trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  return /^([\w-]+\.)?linkedin\.com/i.test(v) ? `https://${v}` : v;
}
function normalizeTwitter(value: string) {
  const v = value.trim();
  if (!v) return v;
  const handle = v.replace(/^https?:\/\/(x|twitter)\.com\//i, "").replace(/^@/, "");
  return `@${handle.replace(/\/.*$/, "")}`;
}

/** Canonicalise inputs so storage stays consistent regardless of the client. */
function normalizeInput(input: ContactInput): ContactInput {
  const out = { ...input };
  if (out.email !== undefined) out.email = out.email.trim().toLowerCase();
  if (out.secondaryEmail !== undefined)
    out.secondaryEmail = out.secondaryEmail.trim().toLowerCase();
  if (out.phone) out.phone = toE164(out.phone);
  if (out.mobile) out.mobile = toE164(out.mobile);
  if (out.linkedin) out.linkedin = normalizeLinkedin(out.linkedin);
  if (out.twitter) out.twitter = normalizeTwitter(out.twitter);
  // Secondary email can never equal the primary.
  if (out.secondaryEmail && out.email && out.secondaryEmail === out.email) out.secondaryEmail = "";
  return out;
}

/** At most one primary per client — clear the others. */
async function clearOtherPrimaries(organizationId: string, clientId: string, exceptId: string) {
  await db
    .update(contact)
    .set({ isPrimary: false })
    .where(
      and(
        eq(contact.organizationId, organizationId),
        eq(contact.clientId, clientId),
        ne(contact.id, exceptId),
      ),
    );
}

export async function createContact(organizationId: string, rawInput: ContactInput) {
  const input = normalizeInput(rawInput);
  // Default the owner to the client's account lead when none was chosen.
  let ownerId = input.ownerId;
  if (!ownerId && input.clientId) {
    const [row] = await db
      .select({ lead: client.accountLeadId })
      .from(client)
      .where(and(eq(client.id, input.clientId), eq(client.organizationId, organizationId)))
      .limit(1);
    ownerId = row?.lead ?? undefined;
  }
  const [created] = await db
    .insert(contact)
    .values({
      id: randomUUID(),
      organizationId,
      type: (input.type as ContactType) ?? "hiring_manager",
      firstName: input.firstName?.trim() ?? "",
      lastName: input.lastName?.trim() ?? "",
      ...pickEditable({ ...input, ownerId, firstName: undefined, lastName: undefined }),
    })
    .returning();
  if (created?.isPrimary && created.clientId) {
    await clearOtherPrimaries(organizationId, created.clientId, created.id);
  }
  return created ? mapContact(created) : null;
}

export async function updateContact(organizationId: string, id: string, rawInput: ContactInput) {
  const input = normalizeInput(rawInput);
  const [updated] = await db
    .update(contact)
    .set({ ...pickEditable(input), updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  if (updated?.isPrimary && updated.clientId) {
    await clearOtherPrimaries(organizationId, updated.clientId, updated.id);
  }
  return updated ? mapContact(updated) : null;
}

export interface DuplicateQuery {
  clientId: string;
  email?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  excludeId?: string;
}

/** Same-client contacts matching by email, mobile or first+last name. */
export async function findDuplicates(organizationId: string, query: DuplicateQuery) {
  if (!query.clientId) return [];
  const matchers = [];
  if (query.email) matchers.push(eq(contact.email, query.email.trim().toLowerCase()));
  if (query.mobile) matchers.push(eq(contact.mobile, toE164(query.mobile)));
  if (query.firstName && query.lastName) {
    matchers.push(
      and(ilike(contact.firstName, query.firstName), ilike(contact.lastName, query.lastName)),
    );
  }
  const anyMatch = or(...matchers);
  if (!anyMatch) return [];

  const filters = [
    eq(contact.organizationId, organizationId),
    eq(contact.clientId, query.clientId),
    eq(contact.archived, false),
    anyMatch,
  ];
  if (query.excludeId) filters.push(ne(contact.id, query.excludeId));

  const rows = await db
    .select({ ...getTableColumns(contact), clientName: client.name, ownerName: user.name })
    .from(contact)
    .leftJoin(client, eq(contact.clientId, client.id))
    .leftJoin(user, eq(contact.ownerId, user.id))
    .where(and(...filters))
    .limit(5);
  return rows.map(mapContact);
}

export async function archiveContact(organizationId: string, id: string) {
  const [archived] = await db
    .update(contact)
    .set({ archived: true, isPrimary: false, updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return archived ? { id: archived.id } : null;
}

export async function deleteContact(organizationId: string, id: string) {
  const [deleted] = await db
    .delete(contact)
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return deleted ? { id: deleted.id } : null;
}

/** Makes one contact the primary for its client, clearing the others. */
export async function setPrimary(organizationId: string, id: string) {
  const [target] = await db
    .select({ clientId: contact.clientId })
    .from(contact)
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .limit(1);
  if (!target) return null;
  if (target.clientId) {
    await db
      .update(contact)
      .set({ isPrimary: false })
      .where(
        and(eq(contact.organizationId, organizationId), eq(contact.clientId, target.clientId)),
      );
  }
  const [updated] = await db
    .update(contact)
    .set({ isPrimary: true, updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.organizationId, organizationId)))
    .returning();
  return updated ? { id: updated.id } : null;
}
