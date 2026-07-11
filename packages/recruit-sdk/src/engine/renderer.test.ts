import { expect, test } from "bun:test";
import type { Configuration, Route } from "../types";
import { generateRenderTree } from "./renderer";

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
