import mongoose from "mongoose";
import { closeDb, connectDb } from "../src/db";

// Wipes every collection so an e2e run starts from an empty database.
await connectDb();
const db = mongoose.connection.db;
if (!db) throw new Error("No database connection");
const collections = await db.listCollections().toArray();
for (const c of collections) {
  await db.collection(c.name).deleteMany({});
}
console.log(`Cleared ${collections.length} collections.`);
await closeDb();
