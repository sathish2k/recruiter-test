import { describe, expect, it } from "bun:test";
import { evaluateLockout, LOCKOUT_MINUTES, MAX_FAILED_ATTEMPTS } from "./lockout.service";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);

/**
 * A burst of wrong passwords, all at the same moment — which is what the real
 * thing looks like, and keeps the arithmetic in the assertions readable.
 * Newest first, the order the query returns.
 */
const failures = (count: number, atMinutesAgo = 0) =>
  Array.from({ length: count }, () => ({ result: "failed", createdAt: minutesAgo(atMinutesAgo) }));

describe("evaluateLockout", () => {
  it("leaves a clean history unlocked", () => {
    expect(evaluateLockout([], NOW)).toMatchObject({ locked: false, failures: 0 });
  });

  it("counts failures short of the limit without locking", () => {
    const state = evaluateLockout(failures(MAX_FAILED_ATTEMPTS - 1), NOW);
    expect(state.locked).toBe(false);
    expect(state.failures).toBe(MAX_FAILED_ATTEMPTS - 1);
    expect(state.remaining).toBe(1);
  });

  it("locks on the limit and reports the full wait", () => {
    const state = evaluateLockout(failures(MAX_FAILED_ATTEMPTS), NOW);
    expect(state.locked).toBe(true);
    expect(state.remaining).toBe(0);
    expect(state.retryAfter).toBe(LOCKOUT_MINUTES * 60);
  });

  it("counts down as the burst ages", () => {
    const state = evaluateLockout(failures(MAX_FAILED_ATTEMPTS, 5), NOW);
    expect(state.locked).toBe(true);
    expect(state.retryAfter).toBe((LOCKOUT_MINUTES - 5) * 60);
  });

  it("releases once the failures age out of the window", () => {
    const stale = failures(MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES + 1);
    expect(evaluateLockout(stale, NOW)).toMatchObject({ locked: false, failures: 0 });
  });

  it("unlocks exactly at the window edge", () => {
    expect(evaluateLockout(failures(MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES), NOW).locked).toBe(false);
  });

  it("a success ends the run, so older failures are forgiven", () => {
    const rows = [
      { result: "success", createdAt: minutesAgo(1) },
      ...failures(MAX_FAILED_ATTEMPTS, 2),
    ];
    expect(evaluateLockout(rows, NOW)).toMatchObject({ locked: false, failures: 0 });
  });

  it("does not add failures from before a success onto the current run", () => {
    const rows = [
      ...failures(MAX_FAILED_ATTEMPTS),
      { result: "success", createdAt: minutesAgo(6) },
      ...failures(3, 7),
    ];
    const state = evaluateLockout(rows, NOW);
    expect(state.locked).toBe(true);
    expect(state.failures).toBe(MAX_FAILED_ATTEMPTS);
  });

  it("ignores blocked rows, so retrying while locked cannot extend the lock", () => {
    // The burst that tripped the lock was 14 minutes ago; every retry since has
    // written a `blocked` row. One minute of the wait must still be left, not a
    // fresh fifteen.
    const rows = [
      { result: "blocked", createdAt: minutesAgo(0) },
      { result: "blocked", createdAt: minutesAgo(1) },
      { result: "blocked", createdAt: minutesAgo(2) },
      ...failures(MAX_FAILED_ATTEMPTS, 14),
    ];
    const state = evaluateLockout(rows, NOW);
    expect(state.locked).toBe(true);
    expect(state.retryAfter).toBe(60);
  });

  it("one more failure after the window reopens does not re-lock on its own", () => {
    const rows = [...failures(1), ...failures(MAX_FAILED_ATTEMPTS, LOCKOUT_MINUTES + 1)];
    const state = evaluateLockout(rows, NOW);
    expect(state.locked).toBe(false);
    expect(state.failures).toBe(1);
    expect(state.remaining).toBe(MAX_FAILED_ATTEMPTS - 1);
  });
});
