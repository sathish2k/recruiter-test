import { status } from "elysia";
import { auth } from "../auth";
import { getProfile, updateProfile } from "../services/profile.service";

type Auth = { id: string };

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
    notificationPrefs?: Record<string, boolean>;
  };
}) {
  const updated = await updateProfile(ctx.user.id, ctx.body);
  if (!updated) return status(404, "Profile not found");
  return updated;
}

export async function putMyPassword(ctx: {
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
    return { ok: true };
  } catch {
    return status(400, "Current password is incorrect");
  }
}
