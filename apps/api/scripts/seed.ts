import { closeDb, connectDb } from "../src/db";
import { ClientModel } from "../src/models/client.model";

const AGENCY = "demo";

const clients = [
  {
    name: "Nortech",
    industry: "Enterprise SaaS",
    manager: "Riya Kapoor",
    status: "hiring",
    openRoles: 8,
    hires: 6,
    sourced: 296,
    screened: 98,
    interviewing: 18,
    activity: "Last activity 2h ago",
  },
  {
    name: "Fablio",
    industry: "Consumer Fintech",
    manager: "Riya Kapoor",
    status: "hiring",
    openRoles: 6,
    hires: 4,
    sourced: 224,
    screened: 80,
    interviewing: 14,
    activity: "Last activity 4h ago",
  },
  {
    name: "Vantor",
    industry: "AI / ML Platform",
    manager: "Dev Shah",
    status: "hiring",
    openRoles: 5,
    hires: 3,
    sourced: 198,
    screened: 76,
    interviewing: 12,
    activity: "Last activity 1d ago",
  },
  {
    name: "Corely",
    industry: "HR Tech",
    manager: "Dev Shah",
    status: "hiring",
    openRoles: 3,
    hires: 2,
    sourced: 104,
    screened: 38,
    interviewing: 6,
    activity: "Last activity 1d ago",
  },
  {
    name: "Mistvale",
    industry: "Healthcare",
    manager: "Riya Kapoor",
    status: "paused",
    openRoles: 2,
    hires: 2,
    sourced: 62,
    screened: 19,
    interviewing: 3,
    activity: "Last activity 6d ago",
  },
  {
    name: "Orbex",
    industry: "Logistics",
    manager: "Dev Shah",
    status: "paused",
    openRoles: 0,
    hires: 1,
    sourced: 28,
    screened: 7,
    interviewing: 1,
    activity: "Last activity 2w ago",
  },
] as const;

async function seed(): Promise<void> {
  await connectDb();
  await ClientModel.deleteMany({ agencyId: AGENCY });
  await ClientModel.insertMany(
    clients.map((c) => ({ ...c, agencyId: AGENCY })),
  );
  console.log(`Seeded ${clients.length} clients.`);
  await closeDb();
}

await seed();
