import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
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

export interface CreateInvitationsInput {
  emails: string[];
  role?: string;
  clientAccess?: string;
}

/**
 * Bulk invite — the design's modal takes one email per line, so a send is
 * always a list. Addresses that are already members or already hold a pending
 * invite are reported as `skipped` rather than failing the whole batch.
 */
export async function createInvitations(
  organizationId: string,
  invitedBy: string,
  input: CreateInvitationsInput,
) {
  const emails = [...new Set(input.emails.map((email) => email.trim().toLowerCase()))].filter(
    Boolean,
  );
  if (!emails.length) return { created: [], skipped: [] };

  const [pending, members] = await Promise.all([
    db
      .select({ email: invitation.email })
      .from(invitation)
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending"))),
    db.select({ email: user.email }).from(user).where(eq(user.agencyId, organizationId)),
  ]);
  const taken = new Set([...pending, ...members].map((row) => row.email.toLowerCase()));
  const fresh = emails.filter((email) => !taken.has(email));
  const skipped = emails.filter((email) => taken.has(email));
  if (!fresh.length) return { created: [], skipped };

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000);
  const rows = await db
    .insert(invitation)
    .values(
      fresh.map((email) => ({
        id: randomUUID(),
        organizationId,
        email,
        role: input.role ?? "employee",
        clientAccess: input.clientAccess ?? null,
        invitedBy,
        expiresAt,
      })),
    )
    .returning();
  return { created: rows.map(mapInvitation), skipped };
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
