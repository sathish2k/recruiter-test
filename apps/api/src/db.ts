import mongoose from "mongoose";

let connecting: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connecting) {
    const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
    const dbName = process.env.MONGODB_DB ?? "recruiter";
    connecting = mongoose.connect(uri, { dbName });
  }
  return connecting;
}

export async function closeDb(): Promise<void> {
  await mongoose.connection.close();
  connecting = null;
}
