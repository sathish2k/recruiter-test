import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../models/auth.model";
import { provisionSignup } from "./organization.service";
import { seedAgencyPermissions } from "./permission.service";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

export interface RegisterInput {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

// Signup provisioning. A User is the login identity; a Contact is the person in
// the CRM. Every signup creates both, plus the Organization and the membership:
//   1. User          — via Better Auth (owns credentials/hashing)
//   2. Organization  — created, or associated when it already exists
//   3. Membership    — Owner for the first user of that org, else Recruiter
//   4. Contact       — the person record linked back to the User
// The User is created first so a duplicate email fails before any org is made.
export async function registerAccount(input: RegisterInput) {
  const res = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.fullName,
    },
  });

  const { organization, role } = await provisionSignup({
    userId: res.user.id,
    fullName: input.fullName,
    email: input.email,
    organizationName: input.agency,
  });

  // Denormalised onto the user so the session carries the tenant + permission
  // role without an extra lookup. `agencyId` is the organization id.
  await db
    .update(user)
    .set({ agencyId: organization.id, role: "admin", updatedAt: new Date() })
    .where(eq(user.id, res.user.id));

  await seedAgencyPermissions(organization.id);

  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    organizationId: organization.id,
    organizationRole: role,
  };
}

// Emails a reset link (dev logs it — see auth.ts sendResetPassword). Always
// resolves so the endpoint never reveals which addresses have accounts.
export async function requestPasswordReset(email: string): Promise<void> {
  await auth.api.requestPasswordReset({
    body: { email, redirectTo: `${webOrigin}/reset-password` },
  });
}

// Consumes a reset token and sets the new password. Throws on an invalid or
// expired token (mapped to a 400 in the controller).
export async function resetPassword(token: string, password: string): Promise<void> {
  await auth.api.resetPassword({ body: { token, newPassword: password } });
}
