import { status } from "elysia";
import {
  archiveContact,
  type ContactInput,
  type ContactWorkspaceTab,
  contactBriefing,
  contactClientCard,
  contactInfo,
  contactKpis,
  contactRelationship,
  contactSummary,
  contactWaiting,
  contactWorkspace,
  createContact,
  deleteContact,
  findDuplicates,
  getContact,
  listContacts,
  setPrimary,
  updateContact,
} from "../services/contact.service";

type Auth = { agencyId?: string | null };

export async function getContacts(ctx: { user: Auth; query: Record<string, string | undefined> }) {
  const { data, totalCount } = await listContacts(ctx.user.agencyId ?? "", {
    search: ctx.query.search,
    client: ctx.query.client,
    owner: ctx.query.owner,
    page: ctx.query.page ? Number(ctx.query.page) : undefined,
    pageSize: ctx.query.pageSize ? Number(ctx.query.pageSize) : undefined,
    sortKey: ctx.query.sortKey,
    sortDir: ctx.query.sortDir,
  });
  return { data, meta: { totalCount } };
}

export async function getContactById(ctx: { user: Auth; params: { id: string } }) {
  const found = await getContact(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Contact not found");
  return found;
}

export async function getDuplicates(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  const data = await findDuplicates(ctx.user.agencyId ?? "", {
    clientId: ctx.query.clientId ?? "",
    email: ctx.query.email,
    mobile: ctx.query.mobile,
    firstName: ctx.query.firstName,
    lastName: ctx.query.lastName,
    excludeId: ctx.query.excludeId,
  });
  return { data };
}

export async function postContact(ctx: { user: Auth; body?: ContactInput | null }) {
  const created = await createContact(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!created) return status(422, "Could not create contact");
  return status(201, { data: created });
}

export async function putContact(ctx: {
  user: Auth;
  params: { id: string };
  body?: ContactInput | null;
}) {
  const updated = await updateContact(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Contact not found");
  return { data: updated };
}

export async function removeContact(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteContact(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Contact not found");
  return { data: deleted };
}

export async function postArchive(ctx: { user: Auth; params: { id: string } }) {
  const archived = await archiveContact(ctx.user.agencyId ?? "", ctx.params.id);
  if (!archived) return status(404, "Contact not found");
  return { data: archived };
}

export async function postPrimary(ctx: { user: Auth; params: { id: string } }) {
  const updated = await setPrimary(ctx.user.agencyId ?? "", ctx.params.id);
  if (!updated) return status(404, "Contact not found");
  return { data: updated };
}

/* The contact detail screen — one handler per card, so a slow panel never
 * holds up the rest of the page. */

export async function getContactSummary(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactSummary(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}

export async function getContactBriefing(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactBriefing(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}

export async function getContactWaiting(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactWaiting(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}

export async function getContactWorkspace(ctx: {
  user: Auth;
  params: { id: string };
  query: Record<string, string | undefined>;
}) {
  const data = await contactWorkspace(
    ctx.user.agencyId ?? "",
    ctx.params.id,
    (ctx.query.tab as ContactWorkspaceTab) ?? "activity",
    ctx.query.activity ?? "all",
  );
  return { data };
}

export async function getContactInfo(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactInfo(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}

export async function getContactRelationship(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactRelationship(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}

export async function getContactClientCard(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactClientCard(ctx.user.agencyId ?? "", ctx.params.id);
  return { data };
}

export async function getContactKpis(ctx: { user: Auth; params: { id: string } }) {
  const data = await contactKpis(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Contact not found");
  return { data };
}
