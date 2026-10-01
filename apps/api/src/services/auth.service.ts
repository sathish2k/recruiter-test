import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../models/auth";
import { provisionSignup } from "./organization.service";

export interface RegisterInput {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

// The user is created first, so a duplicate email fails before any agency is
// made. agencyId is denormalised onto the user so the session carries the
// tenant without a second lookup.
export async function registerAccount(input: RegisterInput) {
  const res = await auth.api.signUpEmail({
    body: { email: input.email, password: input.password, name: input.fullName },
  });

  const { organization, role } = await provisionSignup({
    userId: res.user.id,
    organizationName: input.agency,
  });

  await db
    .update(user)
    .set({ agencyId: organization.id, role: "admin", updatedAt: new Date() })
    .where(eq(user.id, res.user.id));

  return {
    id: res.user.id,
    email: res.user.email,
    name: res.user.name,
    organizationId: organization.id,
    organizationRole: role,
  };
}
