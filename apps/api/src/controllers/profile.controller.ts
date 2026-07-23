import { status } from "elysia";
import { auth } from "../auth";
import { record as recordAudit } from "../services/audit-log.service";
import { getProfile, updateProfile } from "../services/profile.service";
import { markPasswordChanged } from "../services/security.service";

type Auth = { id: string; name?: string | null; agencyId?: string | null };

export async function getMyProfile(ctx: { user: Auth }) {
  const profile = await getProfile(ctx.user.id);
  if (!profile) return status(404, "Profile not found");
  return profile;
}

export async function putMyProfile(ctx: {
  user: Auth;
  body: {
    name?: string;
    phone?: string;
    timezone?: string;
    signature?: string;
    image?: string;
    notificationPrefs?: Record<string, boolean>;
    preferences?: Record<string, string>;
  };
}) {
  const updated = await updateProfile(ctx.user.id, ctx.body);
  if (!updated) return status(404, "Profile not found");
  return updated;
}

export async function putMyPassword(ctx: {
  user: Auth;
  request: Request;
  body: { currentPassword: string; newPassword: string };
}) {
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: ctx.body.currentPassword,
        newPassword: ctx.body.newPassword,
      },
      headers: ctx.request.headers,
    });
    await markPasswordChanged(ctx.user.id);
    await recordAudit({
      organizationId: ctx.user.agencyId ?? "",
      userId: ctx.user.id,
      actorName: ctx.user.name ?? "Unknown",
      event: "Changed the account password",
      category: "security",
    });
    return { ok: true };
  } catch {
    await recordAudit({
      organizationId: ctx.user.agencyId ?? "",
      userId: ctx.user.id,
      actorName: ctx.user.name ?? "Unknown",
      event: "Password change failed — wrong current password",
      category: "security",
      severity: "failure",
    });
    return status(400, "Current password is incorrect");
  }
}
