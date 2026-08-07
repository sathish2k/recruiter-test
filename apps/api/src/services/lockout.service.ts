import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { loginHistory } from "../models/security.model";

/** Wrong passwords in a row before the account stops accepting sign-ins. */
export const MAX_FAILED_ATTEMPTS = 5;
/** How long it stays shut, measured from the attempt that tripped it. */
export const LOCKOUT_MINUTES = 15;

const LOCKOUT_MS = LOCKOUT_MINUTES * 60_000;

export interface LockoutState {
  locked: boolean;
  /** Seconds until the account accepts sign-ins again. Zero when unlocked. */
  retryAfter: number;
  /** Failures counted so far in the current run. */
  failures: number;
  /** Attempts left before the account locks. Zero once it has. */
  remaining: number;
}

const UNLOCKED: LockoutState = { locked: false, retryAfter: 0, failures: 0, remaining: 0 };

/**
 * Decides the lock from the attempt history alone — no counter column, no
 * unlock job. Rows are newest first.
 *
 * A sliding window: the account is shut while `MAX_FAILED_ATTEMPTS` failures sit
 * inside the last `LOCKOUT_MINUTES`. Three rules do the work:
 *
 * - Only `failed` rows count. A `blocked` row is what we write when we turn
 *   someone away, and counting those would let a locked-out user keep their own
 *   lock alive by retrying.
 * - A successful sign-in ends the run — failures before it are forgiven.
 * - Failures older than the window are ignored, which is what releases the lock
 *   without anything having to run on a timer.
 *
 * The wait is therefore the time until the *oldest* counted failure leaves the
 * window, because that is the moment the count drops below the limit. For the
 * usual burst of five wrong passwords in quick succession, that is the full
 * fifteen minutes.
 */
export function evaluateLockout(
  rows: { result: string; createdAt: Date }[],
  now: Date = new Date(),
): LockoutState {
  const cutoff = now.getTime() - LOCKOUT_MS;
  const counted: Date[] = [];

  for (const row of rows) {
    if (row.result === "success") break;
    if (row.result !== "failed") continue;
    if (row.createdAt.getTime() <= cutoff) break;
    counted.push(row.createdAt);
  }

  const failures = counted.length;
  const oldest = counted[counted.length - 1];
  if (failures < MAX_FAILED_ATTEMPTS || !oldest) {
    return { ...UNLOCKED, failures, remaining: Math.max(0, MAX_FAILED_ATTEMPTS - failures) };
  }

  const retryAfter = Math.ceil((oldest.getTime() + LOCKOUT_MS - now.getTime()) / 1000);
  if (retryAfter <= 0) return { ...UNLOCKED, failures, remaining: MAX_FAILED_ATTEMPTS };

  return { locked: true, retryAfter, failures, remaining: 0 };
}

/** The current lock for an address. An address with no history is never locked. */
export async function getLockoutState(email: string): Promise<LockoutState> {
  // `blocked` rows are excluded in SQL, not just ignored afterwards: someone
  // hammering a locked account writes one per attempt, and they would otherwise
  // fill the row limit and push the failures that justify the lock out of sight.
  const rows = await db
    .select({ result: loginHistory.result, createdAt: loginHistory.createdAt })
    .from(loginHistory)
    .where(and(eq(loginHistory.email, email), inArray(loginHistory.result, ["failed", "success"])))
    .orderBy(desc(loginHistory.createdAt))
    .limit(MAX_FAILED_ATTEMPTS + 1);

  return evaluateLockout(rows);
}
