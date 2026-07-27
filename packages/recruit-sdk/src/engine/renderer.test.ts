import { expect, test } from "bun:test";
import type { Configuration, Route } from "../types";
import { dependencyKey, generateRenderTree } from "./renderer";

const routes: Route[] = [
  { id: "root", path: "/", layout: "CoreLayout", children: ["home"] },
  { id: "home", path: "/", page: "HomePage", children: [] },
];

const configs: Configuration[] = [
  {
    id: "CoreLayout",
    template: "core",
    elements: [{ id: "outlet", type: "outlet", position: "main" }],
  },
  { id: "HomePage", elements: [] },
];

test("generateRenderTree collects the layout from a matched route", () => {
  const tree = generateRenderTree([routes[0], routes[1]], configs, routes, []);
  expect(tree?.layouts.map((l) => l.id)).toEqual(["CoreLayout"]);
});

test("generateRenderTree takes the page from the LAST matched route", () => {
  const tree = generateRenderTree([routes[0], routes[1]], configs, routes, []);
  expect(tree?.page?.id).toBe("HomePage");
});

test("generateRenderTree returns null when no routes matched", () => {
  expect(generateRenderTree(null, configs, routes, [])).toBeNull();
});

test("generateRenderTree skips a layout id that has no configuration", () => {
  const orphan: Route[] = [
    {
      id: "x",
      path: "/",
      layout: "DoesNotExist",
      page: "HomePage",
      children: [],
    },
  ];
  const tree = generateRenderTree(orphan, configs, orphan, []);
  expect(tree?.layouts).toEqual([]);
  expect(tree?.page?.id).toBe("HomePage");
});

// Dependencies (configuration/translation/data/datasource) all come from the
// ComponentDefinition, so they are keyed by component id. Keying by element id
// instead means a nested renderer config can never name its own translation
// bundle, and every translated cell silently falls back to raw keys.
test("dependencyKey uses the component id, not the page's element id", () => {
  expect(
    dependencyKey({
      id: "dashboard-priorities",
      type: "component",
      componentType: "Recruit.DashboardPriorities.Component",
    }),
  ).toBe("Recruit.DashboardPriorities.Component");
});

test("dependencyKey falls back to the element id for non-component elements", () => {
  expect(dependencyKey({ id: "Recruit.Core.Outlet.Layout", type: "outlet" })).toBe(
    "Recruit.Core.Outlet.Layout",
  );
});
