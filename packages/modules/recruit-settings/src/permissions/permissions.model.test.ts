import { describe, expect, it } from "bun:test";
import { PermissionsConfiguration as config } from "./permissions.configuration";
import {
  applyToggle,
  buildDrafts,
  diffDraft,
  isForced,
  type RoleRecord,
  serialize,
  summarise,
} from "./permissions.model";

const columns = config.columns;

const record = (
  permissions: RoleRecord["permissions"],
  scope: RoleRecord["scope"] = {},
): RoleRecord => ({
  role: "recruiter",
  system: true,
  label: null,
  description: null,
  icon: null,
  permissions,
  scope,
  updatedAt: null,
  updatedBy: null,
});

describe("applyToggle", () => {
  it("drags prerequisites on", () => {
    expect(applyToggle([], columns, "delete", true)).toEqual(["view", "edit", "delete"]);
  });

  it("drags dependants off", () => {
    const granted = applyToggle(
      ["view", "create", "edit", "delete", "export"],
      columns,
      "view",
      false,
    );
    expect(granted).toEqual([]);
  });

  it("clearing edit clears delete but leaves view and create", () => {
    const granted = applyToggle(["view", "create", "edit", "delete"], columns, "edit", false);
    expect(granted).toEqual(["view", "create"]);
  });

  it("returns columns in matrix order", () => {
    expect(applyToggle(["export", "view"], columns, "create", true)).toEqual([
      "view",
      "create",
      "export",
    ]);
  });
});

describe("isForced", () => {
  it("marks view as forced while anything depends on it", () => {
    expect(isForced(columns, ["view", "create"], "view")).toBe(true);
    expect(isForced(columns, ["view"], "view")).toBe(false);
  });
});

describe("buildDrafts", () => {
  it("maps stored actions onto columns", () => {
    const drafts = buildDrafts(
      [record([{ resource: "jobs", actions: ["read", "create"] }])],
      config,
    );
    expect(drafts.recruiter?.grants.jobs).toEqual(["view", "create"]);
  });

  it("shows a wildcard role as holding every row", () => {
    const drafts = buildDrafts([record([{ resource: "*", actions: ["read", "delete"] }])], config);
    expect(drafts.recruiter?.grants.billing).toEqual(["view", "delete"]);
  });

  it("defaults an unscoped resource to all", () => {
    const drafts = buildDrafts([record([], { jobs: "team" })], config);
    expect(drafts.recruiter?.scope.jobs).toBe("team");
    expect(drafts.recruiter?.scope.billing).toBe("all");
  });
});

describe("serialize", () => {
  it("keeps actions the matrix does not render", () => {
    const drafts = buildDrafts(
      [record([{ resource: "jobs", actions: ["read", "publish", "archive"] }])],
      config,
    );
    const draft = drafts.recruiter;
    if (!draft) throw new Error("no draft");
    const jobs = serialize(draft, config).permissions.find((entry) => entry.resource === "jobs");
    expect(jobs?.actions.sort()).toEqual(["archive", "publish", "read", "view"]);
  });

  it("writes both actions a column claims", () => {
    const drafts = buildDrafts([record([{ resource: "jobs", actions: ["edit"] }])], config);
    const draft = drafts.recruiter;
    if (!draft) throw new Error("no draft");
    const jobs = serialize(draft, config).permissions.find((entry) => entry.resource === "jobs");
    expect(jobs?.actions.sort()).toEqual(["edit", "update"]);
  });
});

describe("diffDraft", () => {
  const labels = {
    resource: (resource: string) => resource,
    column: (key: string) => key,
    scope: (scope: string) => scope,
  };

  it("reports nothing when the draft matches the baseline", () => {
    const drafts = buildDrafts([record([{ resource: "jobs", actions: ["read"] }])], config);
    const base = drafts.recruiter;
    const next = buildDrafts([record([{ resource: "jobs", actions: ["read"] }])], config).recruiter;
    if (!base || !next) throw new Error("no draft");
    expect(diffDraft(base, next, config, labels)).toEqual([]);
  });

  it("reports a grant and a scope move", () => {
    const base = buildDrafts(
      [record([{ resource: "jobs", actions: ["read"] }], { jobs: "own" })],
      config,
    ).recruiter;
    const next = buildDrafts(
      [record([{ resource: "jobs", actions: ["read", "create"] }], { jobs: "team" })],
      config,
    ).recruiter;
    if (!base || !next) throw new Error("no draft");
    const changes = diffDraft(base, next, config, labels);
    expect(changes).toEqual([
      { added: true, text: "create · jobs" },
      { added: true, text: "jobs: own → team" },
    ]);
  });
});

describe("summarise", () => {
  it("counts what the role reaches, and what it can destroy", () => {
    const drafts = buildDrafts(
      [
        record([
          { resource: "jobs", actions: ["read", "delete", "edit"] },
          { resource: "candidates", actions: ["read"] },
        ]),
      ],
      config,
    );
    const draft = drafts.recruiter;
    if (!draft) throw new Error("no draft");
    const totals = summarise(draft, config);
    expect(totals.reachable.map((r) => r)).toEqual(["jobs", "candidates"]);
    expect(totals.destructive).toEqual(["jobs"]);
    expect(totals.restricted).not.toContain("jobs");
  });
});
