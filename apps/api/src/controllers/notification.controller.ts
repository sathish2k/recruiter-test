import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  listNotifications,
  markAllRead,
  markRead,
} from "../services/notification.service";

export async function getNotifications(ctx: { auth: AuthClaims }) {
  return listNotifications(ctx.auth.agencyId);
}

export async function patchReadAll(ctx: { auth: AuthClaims }) {
  return markAllRead(ctx.auth.agencyId);
}

export async function patchRead(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const result = await markRead(ctx.auth.agencyId, ctx.params.id);
  if ("error" in result) return status(404, "Notification not found");
  return { data: result.data };
}
