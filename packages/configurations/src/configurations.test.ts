import { describe, expect, it } from "bun:test";
import { findRouteBySlug } from "@recruit/sdk";
import { AllModules, allConfigurations, routes } from "./index";

/**
 * The engine resolves ids at render time, so a page pointing at a component id
 * that no module registers is a blank screen rather than a build error. These
 * assertions are the compile step the configuration layer doesn't have.
 */

const componentIds = new Set(
  AllModules.flatMap((module) => module.components.map((component) => component.id)),
);
const configurationIds = new Set(allConfigurations.map((configuration) => configuration.id));

describe("configurations", () => {
  it("every page element points at a registered component", () => {
    const missing: string[] = [];
    for (const configuration of allConfigurations) {
      for (const element of configuration.elements ?? []) {
        if (element.type === "component" && !componentIds.has(element.componentType ?? "")) {
          missing.push(`${configuration.id} → ${element.componentType}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("every nested configuration element resolves", () => {
    const missing: string[] = [];
    for (const configuration of allConfigurations) {
      for (const element of configuration.elements ?? []) {
        if (
          element.type === "configuration" &&
          !configurationIds.has(element.configurationId ?? "")
        ) {
          missing.push(`${configuration.id} → ${element.configurationId}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("every route names a page (or a layout-only branch) that exists", () => {
    const missing = routes
      .filter((route) => route.page && !configurationIds.has(route.page))
      .map((route) => `${route.id} → ${route.page}`);
    expect(missing).toEqual([]);
  });

  it("every child id names a route", () => {
    const ids = new Set(routes.map((route) => route.id));
    const missing = routes.flatMap((route) =>
      (route.children ?? [])
        .filter((child) => !ids.has(child))
        .map((child) => `${route.id} → ${child}`),
    );
    expect(missing).toEqual([]);
  });

  it("route ids are unique", () => {
    const ids = routes.map((route) => route.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  // The detail screens introduced `:id` siblings next to static children, so
  // these assert that "new" and "import" still beat the wildcard.
  it.each([
    [["jobs", "new"], "Recruit.JobNew.Route"],
    [["jobs", "abc"], "Recruit.JobDetail.Route"],
    [["jobs", "abc", "edit"], "Recruit.JobEdit.Route"],
    [["candidates", "import"], "Recruit.CandidateImport.Route"],
    [["candidates", "abc"], "Recruit.CandidateDetail.Route"],
    [["candidates", "abc", "edit"], "Recruit.CandidateEdit.Route"],
  ])("%p resolves to %s", (slug, expected) => {
    const branch = findRouteBySlug(slug as string[], routes);
    expect(branch?.at(-1)?.id).toBe(expected as string);
  });
});
