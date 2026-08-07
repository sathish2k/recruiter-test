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

  // The engine falls back to this id when a slug matches nothing, so a missing
  // page (or a renamed component behind it) silently downgrades the 404 to the
  // SDK's untranslated built-in.
  it("registers the not-found fallback page the engine looks for", () => {
    expect(configurationIds.has("Recruit.NotFound.Page")).toBe(true);
    expect(componentIds.has("Recruit.NotFound.Component")).toBe(true);
  });

  // A `routeId` naming a route that doesn't exist resolves to no path, so the
  // link renders and goes nowhere. This is the compile step for that.
  //
  // These ten are nav entries for screens that have not been built yet — they
  // are listed rather than deleted so the debt stays visible, and so the
  // assertion still catches a *new* dangling id (or a typo like the Audit Log
  // one, which pointed at `Recruit.AuditLog.Route` while the screen has always
  // been `Recruit.SettingsAuditLog.Route`). Delete an entry when its route lands.
  const UNBUILT_ROUTES = new Set([
    "Recruit.AiScreening.Route",
    "Recruit.Analytics.Route",
    "Recruit.Automation.Route",
    "Recruit.Commissions.Route",
    "Recruit.Interviews.Route",
    "Recruit.Messages.Route",
    "Recruit.Notifications.Route",
    "Recruit.Pipeline.Route",
    "Recruit.Placements.Route",
    "Recruit.TeamActivity.Route",
  ]);

  it("every routeId referenced in a configuration names a real route", () => {
    const ids = new Set(routes.map((route) => route.id));
    const dangling = new Set<string>();
    const walk = (value: unknown) => {
      if (Array.isArray(value)) {
        for (const entry of value) walk(entry);
        return;
      }
      if (!value || typeof value !== "object") return;
      for (const [key, entry] of Object.entries(value)) {
        if (key === "routeId" && typeof entry === "string") {
          if (!ids.has(entry) && !UNBUILT_ROUTES.has(entry)) dangling.add(entry);
        } else walk(entry);
      }
    };
    for (const module of AllModules) {
      for (const component of module.components) {
        walk((component.defaults ?? component.default)?.configuration?.value);
      }
    }
    walk(allConfigurations);
    expect([...dangling]).toEqual([]);
  });

  // The detail screens introduced `:id` siblings next to static children, so
  // these assert that "new" and "import" still beat the wildcard.
  it.each([
    [["jobs", "new"], "Recruit.JobNew.Route"],
    [["jobs", "abc"], "Recruit.JobDetail.Route"],
    [["jobs", "abc", "edit"], "Recruit.JobEdit.Route"],
    [["candidates", "import"], "Recruit.CandidateImport.Route"],
    [["candidates", "board"], "Recruit.CandidateBoard.Route"],
    [["candidates", "abc"], "Recruit.CandidateDetail.Route"],
    [["candidates", "abc", "edit"], "Recruit.CandidateEdit.Route"],
    [["settings"], "Recruit.Settings.Route"],
    [["settings", "branding"], "Recruit.SettingsBranding.Route"],
    [["settings", "localization"], "Recruit.SettingsLocalization.Route"],
    [["settings", "templates"], "Recruit.EmailTemplates.Route"],
  ])("%p resolves to %s", (slug, expected) => {
    const branch = findRouteBySlug(slug as string[], routes);
    expect(branch?.at(-1)?.id).toBe(expected as string);
  });
});
