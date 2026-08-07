import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { user } from "../models/auth.model";
import { invitation } from "../models/invitation.model";
import { sendTemplateEmail } from "./transactional-email.service";

/** How long an invitation link stays usable. Surfaced in the invite dialog and
 * the pending list, so it is exported rather than restated in copy. */
export const INVITE_TTL_DAYS = 7;
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

/**
 * Emails the invitee the agency's `invite` template. There is no accept token
 * yet — the invite is matched on the address, so the CTA lands on sign-up with
 * the email prefilled. Never throws: a mail failure must not lose the invite.
 */
async function sendInvite(row: InvitationRow) {
  const inviter = row.invitedBy
    ? await db.query.user.findFirst({ where: (u, { eq: is }) => is(u.id, row.invitedBy as string) })
    : null;
  try {
    await sendTemplateEmail({
      agencyId: row.organizationId,
      key: "invite",
      to: { email: row.email },
      vars: {
        name: row.email.split("@")[0] ?? row.email,
        inviter: inviter?.name ?? "A teammate",
        role: row.role,
      },
      actionUrl: `${webOrigin}/create-account?email=${encodeURIComponent(row.email)}`,
    });
  } catch (error) {
    console.error(`[invite] could not email ${row.email}`, error);
  }
}

type InvitationRow = typeof invitation.$inferSelect;

/** Whole days left before the link stops working; negative once it has. */
function daysLeft(date?: Date | null): number {
  if (!date) return 0;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function sentLabel(date?: Date | null): string {
  if (!date) return "—";
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** "30 Jul 2026" — the pending list prints the send date, not a relative one,
 * because it is the thing you compare against the expiry. */
function sentOn(date?: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function mapInvitation(row: InvitationRow, invitedByName = "") {
  const left = daysLeft(row.expiresAt);
  const expired = left <= 0;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    clientAccess: row.clientAccess ?? "",
    status: row.status,
    sent: sentLabel(row.createdAt),
    sentOn: sentOn(row.createdAt),
    invitedByName,
    daysLeft: Math.max(0, left),
    expired,
    /** `error` once expired, `warning` in the last two days, else neutral —
     * the expiry chip's tone. */
    expiryTone: expired ? "error" : left <= 2 ? "warning" : "default",
    expires: expired ? "expired" : left === 1 ? "oneDayLeft" : "daysLeft",
  };
}

export async function listInvitations(organizationId: string) {
  const rows = await db
    .select()
    .from(invitation)
    .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending")))
    .orderBy(asc(invitation.createdAt));

  // One round-trip for every inviter on the page — the list names who sent it.
  const inviterIds = [...new Set(rows.map((row) => row.invitedBy).filter(Boolean))] as string[];
  const inviters = inviterIds.length
    ? await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(inArray(user.id, inviterIds))
    : [];
  const nameById = new Map(inviters.map((row) => [row.id, row.name]));

  const data = rows.map((row) => mapInvitation(row, nameById.get(row.invitedBy ?? "") ?? "—"));
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
        role: input.role ?? "recruiter",
        clientAccess: input.clientAccess ?? null,
        invitedBy,
        expiresAt,
      })),
    )
    .returning();
  await Promise.all(rows.map(sendInvite));
  return { created: rows.map((row) => mapInvitation(row)), skipped };
}

export async function cancelInvitation(organizationId: string, id: string) {
  const [updated] = await db
    .update(invitation)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(eq(invitation.id, id), eq(invitation.organizationId, organizationId)))
    .returning();
  return updated ? mapInvitation(updated) : null;
}

/** Pushes the expiry out and re-sends the invite email. */
export async function resendInvitation(organizationId: string, id: string) {
  const [updated] = await db
    .update(invitation)
    .set({
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000),
      updatedAt: new Date(),
    })
    .where(and(eq(invitation.id, id), eq(invitation.organizationId, organizationId)))
    .returning();
  if (!updated) return null;
  await sendInvite(updated);
  return mapInvitation(updated);
}
