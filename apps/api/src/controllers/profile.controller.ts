import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  changePassword,
  getProfile,
  updateProfile,
  type UpdateProfileInput,
} from "../services/profile.service";

export async function getMyProfile(ctx: { auth: AuthClaims }) {
  const profile = await getProfile(ctx.auth.sub);
  if (!profile) return status(404, "Profile not found");
  return { data: profile };
}

export async function putMyProfile(ctx: {
  auth: AuthClaims;
  body: UpdateProfileInput;
}) {
  const updated = await updateProfile(ctx.auth.sub, ctx.body);
  if (!updated) return status(404, "Profile not found");
  return { data: updated };
}

export async function putMyPassword(ctx: {
  auth: AuthClaims;
  body: { currentPassword: string; newPassword: string };
}) {
  const result = await changePassword(
    ctx.auth.sub,
    ctx.body.currentPassword,
    ctx.body.newPassword,
  );
  if (result === "not-found") return status(404, "Profile not found");
  if (result === "wrong-current") {
    return status(422, "Current password is incorrect");
  }
  return { ok: true };
}
