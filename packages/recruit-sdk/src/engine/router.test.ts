import { expect, test } from "bun:test";
import type { Route } from "../types";
import { findBestMatchBranch, findRouteBySlug } from "./router";

const routes: Route[] = [
  {
    id: "root",
    path: "/",
    layout: "CoreLayout",
    page: "Home",
    children: ["roles", "roleDetail"],
  },
  { id: "roles", path: "roles", page: "RolesPage", children: [] },
  { id: "roleDetail", path: "roles/:id", page: "RoleDetailPage", children: [] },
];

test('findRouteBySlug: empty slug resolves the root "/" route', () => {
  expect(findRouteBySlug([], routes)?.map((r) => r.id)).toEqual(["root"]);
});

test('findRouteBySlug: a single [""] slug also resolves root', () => {
  expect(findRouteBySlug([""], routes)?.map((r) => r.id)).toEqual(["root"]);
});

test("findRouteBySlug: a static child resolves root -> child", () => {
  expect(findRouteBySlug(["roles"], routes)?.map((r) => r.id)).toEqual([
    "root",
    "roles",
  ]);
});

test('findRouteBySlug: a param segment matches the ":id" route', () => {
  expect(findRouteBySlug(["roles", "123"], routes)?.map((r) => r.id)).toEqual([
    "root",
    "roleDetail",
  ]);
});

test("findRouteBySlug: an unknown top-level slug returns null (404)", () => {
  expect(findRouteBySlug(["nope"], routes)).toBeNull();
});

test("findBestMatchBranch: a static segment outranks a param segment", () => {
  const candidates: Route[] = [
    { id: "static", path: "roles", page: "S", children: [] },
    { id: "param", path: ":anything", page: "P", children: [] },
  ];
  const map = new Map(candidates.map((r) => [r.id, r]));
  expect(
    findBestMatchBranch(["roles"], candidates, map)?.map((r) => r.id),
  ).toEqual(["static"]);
});
