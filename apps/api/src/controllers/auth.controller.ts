import { status } from "elysia";
import {
  type RegisterInput,
  registerAccount,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from "../services/auth.service";
import {
  confirmCode,
  confirmToken,
  sendVerification,
  VerificationError,
} from "../services/email-verification.service";

export async function register(ctx: { body: RegisterInput }) {
  try {
    const account = await registerAccount(ctx.body);
    // The first code goes out with the account, so the verify screen already
    // has something to accept. A mail failure must not fail the registration —
    // the screen's resend covers it.
    await sendVerification(ctx.body.email, { initial: true }).catch((error) => {
      console.error("[verify] initial send failed", error);
    });
    return status(201, account);
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

/* Email verification — §5.1.2. Mandatory: there is no skip path. */

/** Maps a verification failure onto its status, keeping the reason machine-
 * readable so the screen can render a specific state rather than a generic one. */
function verificationStatus(error: unknown) {
  if (!(error instanceof VerificationError)) throw error;
  switch (error.code) {
    case "cooldown":
      return status(429, {
        code: error.code,
        message: error.message,
        retryAfter: error.retryAfter,
      });
    case "hourly-cap":
    case "too-many-attempts":
      return status(429, { code: error.code, message: error.message });
    case "expired":
      return status(410, { code: error.code, message: error.message });
    case "already-verified":
      return { data: { verified: true } };
    default:
      return status(400, { code: error.code, message: error.message });
  }
}

export async function sendVerificationCode(ctx: { body: { email: string } }) {
  try {
    await sendVerification(ctx.body.email);
    return { data: { sent: true } };
  } catch (error) {
    // An unknown address returns success — the endpoint must not disclose which
    // addresses have accounts.
    if (error instanceof VerificationError && error.code === "unknown-email") {
      return { data: { sent: true } };
    }
    return verificationStatus(error);
  }
}

export async function confirmVerificationCode(ctx: { body: { email: string; code: string } }) {
  try {
    const result = await confirmCode(ctx.body.email, ctx.body.code);
    return { data: { verified: true, alreadyVerified: result.alreadyVerified } };
  } catch (error) {
    return verificationStatus(error);
  }
}

export async function confirmVerificationLink(ctx: { query: { token?: string } }) {
  if (!ctx.query.token) return status(400, { code: "invalid", message: "Missing token" });
  try {
    const result = await confirmToken(ctx.query.token);
    return { data: { verified: true, email: result.email } };
  } catch (error) {
    return verificationStatus(error);
  }
}
