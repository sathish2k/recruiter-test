import { expect, test } from "bun:test";
import { seedRecord, seedRows } from "./seed-data";

// The engine injects `data={}` into a directly-bound renderer; useFetch skips
// fetching for anything that isn't undefined, so `{}` must normalise away.
test("seedRows: the engine's empty-object placeholder means fetch", () => {
  expect(seedRows({})).toBeUndefined();
});

test("seedRows: a real array is a seed, including an empty one", () => {
  const rows = [{ key: "sourced", count: 14 }];
  expect(seedRows(rows)).toBe(rows);
  expect(seedRows([])).toEqual([]);
});

test("seedRows: null/undefined mean fetch", () => {
  expect(seedRows(undefined)).toBeUndefined();
  expect(seedRows(null)).toBeUndefined();
});

test("seedRecord: the engine's empty-object placeholder means fetch", () => {
  expect(seedRecord({})).toBeUndefined();
  expect(seedRecord(undefined)).toBeUndefined();
});

test("seedRecord: a populated row is a seed", () => {
  const row = { openRoles: 6 };
  expect(seedRecord(row)).toBe(row);
});
