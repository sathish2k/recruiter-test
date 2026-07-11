import { closeDb, connectDb } from "../src/db";

async function seed(): Promise<void> {
  await connectDb();
  console.log("Connected. Add seed data here.");
  await closeDb();
}

await seed();
