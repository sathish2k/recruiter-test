import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { invitation } from "../models/invitation.model";

const INVITE_TTL_DAYS = 14;

type InvitationRow = typeof invitation.$inferSelect;

function relative(date?: Date | null): string {
  if (!date) return "—";
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

function sentLabel(date?: Date | null): string {
  if (!date) return "—";
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function mapInvitation(row: InvitationRow) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    clientAccess: row.clientAccess ?? "",
    status: row.status,
    sent: sentLabel(row.createdAt),
    expires: relative(row.expiresAt),
  };
}

export async function listInvitations(organizationId: string) {
  const rows = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending")))
    .orderBy(asc(invitation.createdAt));
  const data = rows.map(mapInvitation);
  return { data, totalCount: data.length };
}

export interface CreateInvitationInput {
  email: string;
  role?: string;
  clientAccess?: string;
}

export async function createInvitation(
  organizationId: string,
  invitedBy: string,
  input: CreateInvitationInput,
) {
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000);
  const [created] = await db
    .insert(invitation)
    .values({
      id: randomUUID(),
      organizationId,
      email: input.email,
      role: input.role ?? "employee",
      clientAccess: input.clientAccess ?? null,
      invitedBy,
      expiresAt,
    })
    .returning();
  return created ? mapInvitation(created) : null;
}

export async function cancelInvitation(organizationId: string, id: string) {
  const [updated] = await db
    .update(invitation)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(invitation.id, id), eq(invitation.organizationId, organizationId)))
    .returning();
  return updated ? mapInvitation(updated) : null;
}

/** Pushes the expiry out; the caller re-sends the email. */
export async function resendInvitation(organizationId: string, id: string) {
  const [updated] = await db
    .update(invitation)
    .set({
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000),
      updatedAt: new Date(),
    })
    .where(and(eq(invitation.id, id), eq(invitation.organizationId, organizationId)))
    .returning();
  return updated ? mapInvitation(updated) : null;
}
