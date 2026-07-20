import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { db, schema } from "./db";
import { isEmailConfigured, sendEmail } from "./lib/mailjet";

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      if (!isEmailConfigured()) {
        console.warn(`[auth] mail not configured — reset link for ${user.email}: ${url}`);
        return;
      }
      await sendEmail({
        to: { email: user.email, name: user.name },
        subject: "Reset your password",
        html: `<p>We received a request to reset your password. Use the link below (valid for 1 hour):</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        text: `Reset your password using this link (valid for 1 hour): ${url}`,
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "admin", input: true },
      agencyId: { type: "string", required: false, input: true },
      status: { type: "string", required: false, defaultValue: "active", input: false },
      phone: { type: "string", required: false, input: true },
      timezone: { type: "string", required: false, input: true },
    },
  },
  // Accept `Authorization: Bearer <token>` (the SDK httpClient sends the session
  // token this way) in addition to the session cookie.
  plugins: [bearer()],
  trustedOrigins: [webOrigin],
});

export type Auth = typeof auth;
