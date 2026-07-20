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
  return { organization: created!, created: true };
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

export async function getOrganization(id: string) {
  const [org] = await db.select().from(organization).where(eq(organization.id, id)).limit(1);
  return org ?? null;
}

export async function updateOrganization(id: string, patch: { name?: string }) {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.name !== undefined) update.name = patch.name;
  const [updated] = await db
    .update(organization)
    .set(update)
    .where(eq(organization.id, id))
    .returning();
  return updated ?? null;
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
