import { randomUUID } from "node:crypto";
import { count, eq } from "drizzle-orm";
import { db } from "../db";
import {
  type OrganizationRole,
  organization,
  organizationMember,
} from "../models/organization";

export async function findOrCreateOrganization(name: string) {
  const existing = await db.query.organization.findFirst({
    where: (row, { eq: matches }) => matches(row.name, name),
  });
  if (existing) return existing;
  const [created] = await db.insert(organization).values({ id: randomUUID(), name }).returning();
  return created;
}

// The first user of an agency owns it; anyone joining an existing agency by
// name starts as a recruiter.
export async function provisionSignup(input: { userId: string; organizationName: string }) {
  const org = await findOrCreateOrganization(input.organizationName);
  if (!org) throw new Error("organization could not be provisioned");

  const [members] = await db
    .select({ total: count() })
    .from(organizationMember)
    .where(eq(organizationMember.organizationId, org.id));

  const role: OrganizationRole = (members?.total ?? 0) === 0 ? "owner" : "recruiter";
  await db
    .insert(organizationMember)
    .values({ id: `${org.id}:${input.userId}`, organizationId: org.id, userId: input.userId, role })
    .onConflictDoNothing();

  return { organization: org, role };
}
