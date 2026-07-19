import { auth } from "../auth";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

export interface RegisterInput {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

// Creates an admin account for a new agency. Delegates credential + password
// handling to Better Auth so the hashing stays consistent with sign-in.
export async function registerAccount(input: RegisterInput) {
  const res = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.fullName,
      // ponytail: agency name stored directly as agencyId until an Agency model
      // exists — swap for a real agency lookup/create when tenants get built.
      agencyId: input.agency,
      role: "admin",
    },
  });
  return { id: res.user.id, email: res.user.email, name: res.user.name };
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
