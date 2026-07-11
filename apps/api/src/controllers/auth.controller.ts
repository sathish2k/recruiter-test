import { status } from "elysia";
import type { JwtSigner } from "../plugins/jwt";
import {
  type Credentials,
  registerAccount,
  type RegisterInput,
  verifyCredentials,
} from "../services/auth.service";

export async function register(ctx: { body: RegisterInput }) {
  try {
    return status(201, await registerAccount(ctx.body));
  } catch (e) {
    if ((e as { code?: number }).code === 11000) {
      return status(409, "Email already registered");
    }
    throw e;
  }
}

export async function login(ctx: { body: Credentials; jwt: JwtSigner }) {
  const user = await verifyCredentials(ctx.body);
  if (!user) return status(401, "Invalid email or password");
  const token = await ctx.jwt.sign({
    sub: user.id,
    agencyId: user.agencyId,
    role: user.role,
  });
  return { token, user };
}
