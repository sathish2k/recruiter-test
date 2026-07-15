// Standalone Bun seed script for E2E setup that the HTTP API can't express.
// Currently: insert an ACTIVE employee into an existing agency. The invite
// endpoint only creates "invited" users (there is no accept-invite flow yet),
// but the pipeline recruiter strip + owner assignment need an *active* employee,
// so we insert one directly, reusing the API's own model.
//
// Run from apps/api (so its .env / Mongo config load), e.g.:
//   SEED_AGENCY=... SEED_EMAIL=... SEED_NAME=... bun run <path>/db-seed.ts
import { closeDb, connectDb } from "../apps/api/src/db";
import { UserModel } from "../apps/api/src/models/user.model";

// biome-ignore-start lint/suspicious/noUndeclaredEnvVars: E2E-only seed inputs, not a Turbo task.
const agencyId = process.env.SEED_AGENCY;
const email = process.env.SEED_EMAIL;
const name = process.env.SEED_NAME ?? "Seed Employee";
// biome-ignore-end lint/suspicious/noUndeclaredEnvVars: E2E-only seed inputs, not a Turbo task.

if (!agencyId || !email) {
  throw new Error("SEED_AGENCY and SEED_EMAIL are required");
}

await connectDb();
await UserModel.create({
  agencyId,
  email: email.toLowerCase(),
  name,
  role: "employee",
  status: "active",
  // Never logged in as; a placeholder hash satisfies the required field.
  passwordHash: "seed-not-a-real-hash",
});
console.log(`Seeded active employee ${email} into agency ${agencyId}`);
await closeDb();
