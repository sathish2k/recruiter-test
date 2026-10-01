import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db, schema } from "./db";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "admin", input: true },
      agencyId: { type: "string", required: false, input: true },
      status: { type: "string", required: false, defaultValue: "active", input: false },
      phone: { type: "string", required: false, input: true },
      timezone: { type: "string", required: false, input: true },
    },
  },
  plugins: [bearer()],
  trustedOrigins: [webOrigin],
});

export type Auth = typeof auth;
