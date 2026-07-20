import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  type CreateInvitationInput,
  cancelInvitation,
  createInvitation,
  listInvitations,
  resendInvitation,
} from "../services/invitation.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

export async function getInvitations(ctx: { user: Auth }) {
  const { data, totalCount } = await listInvitations(ctx.user.agencyId ?? "");
  return { data, meta: { totalCount } };
}

export async function postInvitation(ctx: { user: Auth; body: CreateInvitationInput }) {
  const created = await createInvitation(ctx.user.agencyId ?? "", ctx.user.id, ctx.body);
  if (!created) return status(422, "Could not create invitation");
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `Invited ${created.email} as ${created.role}`,
    category: "permissions",
    objects: { Invitee: created.email },
  });
  return status(201, { data: created });
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
