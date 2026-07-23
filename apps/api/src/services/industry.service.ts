import { asc } from "drizzle-orm";
import { db } from "../db";
import { industry } from "../models/industry.model";

/** The industry catalogue, ordered for the picker. */
export async function listIndustries() {
  const rows = await db
    .select({ name: industry.name })
    .from(industry)
    .orderBy(asc(industry.sortOrder), asc(industry.name));
  return { data: rows };
}
