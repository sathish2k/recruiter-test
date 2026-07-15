import { createHash, randomBytes } from "node:crypto";
import { isEmailConfigured, sendEmail } from "../lib/mailjet";
import { UserModel } from "../models/user.model";
import { seedAgencyPermissions } from "./permission.service";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface RegisterInput {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

export async function registerAccount(input: RegisterInput) {
  const passwordHash = await Bun.password.hash(input.password);
  // ponytail: agency name stored directly as agencyId until an Agency model
  // exists — swap for a real agency lookup/create when tenants get built.
  const user = await UserModel.create({
    agencyId: input.agency,
    email: input.email,
    name: input.fullName,
    role: "admin",
    passwordHash,
  });
  await seedAgencyPermissions(input.agency);
  return { id: String(user._id), email: user.email, name: user.name };
}

export interface Credentials {
  email: string;
  password: string;
}

export async function verifyCredentials({ email, password }: Credentials) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const ok = await Bun.password.verify(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: String(user._id),
    agencyId: user.agencyId,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export interface PasswordResetResult {
  devResetToken?: string;
}

// Emails a reset link. Silent when the email is unknown so the endpoint never
// reveals which addresses have accounts. A mail failure is swallowed (logged)
// so the endpoint still returns 200 and never leaks account existence.
export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetResult> {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return {};
  const token = randomBytes(32).toString("hex");
  user.resetTokenHash = hashToken(token);
  user.resetTokenExpires = new Date(Date.now() + RESET_TTL_MS);
  await user.save();
  const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const link = `${origin}/reset-password?token=${token}`;
  const mailConfigured = isEmailConfigured();
  if (mailConfigured) {
    try {
      await sendEmail({
        to: { email: user.email, name: user.name },
        subject: "Reset your password",
        html: `<p>Reset your password with the link below (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`,
      });
    } catch (e) {
      console.error("[auth] password reset email failed to send:", e);
    }
  } else {
    console.warn(
      "[auth] mail not configured — skipping password reset email send",
    );
  }
  // ponytail: expose the raw token only in non-production when mail can't be
  // sent, so E2E can complete the reset flow. Never leaks in production.
  if (process.env.NODE_ENV !== "production" && !mailConfigured) {
    return { devResetToken: token };
  }
  return {};
}

// Consumes a reset token and sets the new password. Returns false when the
// token is unknown or expired.
export async function resetPassword(
  token: string,
  password: string,
): Promise<boolean> {
  const user = await UserModel.findOne({
    resetTokenHash: hashToken(token),
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) return false;
  user.passwordHash = await Bun.password.hash(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  return true;
}
