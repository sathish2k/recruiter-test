import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { contact } from "../models/contact.model";
import {
  type OrganizationRole,
  organization,
  organizationMember,
} from "../models/organization.model";

const memberId = (organizationId: string, userId: string) => `${organizationId}:${userId}`;

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

/** Finds an organization by name, or creates it. */
export async function findOrCreateOrganization(name: string) {
  const [existing] = await db
    .select()
    .from(organization)
    .where(eq(organization.name, name))
    .limit(1);
  if (existing) return { organization: existing, created: false };

  const [created] = await db.insert(organization).values({ id: randomUUID(), name }).returning();
  if (!created) throw new Error("Failed to create organization");
  return { organization: created, created: true };
}

export async function addMember(organizationId: string, userId: string, role: OrganizationRole) {
  const [member] = await db
    .insert(organizationMember)
    .values({ id: memberId(organizationId, userId), organizationId, userId, role })
    .onConflictDoNothing()
    .returning();
  return member ?? null;
}

export async function countMembers(organizationId: string): Promise<number> {
  const rows = await db
    .select()
    .from(organizationMember)
    .where(eq(organizationMember.organizationId, organizationId));
  return rows.length;
}

export interface ProvisionInput {
  userId: string;
  fullName: string;
  email: string;
  organizationName: string;
}

/** Signup provisioning: create/associate the Organization, add the user as a
 * member (Owner when they're the first), and create the linked Contact record
 * so every logged-in user also exists as a person in the CRM. */
export async function provisionSignup(input: ProvisionInput) {
  const { organization: org } = await findOrCreateOrganization(input.organizationName);

  const isFirstMember = (await countMembers(org.id)) === 0;
  const role: OrganizationRole = isFirstMember ? "owner" : "recruiter";
  const member = await addMember(org.id, input.userId, role);

  const { firstName, lastName } = splitName(input.fullName);
  const [person] = await db
    .insert(contact)
    .values({
      id: randomUUID(),
      organizationId: org.id,
      userId: input.userId,
      type: "teammate",
      firstName,
      lastName,
      email: input.email,
    })
    .returning();

  return { organization: org, member, contact: person ?? null, role };
}

/** Columns that live on the table; everything else goes into `settings`. */
const ORG_COLUMNS = ["name", "website", "timezone", "placementFee", "whiteLabel"] as const;

/** Flatten `settings` into the record so the workspace form gets one flat object. */
function flattenOrganization(row: typeof organization.$inferSelect) {
  const { settings, ...rest } = row;
  return { ...rest, ...(settings ?? {}) };
}

export async function getOrganization(id: string) {
  const [org] = await db.select().from(organization).where(eq(organization.id, id)).limit(1);
  return org ? flattenOrganization(org) : null;
}

/** The workspace form posts one flat object; anything that isn't a real column
 * is merged into `settings`. */
export type UpdateOrganizationInput = Record<string, unknown>;

export async function updateOrganization(id: string, patch: UpdateOrganizationInput) {
  const [current] = await db.select().from(organization).where(eq(organization.id, id)).limit(1);
  if (!current) return null;

  const update: Record<string, unknown> = { updatedAt: new Date() };
  const settings: Record<string, unknown> = { ...(current.settings ?? {}) };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    if ((ORG_COLUMNS as readonly string[]).includes(key)) update[key] = value;
    else settings[key] = value;
  }
  update.settings = settings;

  const [updated] = await db
    .update(organization)
    .set(update)
    .where(eq(organization.id, id))
    .returning();
  return updated ? flattenOrganization(updated) : null;
}

export async function getMembership(organizationId: string, userId: string) {
  const [member] = await db
    .select()
    .from(organizationMember)
    .where(
      and(
        eq(organizationMember.organizationId, organizationId),
        eq(organizationMember.userId, userId),
      ),
    )
    .limit(1);
  return member ?? null;
}
