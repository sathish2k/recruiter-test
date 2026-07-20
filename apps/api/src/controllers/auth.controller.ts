import { status } from "elysia";
import {
  type RegisterInput,
  registerAccount,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "../services/auth.service";

export async function register(ctx: { body: RegisterInput }) {
  try {
    return status(201, await registerAccount(ctx.body));
  } catch (e) {
    const message = (e as { body?: { message?: string }; message?: string }).body?.message ?? "";
    if (/exist|already/i.test(message)) {
      return status(409, "Email already registered");
    }
    throw e;
  }
}

export async function forgotPassword(ctx: { body: { email: string } }) {
  await requestPasswordReset(ctx.body.email);
  return { ok: true };
}

export async function resetPassword(ctx: { body: { token: string; password: string } }) {
  try {
    await resetPasswordService(ctx.body.token, ctx.body.password);
    return { ok: true };
  } catch {
    return status(400, "Invalid or expired reset link");
  }
}
