import { status } from "elysia";
import {
  archiveContact,
  type ContactInput,
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
