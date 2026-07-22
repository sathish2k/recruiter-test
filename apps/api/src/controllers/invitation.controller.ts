import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  type CreateInvitationsInput,
  cancelInvitation,
  createInvitations,
  listInvitations,
  resendInvitation,
} from "../services/invitation.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

export async function getInvitations(ctx: { user: Auth }) {
  const { data, totalCount } = await listInvitations(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}

export async function postInvitation(ctx: { user: Auth; body: CreateInvitationsInput }) {
  const { created, skipped } = await createInvitations(
    ctx.user.agencyId ?? "",
    ctx.user.id,
    ctx.body,
  );
  if (!created.length) {
    return status(422, skipped.length ? "Already invited" : "Could not create invitation");
  }
  // One entry per invitee — the audit log lists people, not batches.
  for (const invite of created) {
    await recordAudit({
      organizationId: ctx.user.agencyId ?? "",
      userId: ctx.user.id,
      actorName: ctx.user.name ?? "Unknown",
      event: `Invited ${invite.email} as ${invite.role}`,
      category: "permissions",
      objects: { Invitee: invite.email },
    });
  }
  return status(201, { data: created, meta: { skipped } });
}

export async function postResend(ctx: { user: Auth; params: { id: string } }) {
  const updated = await resendInvitation(ctx.user.agencyId ?? "", ctx.params.id);
  if (!updated) return status(404, "Invitation not found");
  return { data: updated };
}

export async function deleteInvitation(ctx: { user: Auth; params: { id: string } }) {
  const cancelled = await cancelInvitation(ctx.user.agencyId ?? "", ctx.params.id);
  if (!cancelled) return status(404, "Invitation not found");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Cancelled the invitation for ${cancelled.email}`,
    category: "permissions",
    severity: "warning",
    objects: { Invitee: cancelled.email },
  });
  return { data: cancelled };
}
