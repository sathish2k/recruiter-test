import { randomUUID } from "node:crypto";
import { count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { invoice, subscription, usageMetric } from "../models/billing.model";
import { organizationMember } from "../models/organization.model";

type SubscriptionRow = typeof subscription.$inferSelect;
type InvoiceRow = typeof invoice.$inferSelect;
type UsageRow = typeof usageMetric.$inferSelect;

/** Indian digit grouping, whole rupees — matches the design's `₹2,88,000`. */
function rupees(paise: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(paise / 100)}`;
}

function longDate(date?: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  agency: "Agency",
};

/** Plan → which of the plan-feature tiles are ticked. */
const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["aiMatching", "resumeParser", "browserExtension", "emailTemplates"],
  growth: [
    "aiMatching",
    "resumeParser",
    "browserExtension",
    "whiteLabel",
    "careerPages",
    "emailTemplates",
  ],
  agency: [
    "aiMatching",
    "resumeParser",
    "browserExtension",
    "whiteLabel",
    "careerPages",
    "emailTemplates",
    "apiAccess",
    "sso",
  ],
};

async function ensureSubscription(organizationId: string): Promise<SubscriptionRow | undefined> {
  const [existing] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.organizationId, organizationId));
  if (existing) return existing;
  const renewsAt = new Date();
  renewsAt.setFullYear(renewsAt.getFullYear() + 1);
  const [created] = await db.insert(subscription).values({ organizationId, renewsAt }).returning();
  return created;
}

async function ensureUsage(organizationId: string): Promise<UsageRow | undefined> {
  const period = currentPeriod();
  const [existing] = await db
    .select()
    .from(usageMetric)
    .where(eq(usageMetric.organizationId, organizationId));
  if (existing && existing.period === period) return existing;
  const [created] = await db
    .insert(usageMetric)
    .values({ id: randomUUID(), organizationId, period })
    .returning();
  return created;
}

function mapInvoice(row: InvoiceRow) {
  return {
    id: row.id,
    number: row.number,
    date: longDate(row.issuedAt),
    plan: row.plan,
    amount: rupees(row.amount),
    status: row.status,
  };
}

export async function listInvoices(organizationId: string) {
  const rows = await db
    .select()
    .from(invoice)
    .where(eq(invoice.organizationId, organizationId))
    .orderBy(desc(invoice.issuedAt));
  return { data: rows.map(mapInvoice), totalCount: rows.length };
}

/** Everything the Billing tab renders, in one round trip. */
export async function getBillingOverview(organizationId: string) {
  const [sub, usage, seatRows, invoices] = await Promise.all([
    ensureSubscription(organizationId),
    ensureUsage(organizationId),
    db
      .select({ total: count() })
      .from(organizationMember)
      .where(eq(organizationMember.organizationId, organizationId)),
    listInvoices(organizationId),
  ]);
  if (!sub) return null;

  const seatUsed = seatRows[0]?.total ?? 0;
  const monthly = Math.round(sub.priceAnnual / 12);
  const credits = usage?.aiCreditsTotal ?? 5000;
  const creditsUsed = usage?.aiCreditsUsed ?? 0;

  return {
    plan: {
      key: sub.plan,
      name: PLAN_LABELS[sub.plan] ?? sub.plan,
      status: sub.status,
      price: rupees(sub.priceAnnual),
      monthly: rupees(monthly),
      seatTotal: sub.seatTotal,
    },
    seats: {
      used: seatUsed,
      total: sub.seatTotal,
      available: Math.max(0, sub.seatTotal - seatUsed),
      percent: sub.seatTotal ? Math.round((seatUsed / sub.seatTotal) * 100) : 0,
      extraSeatPrice: rupees(sub.seatPriceMonthly),
    },
    usage: {
      creditsUsed,
      creditsTotal: credits,
      creditsLabel: `${creditsUsed.toLocaleString("en-IN")} / ${credits.toLocaleString("en-IN")}`,
      percent: credits ? Math.round((creditsUsed / credits) * 100) : 0,
      resumeParsing: (usage?.resumeParsing ?? 0).toLocaleString("en-IN"),
      candidateMatches: (usage?.candidateMatches ?? 0).toLocaleString("en-IN"),
      emailsSent: (usage?.emailsSent ?? 0).toLocaleString("en-IN"),
      storage: `${((usage?.storageUsed ?? 0) / 1_073_741_824).toFixed(1)} GB`,
    },
    payment: {
      brand: sub.paymentBrand ?? "—",
      last4: sub.paymentLast4 ? `•••• •••• •••• ${sub.paymentLast4}` : "No card on file",
      expiry: sub.paymentExpiry,
      email: sub.billingEmail,
      renewsAt: sub.renewsAt ? `${longDate(sub.renewsAt)} · ${rupees(sub.priceAnnual)}` : "—",
      billingName: sub.billingName,
      gstin: sub.gstin,
      address: sub.billingAddress,
    },
    features: PLAN_FEATURES[sub.plan] ?? [],
    invoices: invoices.data,
  };
}

export async function changeSeats(organizationId: string, delta: number) {
  const sub = await ensureSubscription(organizationId);
  if (!sub) return null;
  const [seatRows] = await db
    .select({ total: count() })
    .from(organizationMember)
    .where(eq(organizationMember.organizationId, organizationId));
  const used = seatRows?.total ?? 0;
  const next = sub.seatTotal + delta;
  // Never drop below the seats actually occupied, or below one.
  if (next < Math.max(1, used)) return { blocked: true as const };
  const [updated] = await db
    .update(subscription)
    .set({ seatTotal: next, updatedAt: new Date() })
    .where(eq(subscription.organizationId, organizationId))
    .returning();
  return updated ? { blocked: false as const, seatTotal: updated.seatTotal } : null;
}

export async function changePlan(organizationId: string, plan: string) {
  const prices: Record<string, number> = {
    starter: 9_600_000,
    growth: 28_800_000,
    agency: 60_000_000,
  };
  const seats: Record<string, number> = { starter: 2, growth: 5, agency: 100 };
  if (!(plan in prices)) return null;
  await ensureSubscription(organizationId);
  const [updated] = await db
    .update(subscription)
    .set({
      plan,
      priceAnnual: prices[plan] as number,
      seatTotal: seats[plan] as number,
      updatedAt: new Date(),
    })
    .where(eq(subscription.organizationId, organizationId))
    .returning();
  return updated ? { plan: updated.plan, name: PLAN_LABELS[updated.plan] } : null;
}

export interface PaymentInput {
  paymentBrand?: string;
  paymentLast4?: string;
  paymentExpiry?: string;
  billingEmail?: string;
  billingName?: string;
  gstin?: string;
  billingAddress?: string;
}

export async function updatePayment(organizationId: string, input: PaymentInput) {
  await ensureSubscription(organizationId);
  const [updated] = await db
    .update(subscription)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(subscription.organizationId, organizationId))
    .returning();
  return updated ?? null;
}
